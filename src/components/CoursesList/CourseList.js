import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CourseListClient } from '../CoursesListClient/CourseListClient';
import { redirect } from 'next/navigation';

export async function CoursesList({user}) {
  const session = await auth();
  const email = session?.user?.email;
  
  if (!email) {
    redirect('/Login')
  }

  // Fetch user and their subscribed courses
  // const user = await prisma.user.findUnique({
  //   where: { email },
  //   include: {
  //     courses: {
  //       include: {
  //         course: true
  //       }
  //     }
  //   }
  // });

  const allCourses = await prisma.course.findMany();
  const subscribedIds = new Set(user?.courses.map(c => c.courseId));
  const subscribedCourses = user?.courses.map(c => c.course) || [];
  
  return (
    <CourseListClient 
      subscribedCourses={subscribedCourses}
      allCourses={allCourses}
      subscribedIds={Array.from(subscribedIds)}
    />
  );
}