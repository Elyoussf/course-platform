import React from 'react';
import { BookOpen } from 'lucide-react';
import {prisma} from '@/lib/prisma';
import {auth} from '@/lib/auth';
import { CoursesList } from '@/components/CoursesList/CourseList';
import ServerSideTeacher from '@/components/TeacherCourses/ServerSide'
export default async function Space() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-gray-400">You need to be logged in to access your courses.</p>
        </div>
      </div>
    );
  }
  
  const user = await prisma.user.findUnique({
    where: { email },
     
    select: {
      courses: {
        include: {
          course: true
        }
      },
      student: true,
      teacher: true,
      name: true,
      createdCourses: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          numberofsubscribed: true, // Explicitly select this field
          SubCourses: {
            select: {
              id: true,
              title: true,
              description: true,
              link: true
            }
          },
          _count: {
            select: { users: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-gray-400">We couldn't find your account. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  if (!user.student && !user.teacher) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">You need to be registered as a student or teacher to access this area.</p>
        </div>
      </div>
    );
  }
  
  return (
    user.student?
    <CoursesList user= {user}/> :
    <ServerSideTeacher 
      user={{
        email,
        name: user.name,
        student: user.student,
        teacher: user.teacher
      }}
      courses={user.courses}
    />
  );
}