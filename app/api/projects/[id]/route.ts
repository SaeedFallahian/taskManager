import { NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import db, { connectDB } from '@/lib/surrealdb';
import { RecordId } from 'surrealdb';

type Project = {
  id: string;
  name: string;
  description: string;
  summary: string;
  author: string;
  authorName: string;
  created_at: string;
  deadline: string;
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('Requested GET ID:', id);

    await connectDB();
    const projectId = new RecordId('projects', id);
    console.log('Constructed RecordId:', projectId.toString());

    const project = await db.select<Project>(projectId);
    console.log('Selected Project:', project);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(project.author);
    const authorName =
      clerkUser.username ||
      clerkUser.firstName ||
      clerkUser.fullName ||
      (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
        ? clerkUser.emailAddresses[0].emailAddress
        : 'Unknown User');

    return NextResponse.json({ ...project, authorName }, { status: 200 });
  } catch (error: any) {
    console.error('GET PROJECT ERROR:', {
      message: error.message,
      stack: error.stack,
      params,
    });
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error.message },
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
    console.log('Requested DELETE ID:', id);

    await connectDB();
    const projectId = new RecordId('projects', id);
    console.log('Constructed RecordId:', projectId.toString());

    const project = await db.select(projectId);
    console.log('Selected Project:', project);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.author !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.delete(projectId);
    console.log('Project deleted successfully:', projectId.toString());

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE PROJECT ERROR:', {
      message: error.message,
      stack: error.stack,
      params,
    });
    return NextResponse.json(
      { error: 'Failed to delete project', details: error.message },
      { status: 500 }
    );
  }
}