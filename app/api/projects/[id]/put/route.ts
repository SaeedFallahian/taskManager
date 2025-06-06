import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import db, { connectDB } from '@/lib/surrealdb';
import { RecordId } from 'surrealdb';

type Project = {
  id: string;
  name: string;
  description: string;
  summary: string;
  author: string;
  created_at: string;
  deadline: string;
};

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const projectId = new RecordId('projects', id);

    const { name, description, summary, deadline } = await req.json();
    if (!name || !description || !summary || !deadline) {
      return NextResponse.json({ error: 'Name, description, summary, and deadline are required' }, { status: 400 });
    }

    const project = await db.select<Project>(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.author !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedProject = await db.merge<Project>(projectId, {
      name,
      description,
      summary,
      deadline: new Date(deadline),
    });

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error: any) {
    console.error('UPDATE ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to update project', details: error.message },
      { status: 500 }
    );
  }
}