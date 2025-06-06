import { NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import db, { connectDB } from '@/lib/surrealdb';
import { RecordId } from 'surrealdb';

type Project = {
  id: string;
  name: string;
  description: string;
  summary: string;
  created_at: string;
  deadline: string;
  author: string;
  authorName: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '0') || 0;

    await connectDB();

    let sql = `SELECT * FROM projects ORDER BY created_at DESC`;
    if (limit > 0) {
      sql += ` LIMIT ${limit}`;
    }

    const result = await db.query<Project[]>(sql);
    let projects: Project[] = [];
    if (Array.isArray(result)) {
      projects = Array.isArray(result[0]) ? result[0] : result;
    } else if (Array.isArray((result[0] as any)?.result)) {
      projects = (result[0] as { result: Project[] }).result;
    }

    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(project.author);
          const authorName =
            clerkUser.username ||
            clerkUser.firstName ||
            clerkUser.fullName ||
            (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
              ? clerkUser.emailAddresses[0].emailAddress
              : 'Unknown User');
          return { ...project, authorName };
        } catch (error: any) {
          console.error(`Error fetching user ${project.author}:`, error.message);
          return { ...project, authorName: 'Unknown User' };
        }
      })
    );

    return NextResponse.json(enrichedProjects, { status: 200 });
  } catch (error: any) {
    console.error('FETCH PROJECTS ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { name, description, summary, deadline } = await request.json();
    if (!name || !summary || !deadline) {
      return NextResponse.json({ error: 'Name, summary, and deadline are required' }, { status: 400 });
    }

    await connectDB();
    const newProject = await db.create('projects', {
      name,
      description: description || '',
      summary,
      deadline: new Date(deadline),
      author: user.id,
      created_at: new Date(),
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    console.error('CREATE PROJECT ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const projectId = new RecordId('projects', id);
    const project = await db.select(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.author !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.delete(projectId);
    return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE PROJECT ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to delete project', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const { name, description, summary, deadline } = await req.json();
    if (!name || !summary || !deadline) {
      return NextResponse.json({ error: 'Name, summary, and deadline are required' }, { status: 400 });
    }

    await connectDB();
    const projectId = new RecordId('projects', id);
    const project = await db.select(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.author !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedProject = await db.merge(projectId, {
      name,
      description: description || '',
      summary,
      deadline: new Date(deadline),
    });

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error: any) {
    console.error('UPDATE PROJECT ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to update project', details: error.message },
      { status: 500 }
    );
  }
}