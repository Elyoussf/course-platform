
import CoursesClient from "./ClientSide";


export default async function ServerSideTeacher({ user, courses }) {
   return ( <CoursesClient user= {user} courses={courses}/>)
} 