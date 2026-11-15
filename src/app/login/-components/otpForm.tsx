"use client";
import { useEffect, useState, type SubmitEvent } from "react";
import styles from "../page.module.css";
// نوع ورودی های کامپوننت
type OtpFormProps = {
  otp: string;
  setOtp: (value: string) => void;
  isLoading: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};
// نوع ورودی های کامپوننت
// ورودی ها رو از props جدا میکنیم
//props ورودی‌هایی هستند که یک کامپوننت از کامپوننت والد دریافت می‌کند.
export function OtpForm({ otp, setOtp, isLoading, onSubmit }: OtpFormProps) {
  const [timeLeft, setTimeLeft] = useState(120);
  // تایمر
  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((remaining) => Math.max(remaining - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label} htmlFor="otp">
        Verification code
      </label>
      <input
        className={styles.input}
        id="otp"
        // ورودی رو متنی میکنه چون ممکنه با 0 شروع شه
        type="text"
        // پیشنهاد برای گوشی
        inputMode="numeric"
        maxLength={6}
        pattern="[0-9]{6}"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        disabled={timeLeft === 0}
        required
      />
      {/* نشان دادن تایمر */}
      <p
        className={`${styles.message} ${
          timeLeft === 0 ? styles.errorMessage : styles.infoMessage
        }`}
        role="status"
      >
        {timeLeft === 0
          ? "Verification code expired."
          : `Code expires in ${minutes}:${seconds}`}
      </p>
      <button
        className={styles.submitButton}
        type="submit"
        disabled={isLoading || timeLeft === 0}
      >
        {isLoading ? "Verifying..." : "Verify code"}
      </button>
    </form>
  );
}
