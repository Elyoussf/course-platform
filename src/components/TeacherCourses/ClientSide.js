'use client';

import React, { useState } from 'react';
import { Clock, Users, BookOpen, Edit3, Check, X, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CoursesClient({ user, courses }) {
  const router = useRouter();
  const [editingPrice, setEditingPrice] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCourseClick = (courseId) => {
    router.push(`/Courses?id=${courseId}`);
  };

  const startEditingPrice = (e, courseId, currentPrice) => {
    e.stopPropagation(); // Prevent course navigation
    setEditingPrice(courseId);
    setTempPrice(currentPrice.toString());
  };

  const cancelEditingPrice = (e) => {
    e.stopPropagation();
    setEditingPrice(null);
    setTempPrice('');
  };

  const savePrice = async (e, courseId) => {
    e.stopPropagation();
    
    // Validate price
    const price = parseFloat(tempPrice);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsUpdating(true);
    
    try {
      const res = await fetch('/api/teacher',{
        method : 'POST',
        body:JSON.stringify({
          email: user.email,
          price : price,
          courseId: courseId
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      setEditingPrice(null);
      setTempPrice('');
    } catch (error) {
      console.error('Failed to update price:', error);
      alert('Failed to update price. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const PriceDisplay = ({ course, isMobile = false }) => {
    const isEditing = editingPrice === course.id;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              className="bg-gray-700 border border-blue-500 rounded-lg pl-8 pr-3 py-2 text-white text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') savePrice(e, course.id);
                if (e.key === 'Escape') cancelEditingPrice(e);
              }}
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => savePrice(e, course.id)}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-1.5 rounded-md transition-colors duration-200"
              title="Save price"
            >
              {isUpdating ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={cancelEditingPrice}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-1.5 rounded-md transition-colors duration-200"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative flex items-center gap-2 flex-shrink-0">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ${course.price}
        </div>
        {user.teacher && (
          <button
            onClick={(e) => startEditingPrice(e, course.id, course.price)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white p-1.5 rounded-md"
            title="Edit price"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}
      </div>
    );
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
                      <PriceDisplay course={course} isMobile={true} />
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
                    <PriceDisplay course={course} />
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}