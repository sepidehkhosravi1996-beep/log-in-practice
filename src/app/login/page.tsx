"use client";
import { useState, type SubmitEvent } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">(
    "info",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authenticationRefId, setAuthenticationRefId] = useState("");
  // صفحه بداند الان شماره میگیریم یا کد پیامکی
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [otp, setOtp] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    // هنگام ارسال فرم-شماه را به ای پی ای میفرستد و نتیجه را به کاربر نشان میدهد
    try {
      // به مسیر داخلی درخواست میفرستد
      // await صبر میکند تا پاسخ برسد
      // پاسخ را در response  قرار میدهد
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // شروع ورود
          action: "start",
          phone: phoneNumber,
        }),
      });
      // پاسخ را از json به ابجکت تبدیل میکند
      const result = await response.json();
      // بررسی پاسخ  (فالس)
      if (!response.ok) {
        setMessageType("error");
        setMessage(result.message ?? "Login request failed.");
        //کد پیامکی را برای تایید به ای پی ای میفرستد

        return;
      }
      // بعد از پاسخ موفق ای پی ای - شناسه درخواست ورود را پیدا و ذخیره میکند
      // مقدار انتها را از پاسخ ای پی ای بر میداره
      // در refid میزاره
      // اگر resultdata نبود-undefined
      if (result.data?.has_account === false) {
        setMessageType("error");
        setMessage("No account is registered for this number.");
        return;
      }
      const refId = result.data?.authentication_ref_id;
      // بررسی میکنه refid رشته باشه و خالی نباشه

      if (typeof refId !== "string" || !refId) {
        setMessageType("error");
        // پیام خطا
        setMessage("The login service did not return a request ID.");
        // تابع رو متوقف میکنه بنابراین خطوط مربوط به رفتن به otp
        return;
      }
      // پایان اعتبار سنجی
      // شناسه رو در state ذخیره میکنه
      // هنگام تایید otp همراه کد
      // به api فرستاده شود
      setAuthenticationRefId(refId);
      setHasPassword(result.data?.has_password === true);
      // ورود با کد پیامکی
      setStep("otp");
      setMessageType("info");
      setMessage("Verification code sent.");
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the login service.");
    } finally {
      setIsLoading(false);
    }
  }
  async function handleVerifyOtp(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "otp",
          phone: phoneNumber,
          authentication_ref_id: authenticationRefId,
          otp_code: otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(result.message ?? "Verification failed.");
        return;
      }
      setMessageType("success");
      setMessage("Login successful.");
      setStep("success");
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the login service.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <section className={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>
          Log in
        </h1>
        <p className={styles.description}>Enter your details to continue.</p>
        {/* onsubmit صفحه مجدد بارگزاری نمیشود */}
        {/* فرم شماره تلفن در مرحله phone دیده شه */}
        {step === "phone" && (
          <>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label} htmlFor="name">
                Name
              </label>
              <input
                className={styles.input}
                id="name"
                type="text"
                placeholder="Enter your name"
                autoComplete="name"
              />

              <label className={styles.label} htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                className={styles.input}
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                autoComplete="tel"
                inputMode="tel"
                pattern="09[0-9]{9}"
                title="Enter an 11-digit Iranian mobile number starting with 09"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />

              <button
                className={styles.submitButton}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Checking..." : "Log in"}
              </button>
            </form>
          </>
        )}

        {/* کد پیامکی  */}
        {/* وقتی ارسال شماره با موفقیت انجام شد */}
        {step === "otp" && (
          <form className={styles.form} onSubmit={handleVerifyOtp}>
            <label className={styles.label} htmlFor="otp">
              Verification code
            </label>
            <input
              className={styles.input}
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify code"}
            </button>
          </form>
        )}
        {step === "otp" && hasPassword && (
          <Link className={styles.passwordLink} href="/login/password">
            Log in with password
          </Link>
        )}
        {/* پیام موفقیت یا خطا را نشان میدهد */}
        {message && (
          <p
            className={`${styles.message} ${
              messageType === "error"
                ? styles.errorMessage
                : messageType === "success"
                  ? styles.successMessage
                  : styles.infoMessage
            }`}
            role="status"
            dir="auto"
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
