"use client";

import Link from "next/link";
// منطق ورود- بازیابی شماره و تایید کد پیامکی
import { useLogin } from "../-hooks/useLogin";
// فرم وارد کردن کد
import { OtpForm } from "../-components/otpForm";
// نمایش پیام موفقیت یا خطا
import { LoginMessage } from "../-components/loginMessage";
import styles from "../page.module.css";

export default function OtpPage() {
  const {
    message,
    messageType,
    step,
    otp,
    setOtp,
    hasPassword,
    isLoading,
    handleVerifyOtp,
    // اطلاعات ذخیره شده ورود را بازیابی میکند
  } = useLogin(true);

  return (
    <main className={styles.container}>
      <section className={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>
          Log in
        </h1>

        <p className={styles.description}>Enter your details to continue.</p>
        {/* نمایش فرم otp */}
        {step === "otp" && (
          <OtpForm
            otp={otp}
            setOtp={setOtp}
            isLoading={isLoading}
            onSubmit={handleVerifyOtp}
          />
        )}
        {/* لینک ورود با رمز */}
        {step === "otp" && hasPassword && (
          <Link className={styles.passwordLink} href="/login/password">
            Log in with password
          </Link>
        )}

        <LoginMessage message={message} messageType={messageType} />
      </section>
    </main>
  );
}
