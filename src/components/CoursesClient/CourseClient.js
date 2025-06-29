// CourseDetailsClient.jsx - Client Component with Teacher Edit Mode
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, BookOpen, Clock, DollarSign, Lock, Edit2, Save, X, Plus } from 'lucide-react';

const CourseDetailsClient = ({ course, isUserSubscribed = false, isteacher = false }) => {
  
  const [expandedSubcourses, setExpandedSubcourses] = useState(new Set());
  const [subcourseContent, setSubcourseContent] = useState(new Map());
  const [loadingSubcourses, setLoadingSubcourses] = useState(new Set());
  
  // Edit mode states
  const [editMode, setEditMode] = useState({});
  const [editedData, setEditedData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    price: course?.price || '',
    duration: course?.otherDetails?.duration || '',
    level: course?.otherDetails?.level || '',
    language: course?.otherDetails?.language || '',
    certificate: course?.otherDetails?.certificate || false,
    subcourses: course?.SubCourses?.map(sub => ({
      id: sub.id,
      title: sub.title,
      description: sub.description || '',
      link: sub.link || ''
    })) || []
  });

  const loadSubcourseContent = async (subcourseId) => {
    if (subcourseContent.has(subcourseId)) {
      return;
    }

    setLoadingSubcourses(prev => new Set(prev).add(subcourseId));

    try {
      const response = await fetch(`/api/subcourse/${subcourseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load content');
      }

      const content = await response.json();
      setSubcourseContent(prev => new Map(prev).set(subcourseId, content));
    } catch (error) {
      console.error('Error loading subcourse content:', error);
    } finally {
      setLoadingSubcourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(subcourseId);
        return newSet;
      });
    }
  };

  const toggleSubcourse = async (subcourseId, isLocked) => {
    if (isLocked && !isteacher) return;
    
    const wasExpanded = expandedSubcourses.has(subcourseId);
    
    setExpandedSubcourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcourseId)) {
        newSet.delete(subcourseId);
      } else {
        newSet.add(subcourseId);
      }
      return newSet;
    });

    if (!wasExpanded && !subcourseContent.has(subcourseId)) {
      await loadSubcourseContent(subcourseId);
    }
  };

  const toggleEditMode = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async (field) => {
    // Here you would send the data to your API
    console.log(`Saving ${field}:`, editedData[field]);
    
    // TODO: Implement API call to save changes
    // const response = await fetch('/api/course/update', {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ field, value: editedData[field], courseId: course.id })
    // });
    
    setEditMode(prev => ({ ...prev, [field]: false }));
  };

  const handleCancel = (field) => {
    // Reset to original value
    if (field === 'title') setEditedData(prev => ({ ...prev, title: course?.title || '' }));
    if (field === 'description') setEditedData(prev => ({ ...prev, description: course?.description || '' }));
    if (field === 'price') setEditedData(prev => ({ ...prev, price: course?.price || '' }));
    // Add other field resets as needed
    
    setEditMode(prev => ({ ...prev, [field]: false }));
  };

  const handleSubcourseChange = (index, field, value) => {
    setEditedData(prev => ({
      ...prev,
      subcourses: prev.subcourses.map((sub, i) => 
        i === index ? { ...sub, [field]: value } : sub
      )
    }));
  };

  const addNewSubcourse = () => {
    setEditedData(prev => ({
      ...prev,
      subcourses: [...prev.subcourses, {
        id: `new-${Date.now()}`,
        title: 'New Module',
        description: '',
        link: ''
      }]
    }));
  };

  const removeSubcourse = (index) => {
    setEditedData(prev => ({
      ...prev,
      subcourses: prev.subcourses.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const EditableField = ({ field, value, placeholder, multiline = false, type = "text" }) => {
    if (!isteacher) {
      return multiline ? (
        <p className="text-lg text-gray-200 leading-relaxed">{value}</p>
      ) : (
        <span>{value}</span>
      );
    }

    return editMode[field] ? (
      <div className="flex items-center space-x-2">
        {multiline ? (
          <textarea
            value={editedData[field] || ''}
            onChange={(e) => setEditedData(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder={placeholder}
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
            rows={3}
          />
        ) : (
          <input
            type={type}
            value={editedData[field] || ''}
            onChange={(e) => setEditedData(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder={placeholder}
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        )}
        <button
          onClick={() => handleSave(field)}
          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => handleCancel(field)}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    ) : (
      <div className="flex items-center space-x-2 group">
        {multiline ? (
          <p className="text-lg text-gray-200 leading-relaxed flex-1">{value}</p>
        ) : (
          <span className="flex-1">{value}</span>
        )}
        <button
          onClick={() => toggleEditMode(field)}
          className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 hover:bg-blue-700 rounded transition-all"
        >
          <Edit2 className="w-3 h-3 text-white" />
        </button>
      </div>
    );
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl">
          <p className="text-red-400 mb-4">No course data available</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Teacher Mode Indicator */}
        {isteacher && (
          <div className="mb-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-lg border border-blue-700/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Edit2 className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-blue-300">Teacher Mode</h3>
                <p className="text-blue-200/80 text-xs">
                  Hover over content to edit. Changes will be saved automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Course Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 mr-3 text-purple-300" />
                <span className="text-sm font-medium text-purple-200">Course</span>
                {isUserSubscribed && (
                  <span className="ml-4 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-xs text-green-300 font-medium">
                    Subscribed
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
                <EditableField 
                  field="title" 
                  value={editedData.title} 
                  placeholder="Course Title"
                />
              </h1>
              <EditableField 
                field="description" 
                value={editedData.description} 
                placeholder="Course Description"
                multiline={true}
              />
            </div>
          </div>
          
          {/* Course Info */}
          <div className="p-6 bg-gray-800/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-green-400">
                  <EditableField 
                    field="price" 
                    value={`${editedData.price} DH`} 
                    placeholder="Price"
                    type="number"
                  />
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-gray-300">
                  <EditableField 
                    field="duration" 
                    value={editedData.duration || 'Duration not specified'} 
                    placeholder="Duration"
                  />
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Updated {formatDate(course.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Notice for Non-Subscribers */}
        {!isUserSubscribed && !isteacher && (
          <div className="mb-6 bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-lg border border-amber-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Lock className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-semibold text-amber-300">Preview Mode</h3>
                <p className="text-amber-200/80 text-sm">
                  You can access the first module for free. Subscribe to unlock all course content.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subcourses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Course Modules
            </h2>
            {isteacher && (
              <button
                onClick={addNewSubcourse}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Module</span>
              </button>
            )}
          </div>
          
          {editedData.subcourses && editedData.subcourses.length > 0 ? (
            editedData.subcourses.map((subcourse, index) => {
              const isFirstModule = index === 0;
              const isLocked = !isUserSubscribed && !isFirstModule && !isteacher;
              const isExpanded = expandedSubcourses.has(subcourse.id);
              const isLoading = loadingSubcourses.has(subcourse.id);
              
              const contentData = subcourseContent.get(subcourse.id) || subcourse;
              const hasFullContent = contentData.description && contentData.link;
              
              return (
                <div 
                  key={subcourse.id}
                  className={`rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
                    isLocked 
                      ? 'bg-gray-800/20 backdrop-blur-lg border border-gray-800/50 opacity-60' 
                      : 'bg-gray-800/50 backdrop-blur-lg border border-gray-700 hover:shadow-purple-500/10 hover:border-purple-500/50 hover:bg-gray-800/70'
                  }`}
                >
                  <button
                    onClick={() => toggleSubcourse(subcourse.id, isLocked)}
                    disabled={isLocked}
                    className={`w-full p-6 text-left flex items-center justify-between transition-colors focus:outline-none ${
                      isLocked 
                        ? 'cursor-not-allowed' 
                        : 'hover:bg-gray-700/30 focus:ring-2 focus:ring-purple-500 focus:ring-inset cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-lg ${
                        isLocked 
                          ? 'bg-gray-700/50' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-gray-500" />
                        ) : (
                          <span className="text-white font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 flex-1">
                        <h3 className={`text-lg font-semibold ${
                          isLocked ? 'text-gray-500' : 'text-white'
                        }`}>
                          {isteacher ? (
                            <input
                              value={subcourse.title}
                              onChange={(e) => handleSubcourseChange(index, 'title', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-transparent border-none outline-none focus:bg-gray-700 focus:px-2 focus:py-1 focus:rounded transition-all"
                            />
                          ) : (
                            subcourse.title
                          )}
                        </h3>
                        {isLocked && (
                          <div className="flex items-center space-x-1">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Locked</span>
                          </div>
                        )}
                        {isFirstModule && !isUserSubscribed && !isteacher && (
                          <span className="px-2 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-xs text-green-300 font-medium">
                            Free Preview
                          </span>
                        )}
                        {isteacher && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSubcourse(index);
                            }}
                            className="p-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {!isLocked && (
                        isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 hover:text-purple-400 transition-colors" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 hover:text-purple-400 transition-colors" />
                        )
                      )}
                    </div>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded && !isLocked ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6">
                      <div className="ml-14 space-y-4">
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                            <span className="text-gray-400 text-sm">Loading content...</span>
                          </div>
                        ) : (
                          <>
                            {isteacher ? (
                              <div className="space-y-3">
                                <textarea
                                  value={subcourse.description}
                                  onChange={(e) => handleSubcourseChange(index, 'description', e.target.value)}
                                  placeholder="Module description..."
                                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 resize-none"
                                  rows={3}
                                />
                                <input
                                  value={subcourse.link}
                                  onChange={(e) => handleSubcourseChange(index, 'link', e.target.value)}
                                  placeholder="Module link..."
                                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
                                />
                              </div>
                            ) : hasFullContent ? (
                              <>
                                <p className="text-gray-300 leading-relaxed">{contentData.description}</p>
                                <a
                                  href={contentData.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg hover:shadow-purple-500/25"
                                >
                                  <span>Start Module</span>
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                              </>
                            ) : (
                              <div className="text-red-400 text-sm">
                                Failed to load content. Please try again.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-8 text-center">
              <p className="text-gray-400">No modules available for this course yet.</p>
            </div>
          )}
        </div>

        {/* Subscription CTA for Non-Subscribers */}
        {!isUserSubscribed && !isteacher && (
          <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-lg border border-purple-700/50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Unlock Full Access</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Get unlimited access to all {editedData.subcourses?.length || 0} modules, downloadable resources, 
              and lifetime updates for just <span className="text-green-400 font-bold">{editedData.price}DH</span>
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105">
              Subscribe Now
            </button>
          </div>
        )}

        {/* Course Details */}
        {course.otherDetails && Object.keys(course.otherDetails).length > 0 && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Course Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.otherDetails.level || isteacher) && (
                <div>
                  <span className="font-medium text-gray-300">Level:</span>
                  <span className="ml-2 text-gray-400">
                    <EditableField 
                      field="level" 
                      value={editedData.level || 'Not specified'} 
                      placeholder="Course Level"
                    />
                  </span>
                </div>
              )}
              {(course.otherDetails.language || isteacher) && (
                <div>
                  <span className="font-medium text-gray-300">Language:</span>
                  <span className="ml-2 text-gray-400">
                    <EditableField 
                      field="language" 
                      value={editedData.language || 'Not specified'} 
                      placeholder="Course Language"
                    />
                  </span>
                </div>
              )}
              {isteacher && (
                <div>
                  <span className="font-medium text-gray-300">Certificate:</span>
                  <span className="ml-2 text-gray-400">
                    {editMode.certificate ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={editedData.certificate}
                          onChange={(e) => setEditedData(prev => ({ ...prev, certificate: e.target.value === 'true' }))}
                          className="p-1 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value="true">Included</option>
                          <option value="false">Not included</option>
                        </select>
                        <button
                          onClick={() => handleSave('certificate')}
                          className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
                        >
                          <Save className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => handleCancel('certificate')}
                          className="p-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 group">
                        <span>{editedData.certificate ? 'Included' : 'Not included'}</span>
                        <button
                          onClick={() => toggleEditMode('certificate')}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 hover:bg-blue-700 rounded transition-all"
                        >
                          <Edit2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    )}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-300">Created:</span>
                <span className="ml-2 text-gray-400">{formatDate(course.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsClient;