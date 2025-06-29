// pages/api/auth/set-user-type.js (if using Pages Router)
// OR app/api/auth/set-user-type/route.js (if using App Router)

import {prisma} from '@/lib/prisma'
import { NextResponse } from 'next/server';


export async function POST(request) {
  const { email, userType } = await request.json();

  if (!email || !userType) {
    return NextResponse.json({ message: 'Email and userType are required' }, { status: 400 });
  }

  try {
    await prisma.user.upsert({
      where: { email },
      update: {
        student: userType === 'student',
        teacher: userType === 'teacher',
      },
      create: {
        email,
        student: userType === 'student',
        teacher: userType === 'teacher',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
