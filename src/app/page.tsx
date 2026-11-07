import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Welcome to My Website</h1>

      <p className={styles.description}>This is my home page.</p>

      <Link href="/contact" className={styles.button}>
        Contact Us
      </Link>
      <Link href="/about" className={styles.button}>
        About Us
      </Link>
      <Link href="/axios-learning" className={styles.button}>
        Learn Axios
      </Link>
      <Link href="/login" className={`${styles.button} ${styles.loginButton}`}>
        Log in
      </Link>
    </main>
  );
}
