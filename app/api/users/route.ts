import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList();
    const userList = users.data.map(user => ({
      id: user.id,
      name: user.username ||
        user.firstName ||
        user.fullName ||
        (user.emailAddresses && user.emailAddresses.length > 0
          ? user.emailAddresses[0].emailAddress
          : 'Unknown User'),
    }));
    return NextResponse.json(userList, { status: 200 });
  } catch (error: any) {
    console.error('FETCH USERS ERROR =>', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}