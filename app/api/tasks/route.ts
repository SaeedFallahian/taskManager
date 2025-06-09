import { NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import db, { connectDB } from '@/lib/surrealdb';
import { RecordId } from 'surrealdb';

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  project: string;
  created_at: string;
  deadline: string;
  assignee: string;
  assigneeName: string;
};

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { title, description, projectId, deadline, assignee } = await request.json();
    if (!title || !projectId || !deadline || !assignee) {
      return NextResponse.json({ error: 'Title, project ID, deadline, and assignee are required' }, { status: 400 });
    }

    await connectDB();
    const project = await db.select(new RecordId('projects', projectId));
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.author !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate deadline
    if (new Date(deadline) > new Date(project.deadline as string)) {
      return NextResponse.json({ error: 'Task deadline cannot be after project deadline' }, { status: 400 });
    }

    // Validate assignee
    const clerk = await clerkClient();
    const assigneeUser = await clerk.users.getUser(assignee);
    if (!assigneeUser) {
      return NextResponse.json({ error: 'Assignee not found' }, { status: 400 });
    }

    const newTask = await db.create('tasks', {
      title,
      description: description || '',
      status: 'pending',
      project: new RecordId('projects', projectId),
      created_at: new Date(),
      deadline: new Date(deadline),
      assignee,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error('CREATE TASK ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await connectDB();
    const tasks = await db.query<Task[]>(`SELECT * FROM tasks WHERE project = projects:${projectId}`);
    let taskList: Task[] = [];
    if (Array.isArray(tasks)) {
      taskList = Array.isArray(tasks[0]) ? tasks[0] : tasks;
    } else if (Array.isArray((tasks[0] as any)?.result)) {
      taskList = (tasks[0] as { result: Task[] }).result;
    }

    // Enrich tasks with assignee names
    const clerk = await clerkClient();
    const enrichedTasks = await Promise.all(
      taskList.map(async (task) => {
        try {
          const assigneeUser = await clerk.users.getUser(task.assignee);
          const assigneeName =
            assigneeUser.username ||
            assigneeUser.firstName ||
            assigneeUser.fullName ||
            (assigneeUser.emailAddresses && assigneeUser.emailAddresses.length > 0
              ? assigneeUser.emailAddresses[0].emailAddress
              : 'Unknown User');
          return { ...task, assigneeName };
        } catch (error: any) {
          console.error(`Error fetching assignee ${task.assignee}:`, error.message);
          return { ...task, assigneeName: 'Unknown User' };
        }
      })
    );

    return NextResponse.json(enrichedTasks, { status: 200 });
  } catch (error: any) {
    console.error('FETCH TASKS ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Task ID and status are required' }, { status: 400 });
    }
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const taskId = new RecordId('tasks', id);
    const task = await db.select<Task>(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if user is the project author
    const project = await db.select(new RecordId('projects', task.project.split(':')[1]));
    if (!project || project.author !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedTask = await db.merge(taskId, { status });
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    console.error('UPDATE TASK ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to update task', details: error.message },
      { status: 500 }
    );
  }
}