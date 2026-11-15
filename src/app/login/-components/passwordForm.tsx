import type { SubmitEvent } from "react";
import styles from "../page.module.css";
// نوع ورودی کامپوننت
type PasswordFormProps = {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoading: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};
// ورودی های کامپوننت
export function PasswordForm({
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
  isLoading,
  onSubmit,
}: PasswordFormProps) {
  //از اینجا کامپوننت،
  //، JSX
  //فرم ورود با رمز را برای نمایش برمی‌گرداند.
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label} htmlFor="phoneNumber">
        Phone number
      </label>
      <input
        className={styles.input}
        id="phoneNumber"
        type="tel"
        //به مرورگر می‌گوید این فیلد شمارهٔ تلفن است؛ ممکن است شمارهٔ ذخیره‌شده را برای تکمیل خودکار پیشنهاد دهد.
        autoComplete="tel"
        // شماره ذخیره شده در داخل فیلد نمایش داده میشه
        value={phoneNumber}
        onChange={(event) => setPhoneNumber(event.target.value)}
        required
      />

      <label className={styles.label} htmlFor="password">
        Password
      </label>
      <input
        className={styles.input}
        //نوع ورودی را رمز عبور می‌کند؛ به همین دلیل کاراکترهایی که کاربر تایپ می‌کند معمولاً به شکل نقطه یا ستاره نمایش داده می‌شوند.
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Log in"}
      </button>
    </form>
  );
}
