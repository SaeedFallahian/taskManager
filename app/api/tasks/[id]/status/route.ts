import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import db, { connectDB } from '@/lib/surrealdb';
import { RecordId } from 'surrealdb';

type Task = {
  id: string;
  status: string;
  project: { tb: string; id: string };
  assignee: string;
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const { id } = await params; // Await params to get id
    const taskId = new RecordId('tasks', id);
    const task = await db.select<Task>(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if user is project author or assignee
    const project = await db.select(new RecordId('projects', task.project.id));
    if (project.author !== user.id && task.assignee !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedTask = await db.merge<Task>(taskId, { status });
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    console.error('UPDATE TASK STATUS ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to update task status', details: error.message },
      { status: 500 }
    );
  }
}