"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
// مشخص کردن پیام صفحه
type MessageType = "error" | "success" | "info";
// مشخص کردن مرحله کاربر
type Step = "phone" | "otp" | "success";
// تابع برای پیدا کردن یک فیلد در پاسخ سرویس ورود است
//value برای پاسخ جیسون است
function findResponseField(value: unknown, field: string): unknown {
  // اگر پاسخ خالی باشد یا ابجکت نباشد
  if (!value || typeof value !== "object") return undefined;
  // با این شی مثل مجموعه ای از کلید های متنی و مقدار های ناشناخته رفتار میکند
  // فقط برای بررسی نوع کد و پاسخ رو تغیر نمیدهد
  const record = value as Record<string, unknown>;
  // اگر key
  //داخل object باشه
  // مقدارش رو بر میگردونه
  if (field in record) return record[field];
  // اگر کلید در این سطح نبود، این حلقه مقدارهای داخل شیء را یکی‌یکی می‌گیرد؛ چون پاسخ سرویس ممکن است چندلایه باشد،
  for (const nested of Object.values(record)) {
    //برای هر مقدارِ داخل پاسخ، همان تابع دوباره اجرا می‌شود تا در لایه‌های تو‌در‌تو هم دنبال فیلد بگردد. اگر فیلد را پیدا کرد، مقدارش را برمی‌گرداند و جست‌وجو تمام می‌شود
    // reqursion
    const found = findResponseField(nested, field);
    if (found !== undefined) return found;
  }
  // همه بخش ها بررسی شد و فیلد پیدا نشد
  return undefined;
}
//تابع توکن را در کوکیِ نشستِ همین سایت می‌گذارد
function saveTokenCookie(name: string, token: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  // کوکی را در مرورگر تنظیم می‌کند
  document.cookie = `${name}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
}
// بخش ساخت هوک
// تابع هوک ورود
// صفحه otp
// به هوک میگه اطلاعات ذخیره شده را بازیابی کند
// بدون اینکه صفحه ی ورود شماره هم تحت تاثیر قرار بگیره
export function useLogin(isOtpPage = false) {
  const [message, setMessage] = useState("");
  // نوع پیام را مشخص میکند
  const [messageType, setMessageType] = useState<MessageType>("info");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  //شناسه‌ای را نگه می‌دارد که سرویس بعد از شروع ورود برمی‌گرداند. این شناسه همراه کد پیامکی برای تأیید فرستاده می‌شود.
  const [authenticationRefId, setAuthenticationRefId] = useState("");
  // step مشخص میکنه کدوم فرم رو نمایش بده
  // ابتدا فرم شماره را میبینیم
  const [step, setStep] = useState<Step>("phone");
  const [otp, setOtp] = useState("");
  //haspassword مشخص میکنه حساب کاربر با رمز عبور دارد یا نه
  // true باشد لینک ورود با رمز نمایش داده میشود
  const [hasPassword, setHasPassword] = useState(false);
  //isloading مشخص میکند درخواست در حال انجام هست یا خیر
  // هنگام ارسال true
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // وقتی otp
  // از هوک استفاده کنه اطلاعات را بازیابی میکند
  useEffect(() => {
    if (!isOtpPage) return;

    const savedData = sessionStorage.getItem("loginOtpData");

    if (!savedData) {
      router.replace("/login");
      return;
    }

    try {
      const data = JSON.parse(savedData);

      if (
        typeof data.phoneNumber !== "string" ||
        typeof data.authenticationRefId !== "string"
      ) {
        sessionStorage.removeItem("loginOtpData");
        router.replace("/login");
        return;
      }

      setPhoneNumber(data.phoneNumber);
      setAuthenticationRefId(data.authenticationRefId);
      setHasPassword(data.hasPassword === true);
      setStep("otp");
    } catch {
      sessionStorage.removeItem("loginOtpData");
      router.replace("/login");
    }
  }, [isOtpPage, router]);
  // تابع ارسال شماره
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // درخواست در حال انجام است؛ رابط کاربری می‌تواند دکمه را غیرفعال کند.
    setIsLoading(true);
    //پیام قبلی را پاک می‌کند تا هنگام درخواست جدید، پیام خطای قبلی باقی نماند.
    setMessage("");

    try {
      // درخواست شروع ورود
      const response = await fetch(
        "https://staging.api.chitgar.avijepardaz.com/user/submit_login_v2/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          //ابجکت جاوا رو تبدیل به جیسون میکنه
          body: JSON.stringify({
            phone: phoneNumber,
          }),
        },
      );
      // جیسون رو به جاوا اسکریپت تبدیل میکنه
      const result = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(result.message ?? "Login request failed.");
        return;
      }

      // شناسه درخواست رو از پاسخ پیدا میکنیم
      const refId = findResponseField(result, "authentication_ref_id");

      if (typeof refId !== "string" || !refId) {
        setMessageType("error");
        setMessage("The login service did not return a request ID.");
        //اعث می‌شود بدون شناسه، فرم به مرحلهٔ واردکردن کد پیامکی نرود.
        return;
      }
      // ذخیره شناسه معتبر
      setAuthenticationRefId(refId);
      const hasAccount = findResponseField(result, "has_account");

      if (hasAccount === false) {
        router.push(
          `/login/otp/register?phone=${encodeURIComponent(phoneNumber)}&authentication_ref_id=${encodeURIComponent(refId)}`,
        );
        return;
      }

      if (hasAccount !== true) {
        setMessageType("error");
        setMessage("The login service returned an invalid account status.");
        return;
      }
      // اگر پسورد داشته باشه بعدا امکان نمایش لینک ورود با رمز فراهم شود
      //login with password نشون داده بشه یا خیر
      setHasPassword(findResponseField(result, "has_password") === true);
      // اطلاعات لازم رو نگه میداره و ادرس رو تغیر میده
      sessionStorage.setItem(
        "loginOtpData",
        JSON.stringify({
          phoneNumber,
          authenticationRefId: refId,
          hasPassword: findResponseField(result, "has_password") === true,
        }),
      );
      router.push("/login/otp");
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the login service.");
      // وضعیت بارگزاری را خاموش میکند
    } finally {
      setIsLoading(false);
    }
  }
  // تابع تایید کد پیامک
  async function handleVerifyOtp(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://staging.api.chitgar.avijepardaz.com/user/validate_otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            phone: phoneNumber,
            authentication_ref_id: authenticationRefId,
            otp_code: otp,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(result.message ?? "Verification failed.");
        return;
      }
      //این کد توکن‌ها را از پاسخ می‌گیرد—چه در ریشهٔ پاسخ باشند چه داخل tokens—اعتبارشان را بررسی می‌کند و بعد در کوکی‌ها ذخیره می‌کند.
      const tokenData =
        result.tokens && typeof result.tokens === "object"
          ? result.tokens
          : result;

      const access = tokenData.access;
      const refresh = tokenData.refresh;

      if (typeof access !== "string" || typeof refresh !== "string") {
        setMessageType("error");
        setMessage("Login service did not return valid tokens.");
        return;
      }

      saveTokenCookie("access", access);
      saveTokenCookie("refresh", refresh);
      setMessageType("success");
      sessionStorage.removeItem("loginOtpData");
      setMessage("Login successful.");
      setStep("success");
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the login service.");
    } finally {
      setIsLoading(false);
    }
  }
  async function handlePasswordLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://staging.api.chitgar.avijepardaz.com/user/user_login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "password",
            phone: phoneNumber,
            password,
          }),
        },
      );

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
  // این‌ها خروجی‌های هوک هستند. صفحه می‌تواند
  //با فراخوانی useLogin() به آن‌ها دسترسی پیدا کند
  return {
    message,
    messageType,
    phoneNumber,
    setPhoneNumber,
    step,
    otp,
    setOtp,
    hasPassword,
    isLoading,
    handleSubmit,
    handleVerifyOtp,
    password,
    setPassword,
    handlePasswordLogin,
  };
}
