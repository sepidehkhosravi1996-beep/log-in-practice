import styles from "./contact.module.css";

export default function ContactPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Contact Us</h1>

      <p className={styles.description}>Have a question? Send us a message.</p>

      <form className={styles.form}>
        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" placeholder="Enter your name" />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="Enter your email" />

        <label htmlFor="message">Message</label>
        <textarea id="message" placeholder="Write your message" rows={5} />

        <button type="button">Send Message</button>
      </form>
    </main>
  );
}
