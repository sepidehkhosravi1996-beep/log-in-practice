"use client";
import { useLogin } from "./-hooks/useLogin";
import styles from "./page.module.css";
import { PhoneForm } from "./-components/phoneForm";
import { LoginMessage } from "./-components/loginMessage";

export default function LoginPage() {
  const {
    message,
    messageType,
    phoneNumber,
    setPhoneNumber,
    isLoading,
    handleSubmit,
  } = useLogin();
  return (
    <main className={styles.container}>
      <section className={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>
          Log in
        </h1>
        <p className={styles.description}>Enter your details to continue.</p>
        {/* onsubmit صفحه مجدد بارگزاری نمیشود */}
        {/* فرم شماره تلفن در مرحله phone دیده شه */}
        <PhoneForm
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
        {/* پیام موفقیت یا خطا را نشان میدهد */}
        <LoginMessage message={message} messageType={messageType} />
      </section>
    </main>
  );
}
