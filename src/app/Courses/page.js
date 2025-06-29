import CourseDetailsServer from '@/components/CoursesServer/CourseServer'

export default async  function CourseDetails({searchParams}){
  return (
    <CourseDetailsServer searchParams={searchParams} />
  )
}