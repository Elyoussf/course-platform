import styles from './AuthForm.module.css'
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export function AuthForm(){
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');
const [userType, setUserType] = useState('student'); // New state for user type
const searchParams = useSearchParams();
const error = searchParams.get('error');

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setMessage('');
try {
// First, set the user type in the database
await fetch('/api/auth/set-user-type', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    userType,
  }),
});

const result = await signIn('email', {
email,
redirect: false,
callbackUrl: '/',
 });
if (result?.error) {
setMessage('Something went wrong. Please try again.');
 } else {
setMessage('Check your email for a sign-in link!');
 }
 } catch (error) {
setMessage('An error occurred. Please try again.');
 } finally {
setLoading(false);
 }
 };

return (
<div className={styles.container}>
<div className={styles.card}>
{/* Modern Switch Button */}
<div className={styles.switch_container}>
<div className={styles.switch_wrapper}>
<input
type="checkbox"
id="userTypeSwitch"
className={styles.switch_input}
checked={userType === 'teacher'}
onChange={(e) => setUserType(e.target.checked ? 'teacher' : 'student')}
/>
<label htmlFor="userTypeSwitch" className={styles.switch_label}>
<span className={styles.switch_slider}></span>
</label>
<div className={styles.switch_text}>
<span className={userType === 'student' ? styles.active_text : styles.inactive_text}>
Student
</span>
<span className={userType === 'teacher' ? styles.active_text : styles.inactive_text}>
Teacher
</span>
</div>
</div>
</div>

<h1 className={styles.title}>Sign In</h1>
{error && (
<div className={styles.error_box}>
{error === 'MissingCSRF' && 'Security error. Please try again.'}
{error === 'Verification' && 'The sign in link is no longer valid.'}
{!['MissingCSRF', 'Verification'].includes(error) && 'An error occurred.'}
</div>
 )}
<form onSubmit={handleSubmit}>
<div className={styles.input_group}>
<input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className={styles.input}
 placeholder="you@example.com"
 required
/>
</div>
{message && (
<div
 className={`${styles.message_box} ${
message.includes('Check your email') ? styles.success : styles.error
}`}
>
{message}
</div>
 )}
<button type="submit" disabled={loading} className={styles.submit_btn}>
{loading ? 'Sending...' : 'Send Magic Link'}
</button>
</form>
</div>
</div>
 )
}