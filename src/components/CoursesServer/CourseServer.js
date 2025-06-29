// CourseDetailsServer.jsx - Server Component
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth'; // Adjust path based on your auth setup
import CourseDetailsClient from '../CoursesClient/CourseClient';

// Initialize Prisma client
const prisma = new PrismaClient();

const CourseDetailsServer = async ({ searchParams, courseId: propCourseId }) => {
  // Get user session
  const session = await auth();
  const email = session?.user?.email;
  
  // Support multiple ways to pass course ID
  const courseId = propCourseId || await searchParams?.id;

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl">
          <p className="text-red-400 mb-4">No course ID provided in URL parameters</p>
          <a 
            href="/courses"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
          >
            Back to Courses
          </a>
        </div>
      </div>
    );
  }

  try {
    // Fetch course with subcourses using Prisma
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      },
      include: {
        SubCourses: {
          orderBy: {
            title: 'asc'
          }
        }
      }
    });

    if (!course) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center p-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl">
            <p className="text-red-400 mb-4">Course not found</p>
            <a 
              href="/courses"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              Back to Courses
            </a>
          </div>
        </div>
      );
    }

    // Check if user is subscribed to this course
    let isUserSubscribed = false;
    let user;
    if (email) {
      // First, find the user by email
       user = await prisma.user.findUnique({
        where: {
          email: email
        }
      });
      
      if (user) {
        
        // Check if user is subscribed to this course
        const userSubscription = await prisma.userCourse.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: courseId
            }
          }
        });
       
        isUserSubscribed = !!userSubscription;
      }
    }

    // SECURITY: Filter subcourse data based on subscription status
    const secureSubCourses = course.SubCourses.map((subcourse, index) => {
      const isFirstModule = index === 0;
      const isAccessible = isUserSubscribed || isFirstModule;
      
      if (isAccessible) {
        // Return full data for accessible modules
        return subcourse;
      } else {
        // Return only safe data for locked modules
        return {
          id: subcourse.id,
          title: subcourse.title,
          courseId: subcourse.courseId,
          // Don't include description and link for security
          description: null,
          link: null,
          _isLocked: true // Internal flag for client component
        };
      }
    });

    // Create secure course object
    const secureCourse = {
      ...course,
      SubCourses: secureSubCourses
    };
    console.log(user.teacher)
    // Pass the secure course data and subscription status to the client component
    return (
      <CourseDetailsClient 
        course={secureCourse} 
        isUserSubscribed={isUserSubscribed}
        userEmail={email}
        isteacher = {user.teacher}
      />
    );

  } catch (error) {
    console.error('Error fetching course:', error);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl">
          <p className="text-red-400 mb-4">Failed to load course data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  } finally {
    // Clean up Prisma connection
    await prisma.$disconnect();
  }
};

export default CourseDetailsServer;