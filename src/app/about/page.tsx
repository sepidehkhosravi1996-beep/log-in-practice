import Link from "next/link";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>About Us</h1>

      <p className={styles.description}>
        Welcome to our company! We are passionate about technology and creating
        innovative solutions.
      </p>

      <section className={styles.section}>
        <h2>Who We Are</h2>
        <p>
          We are a team of developers and designers working together to build
          great products.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Our Mission</h2>
        <p>
          Our mission is to provide high-quality digital solutions for our
          customers.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Our Services</h2>
        <ul>
          <li>Web Development</li>
          <li>Mobile Applications</li>
          <li>UI/UX Design</li>
          <li>IT Solutions</li>
        </ul>
      </section>

      <Link href="/contact" className={styles.button}>
        Contact Us
      </Link>
    </main>
  );
}
