import type { SubmitEvent } from "react";
import styles from "../page.module.css";
// نوع ورودی های کامپوننت
type PhoneFormProps = {
  // چون ممکنه با صفر شروع شه
  phoneNumber: string;
  //مقدار جدید شماره رو میگیره اما چیزی بر نمیگردونه
  //صفحهٔ والد این تابع را می‌فرستد تا کامپوننت بتواند شماره را هنگام تایپ به‌روزرسانی کند.
  setPhoneNumber: (value: string) => void;
  //این مقدار مشخص می‌کند درخواست ورود در حال انجام است یا نه.
  isLoading: boolean;
  //این ورودی تابعی است که هنگام ارسال فرم اجرا می‌شود
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};
// کامپوننت phoneForm
// روش destructuring
// ورودی های کامپوننت را به صورت جداگانه از
//props
// میگیریم
export function PhoneForm({
  // ورودی کامپوننت ها همان props
  // شماره فعلی
  phoneNumber,
  // تابع به روز رسانی شماره
  setPhoneNumber,
  // وضعیت در حال ارسال
  isLoading,
  // تابعی که هنگام ارسال فرم اجرا میشه
  onSubmit,
  //این خط می‌گوید ورودی‌هایی که در خط‌های قبل جدا کردیم، باید با نوع PhoneFormProps مطابقت داشته باشند
}: PhoneFormProps) {
  return (
    // بخش دوم تابع ارسال فرم را وصل میکند
    <form className={styles.form} onSubmit={onSubmit}>
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
  );
}
