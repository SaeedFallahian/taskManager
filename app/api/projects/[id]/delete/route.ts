import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import db, { connectDB } from '@/lib/surrealdb';
import { RecordId } from 'surrealdb';

type Project = {
  id: string;
  name: string;
  description: string;
  progress: number;
  author: string;
  created_at: string;
};

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'کاربر احراز هویت نشده' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const projectId = new RecordId('projects', id);

    console.log('DELETE ID =>', id);
    console.log('RECORD ID =>', projectId.toString());

    const project = await db.select<Project>(projectId);
    if (!project) {
      return NextResponse.json({ error: 'پروژه یافت نشد' }, { status: 404 });
    }
    if (project.author !== user.id) {
      return NextResponse.json({ error: 'عدم دسترسی' }, { status: 403 });
    }

    console.log(`Before deleting project: ${projectId}`);
    await db.delete(projectId);
    console.log('DELETE RESULT =>', 'Project deleted');

    return NextResponse.json({ message: 'پروژه با موفقیت حذف شد' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE ERROR =>', error.message);
    return NextResponse.json(
      { error: 'خطا در حذف پروژه', details: error.message },
      { status: 500 }
    );
  }
}