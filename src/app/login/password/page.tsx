"use client";
import { useState, type SubmitEvent } from "react";
import styles from "../page.module.css";
import Link from "next/link";

export default function PasswordLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  //نوعِ رویدادی را مشخص می‌کند که هنگام ارسال فرم به تابع می‌رسد؛
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // بارگذاری مجدد صفحه را متوقف میکند
    event.preventDefault();
    setIsLoading(true);
    //مقدار پیام را خالی می‌کند تا خطا یا پیام قبلی هنگام ارسال دوباره‌ی فرم باقی نماند.
    setMessage("");

    try {
      //اطلاعات ورود را به مسیر
      // API
      // داخلی پروژه می‌فرستیم؛ آن مسیر درخواست را به سرویس اصلی ورود منتقل می‌کند.
      // در واقع کل این بخش رمز رو به ادرس میفرسته و سپس پیام موفقیت یا خطا را نشان میدهد
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          phone: phoneNumber,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(result.message ?? "Login failed.");
        return;
      }
      setMessageType("success");
      setMessage("Login successful.");
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the login service.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.title}>Log in with password</h1>
        {/* تابع را به فرم وصل میکنیم */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* فیلد شماره را داخل فرم اضافه میکند */}
          {/* لیبل نام فیلد را نشان میدهد */}
          {/* phone number رو میکیره */}
          {/* set phone number رو به روز میکنه */}
          <label className={styles.label} htmlFor="phoneNumber">
            Phone number
          </label>
          <input
            className={styles.input}
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            required
          />
          {/* فیلد رمز عبور */}
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {/* کلیک روی دکمه فرم را میفرستد */}
          <button
            className={styles.submitButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Log in"}
          </button>
        </form>
        {/* کاربر رو از صفحه رمز عبور به صفحه ورود با otp میبرد */}
        <Link className={styles.passwordLink} href="/login">
          Log in with phone and OTP
        </Link>
        {message && (
          <p
            className={`${styles.message} ${
              messageType === "error"
                ? styles.errorMessage
                : styles.successMessage
            }`}
            role={messageType === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
