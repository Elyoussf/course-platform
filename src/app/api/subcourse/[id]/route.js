import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth'; // Adjust path based on your auth setup

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    // Get user session
    const session = await auth();
    const email = session?.user?.email;

    const subcourseId = params.id;

    if (!subcourseId) {
      return NextResponse.json(
        { error: 'Subcourse ID is required' },
        { status: 400 }
      );
    }

    // Fetch the subcourse with its parent course
    const subcourse = await prisma.subCourse.findUnique({
      where: {
        id: subcourseId
      },
      include: {
        course: {
          include: {
            SubCourses: {
              select: { id: true },
              orderBy: { title: 'asc' }
            }
          }
        }
      }
    });

    if (!subcourse) {
      return NextResponse.json(
        { error: 'Subcourse not found' },
        { status: 404 }
      );
    }

    // Determine if this is the first module
    const allSubcourses = subcourse.course.SubCourses;
    const subcourseIndex = allSubcourses.findIndex(sc => sc.id === subcourseId);
    const isFirstModule = subcourseIndex === 0;

    // Check if user is subscribed
    let isUserSubscribed = false;
    
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (user) {
        const userSubscription = await prisma.userCourse.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: subcourse.courseId
            }
          }
        });

        isUserSubscribed = !!userSubscription;
      }
    }

    
    const hasAccess = isUserSubscribed || isFirstModule;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please subscribe to access this content.' },
        { status: 403 }
      );
    }

    // Return the secure subcourse content
    return NextResponse.json({
      id: subcourse.id,
      title: subcourse.title,
      description: subcourse.description,
      link: subcourse.link,
      courseId: subcourse.courseId
    });

  } catch (error) {
    console.error('Error fetching subcourse:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}