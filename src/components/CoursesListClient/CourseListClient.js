'use client';

import { useState, useMemo } from 'react';
import { Search, Grid, List, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
export function CourseListClient({ subscribedCourses, allCourses, subscribedIds }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'horizontal', 'vertical', 'grid'
  const router = useRouter()
  const subscribedIdsSet = new Set(subscribedIds);

  // Filter courses based on search term
  const filteredSubscribedCourses = useMemo(() => {
    return subscribedCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subscribedCourses, searchTerm]);

  const filteredAllCourses = useMemo(() => {
    return allCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCourses, searchTerm]);

  const CourseCard = ({ course, isSubscribed = false }) => (
    <div 
      className={`
        group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
        ${viewMode === 'horizontal' ? 'min-w-[300px] max-w-[300px] flex-shrink-0' : 
          viewMode === 'vertical' ? 'w-full max-w-4xl mx-auto' : 
          'w-full'
        }
        bg-gradient-to-br from-gray-800 to-gray-900 
        rounded-2xl shadow-lg border border-gray-700 hover:border-gray-600
        overflow-hidden h-fit
      `}
      onClick={() => {
        // Handle course click - to be implemented later
        router.push(`/Courses?id=${course.id}`)
      }}
    >
      {/* Course Header with Gradient */}
      <div className={`
        ${viewMode === 'vertical' ? 'h-20' : 'h-24'} 
        bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 relative overflow-hidden
      `}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-3 right-3">
          {isSubscribed && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              ✓ Enrolled
            </span>
          )}
        </div>
      </div>
      
      {/* Course Content */}
      <div className={`${viewMode === 'vertical' ? 'p-5' : 'p-6'}`}>
        <h3 className={`
          ${viewMode === 'vertical' ? 'text-lg' : 'text-xl'} 
          font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors
        `}>
          {course.title}
        </h3>
        <p className={`
          text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed
          ${viewMode === 'vertical' ? 'line-clamp-2' : ''}
        `}>
          {course.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className={`${viewMode === 'vertical' ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
            DH{course.price.toFixed(2)}
          </div>
          {!isSubscribed && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const CourseSection = ({ title, courses, isSubscribed = false }) => {
    if (courses.length === 0) {
      return (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>
          <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
            <div className="text-gray-400 text-lg">
              {isSubscribed ? "You're not enrolled in any courses yet." : "No courses found."}
            </div>
            {searchTerm && (
              <div className="text-gray-500 text-sm mt-2">
                Try adjusting your search terms
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <div className="text-gray-400 text-sm">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Responsive Container */}
        <div className={`
          ${viewMode === 'horizontal' ? 
            'overflow-x-auto' :
            viewMode === 'vertical' ?
            'max-h-[70vh] overflow-y-auto' :
            ''
          }
          ${viewMode !== 'grid' ? 'scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600' : ''}
        `}>
          <div className={`
            ${viewMode === 'horizontal' ? 
              'flex space-x-6 pb-4 scroll-smooth snap-x snap-mandatory min-w-max' :
              viewMode === 'vertical' ?
              'flex flex-col space-y-4 pr-2' :
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
            }
          `}>
            {courses.map(course => (
              <div 
                key={course.id} 
                className={`
                  ${viewMode === 'horizontal' ? 'snap-center' : ''}
                  ${viewMode === 'vertical' ? 'flex-shrink-0' : ''}
                `}
              >
                <CourseCard 
                  course={course} 
                  isSubscribed={isSubscribed || subscribedIdsSet.has(course.id)} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Course Library</h1>
          <p className="text-gray-400">Discover and access your learning journey</p>
        </div>

        {/* Search and View Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-800 rounded-xl p-1 border border-gray-700">
            <button
              onClick={() => setViewMode('horizontal')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'horizontal' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Horizontal scroll"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('vertical')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'vertical' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Vertical scroll"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Course Sections */}
        <CourseSection 
          title="My Courses" 
          courses={filteredSubscribedCourses} 
          isSubscribed={true}
        />
        
        <CourseSection 
          title="All Courses" 
          courses={filteredAllCourses} 
          isSubscribed={false}
        />
      </div>
    </div>
  );
}