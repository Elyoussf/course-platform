'use client';

import React from 'react';
import { Clock, Users, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function CoursesClient({ user, courses }) {
    const router = useRouter()
  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCourseClick = (courseId) => {
    
    router.push(`/Courses?id=${courseId}`)
  };

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.email.split('@')[0]}!
            </h1>
            <p className="text-gray-400">
              {user.teacher ? 'Manage your created courses' : 'Explore your enrolled courses'}
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <BookOpen className="w-20 h-20 text-gray-600 mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-3">No Courses Yet</h3>
            <p className="text-gray-400 text-center max-w-md text-lg">
              {user.teacher 
                ? "You haven't created any courses yet. Start by creating your first course to share your knowledge with students."
                : "You haven't enrolled in any courses yet. Browse available courses to start learning."
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.email.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-400">
            {user.teacher ? `You have ${courses.length} created course${courses.length !== 1 ? 's' : ''}` : 'Your enrolled courses'}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="w-full">
          {/* Mobile: Horizontal Scroll */}
          <div className="block md:hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {courses.map((course) => (
                
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course.id)}
                  className="flex-shrink-0 w-80 bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-700 hover:border-blue-500/50"
                >
                  {/* Course Header */}
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white truncate flex-1 mr-3">
                        {course.title}
                      </h3>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0">
                        ${course.price}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed overflow-hidden">
                      {course.description}
                    </p>
                  </div>

                  {/* Course Stats */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{course.numberofsubscribed} students</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>{course.SubCourses?.length || 0} lessons</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Created {formatDate(course.createdAt)}</span>
                    </div>

                    {/* Subcourses Preview */}
                    {/* {course.SubCourses && course.SubCourses.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Course Content</p>
                        <div className="space-y-1">
                          {course.SubCourses.slice(0, 3).map((subCourse, index) => (
                            <div key={subCourse.id} className="text-sm text-gray-300 flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                              <span className="truncate">{subCourse.title}</span>
                            </div>
                          ))}
                          {course.SubCourses.length > 3 && (
                            <div className="text-xs text-gray-500 ml-3.5">
                              +{course.SubCourses.length - 3} more lessons
                            </div>
                          )}
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-700 hover:border-blue-500/50 flex flex-col"
              >
                {/* Course Header */}
                <div className="p-6 border-b border-gray-700 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white truncate flex-1 mr-3">
                      {course.title}
                    </h3>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0">
                      ${course.price}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed overflow-hidden">
                    {course.description}
                  </p>
                </div>

                {/* Course Stats */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{course.numberofsubscribed || 0} students</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{course.SubCourses?.length || 0} lessons</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Created {formatDate(course.createdAt)}</span>
                  </div>

                  {/* Subcourses Preview */}
                  {/* {course.SubCourses && course.SubCourses.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Course Content</p>
                      <div className="space-y-1">
                        {course.SubCourses.slice(0, 3).map((subCourse, index) => (
                          <div key={subCourse.id} className="text-sm text-gray-300 flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                            <span className="truncate">{subCourse.title}</span>
                          </div>
                        ))}
                        {course.SubCourses.length > 3 && (
                          <div className="text-xs text-gray-500 ml-3.5">
                            +{course.SubCourses.length - 3} more lessons
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}