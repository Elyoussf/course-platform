
import styles from './page.module.css'
import { auth } from '../lib/auth.js';

import { redirect } from 'next/navigation';
export default async function Home() {
  const session = await auth();

  return (
      session ? 
      // <></>
      redirect('/Space')
      :
      <div id={styles.landing_cont}>
    <h1 id={styles.hook}>Get fluent in days, <span id={styles.not_months}>not months</span></h1>
    <p id={styles.hook_desc}>Learn <span className={styles.Any}>Any</span>time , <span className={styles.Any}>Any</span >where , <span className={styles.Any}>Any</span>how</p>
    <p id={styles.hook_desc}>Perfect series of courses for <span className={styles.every}>every</span> level to reach <span className={styles.every}>every</span> goal for <span className={styles.every}>every</span> price</p>
    <a href='/Login' id={styles.join}
    >
      Start journey
    </a>
    
    </div>
    
    
    
  );
}
