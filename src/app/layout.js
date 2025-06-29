
import "./globals.css";
import {auth} from '@/lib/auth'
export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang="en">
      <head>
        <style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Winky+Rough:ital,wght@0,300..900;1,300..900&display=swap');
</style>
      </head>
      <body>
        <nav id="nav">
          <div className="about_login">
            <a href="/About">About</a>
          </div>
          {session?
          <div className="about_login">
            <p>Hello {session.user?.email.split('@')[0]}</p>
          </div>:
          <div className="about_login">
            <a href="/Login">Login</a>
          </div>
        }
          
        </nav>
        {children}
      </body>
    </html>
  );
}
