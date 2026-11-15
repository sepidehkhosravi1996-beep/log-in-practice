"use client";
import { useLogin } from "../-hooks/useLogin";
import styles from "../page.module.css";
import Link from "next/link";
import { PasswordForm } from "../-components/passwordForm";
import { LoginMessage } from "../-components/loginMessage";

export default function PasswordLoginPage() {
  const {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    message,
    isLoading,
    messageType,
    handlePasswordLogin,
  } = useLogin();
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.title}>Log in with password</h1>
        {/* تابع را به فرم وصل میکنیم */}
        <PasswordForm
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          onSubmit={handlePasswordLogin}
        />
        {/* کاربر رو از صفحه رمز عبور به صفحه ورود با otp میبرد */}
        <Link className={styles.passwordLink} href="/login">
          Log in with phone and OTP
        </Link>
        <LoginMessage message={message} messageType={messageType} />
      </section>
    </main>
  );
}
