// src/lib/auth.js
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma.js';
import EmailProvider from 'next-auth/providers/email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Custom adapter to handle student/teacher fields
function CustomPrismaAdapter(p) {
  const defaultAdapter = PrismaAdapter(p);
  
  return {
    ...defaultAdapter,
    createUser: async (data) => {
      return await p.user.create({
        data: {
          ...data,
          student: false,  // Default value
          teacher: false,  // Default value
        },
      });
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
adapter: CustomPrismaAdapter(prisma),
providers: [
EmailProvider({
// Minimal server config to satisfy NextAuth requirements
server: {
host: 'localhost',
port: 587,
auth: {
user: '',
pass: '',
 },
 },
from: process.env.EMAIL_FROM,
// Override sendVerificationRequest to use Resend instead of Nodemailer
sendVerificationRequest: async ({ identifier, url, provider }) => {
const { host } = new URL(url);
try {
const result = await resend.emails.send({
from: process.env.EMAIL_FROM,
to: identifier,
subject: `Sign in to ${host}`,
html: generateEmailHTML({ url, host }),
text: generateEmailText({ url, host }),
 });
console.log('Email sent successfully:', result);
 } catch (error) {
console.error('Error sending email:', error);
throw new Error(`Could not send email to ${identifier}: ${error.message}`);
 }
 },
 maxAge: 10 * 60, // Link expires in 10 minutes
 }),
 ],
 session: {
 strategy: 'jwt', // Keep JWT strategy as requested
 },
 secret: process.env.AUTH_SECRET, // NextAuth v5 uses AUTH_SECRET
 pages: {
 signIn: '/login',
 verifyRequest: '/auth/verify-request',
 },
 debug: true, // Add debug to see what's happening
 trustHost: true, // Fix CSRF issues in development
 callbacks: {
async signIn({ user, account, profile, email, credentials }) {
  // This runs after successful email verification
  try {
    console.log('SignIn callback triggered');
    console.log('Account:', account);
    console.log('User:', user);
    
    // For email provider, we need to check the request URL
    // The userType should be in the original callback URL
    if (account?.provider === 'email' && user?.email) {
      // Try to get userType from URL search params during callback
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const userType = urlParams.get('userType');
        
        if (userType) {
          console.log(`Setting user type to: ${userType} for email: ${user.email}`);
          
          await prisma.user.update({
            where: { email: user.email },
            data: {
              student: userType === 'student',
              teacher: userType === 'teacher',
            },
          });
          
          console.log(`Successfully updated user type for: ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error('Error updating user type:', error);
  }
  
  return true;
},

async session({ session, token }) {
  // Add user type info to session
  if (session?.user?.email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true,
          student: true, 
          teacher: true 
        },
      });
      
      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.student = dbUser.student;
        session.user.teacher = dbUser.teacher;
        session.user.userType = dbUser.student ? 'student' : 'teacher';
      }
    } catch (error) {
      console.error('Error fetching user data for session:', error);
    }
  }
  
  return session;
},

async jwt({ token, user, account }) {
  // Add user ID to token when user first signs in
  if (user) {
    token.userId = user.id;
  }
  
  return token;
},
 },
});

// Email templates
function generateEmailHTML({ url, host }) {
return `
<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Sign in to ${host}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 40px 20px;">
 <table role="presentation" style="width: 100%; max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
 <tr>
 <td style="padding: 40px; text-align: center;">
 <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #1a202c;">
 Sign in to ${host}
 </h1>
 <p style="margin: 0 0 30px 0; font-size: 16px; color: #4a5568; line-height: 1.5;">
 Click the button below to securely sign in. This link will expire in 10 minutes.
 </p>
 <a href="${url}"
 style="display: inline-block; background: #3182ce; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
 Sign In
 </a>
 <p style="margin: 30px 0 0 0; font-size: 14px; color: #718096;">
 If you didn't request this email, you can safely ignore it.
 </p>
 </td>
 </tr>
 </table>
</body>
</html>`;
}

function generateEmailText({ url, host }) {
return `Sign in to ${host}\n\nClick this link to sign in:\n${url}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this email, you can safely ignore it.`;
}