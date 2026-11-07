// پاسخ api را به شکل json برمیگردانیم
import { NextResponse } from "next/server";
const apiBaseUrl =
  process.env.CHITGAR_API_BASE_URL ??
  "https://staging.api.chitgar.avijepardaz.com";
// api  3 تا درخواست میپذیره
//شروع ورود
// تایید کد پیامکی
// ورود با رمز
type Action = "start" | "otp" | "password";
// تابع برای پیدا کردن پیام خطا از پاسخ سرویس
// یک تابع به اسن مسیج فرم میسازیم
// data ورودی
// از نوع unknown
function messageFrom(data: unknown) {
  //اگر پاسخ خودش متن باشد همان را بر میگرداند
  if (typeof data === "string") return data;
  // اگه دیتا از نوع ابجکت باشه بررسی میکند که داخلش پیام خطا است
  if (data && typeof data === "object") {
    // با این ابجکت به صورت مجموعه ای از کلید ها و مقدار های ناشناخته رفتار میکند
    const value = data as Record<string, unknown>;
    // اگر پاسخ یکی از فیلد های متنی مسیج یا دیتیل را داشته باشد همان را برمیگرداند
    if (typeof value.message === "string") return value.message;
    if (typeof value.detail === "string") return value.detail;

    if (Array.isArray(value.non_field_errors)) {
      // اگر نان-فیلد-ارورس ارایه باشد مواردش را به متن تبدیل کرده و برمیگرداند
      return value.non_field_errors.join(" ");
    }
  }
  // اگر هیچکدام از موارد بالا نبود یک پیام پیشفرض برمیگرداند
  return "Login request failed.";
}
// تابع post
export async function POST(request: Request) {
  // میگوید این متغغیر یک ابجکت با کلید های متنی است
  let body: Record<string, unknown>;

  try {
    // درخواست رو با جیسون میخونه و در بادی قرار میده
    // await منتظر خواندن میمونه
    body = await request.json();
  } catch {
    // یک پاسخ جیسون میسازه
    return NextResponse.json(
      // محتوای پاسخ است
      { message: "Invalid request." },
      // درخواست معتبر نیست
      { status: 400 },
    );
  }

  // مقدار اکشن رو میگیره - یکی از 3 حالت
  const action = body.action as Action;
  // شماره رو میخونه
  // اگه استرینگ نباشه مقدار خالی میذاره
  const phone = typeof body.phone === "string" ? body.phone : "";
  // اعتبار سنجی شماره
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json(
      { message: "Enter a valid phone number." },
      { status: 400 },
    );
  }
  let path: string;
  // داده ارسالی را نگه میدارد
  let payload: Record<string, unknown>;
  // برای start در بالا
  if (action === "start") {
    path = "/user/submit_login_v2/";
    // شماره را برای ارسال نگه میدارد
    payload = { phone };
    // تایید کد پیامکی
  } else if (action === "otp") {
    const ref =
      typeof body.authentication_ref_id === "string"
        ? body.authentication_ref_id
        : "";

    const code = typeof body.otp_code === "string" ? body.otp_code : "";

    if (!ref || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { message: "Enter a valid verification code." },
        { status: 400 },
      );
    }

    path = "/user/validate_otp/";
    payload = {
      phone,
      action: "login",
      otp_code: code,
      authentication_ref_id: ref,
    };
  } else if (action === "password") {
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json(
        { message: "Enter your password." },
        { status: 400 },
      );
    }
    // مسیر اندپوینت با ورود با رمز
    path = "/user/user_login/";
    // شماره تلفن و رمز برای ورود به api
    payload = { phone, password };
    //action ناشناخته
  } else {
    return NextResponse.json(
      { message: "Unsupported action." },
      { status: 400 },
    );
  }
  // پاسخ سرور رو ذخیره میکنه
  let upstream: Response;
  // ممکن است هنگام اجرا خطا دهد
  try {
    // با fetch
    // به ادرس ساخته شده از ادرس پایه و مسیر
    //endpoint
    // درخواست میفرسته
    upstream = await fetch(apiBaseUrl + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    // اگه خطا بده این بخش شروع میشه
  } catch {
    return NextResponse.json(
      { message: "Could not connect to the login service." },
      { status: 502 },
    );
  }
  // پاسخ رو به صورت متن میخواند
  const text = await upstream.text();
  // متغییری برای نگه داشتن پاسخ تبدیل شده به ابجکت
  let data: Record<string, unknown> = {};
  // تلاش میکنه متن رو جیسون کنه
  try {
    data = text ? JSON.parse(text) : {};
    // اگه متن جیسون نباشه- کچ همونو در مسیج قرار میده
  } catch {
    data = { message: text };
  }
  // پاسخ موفق باشد - true
  // پاسخ موفق نباشد if اجرا
  if (!upstream.ok) {
    return NextResponse.json(
      // پیام خطا رو پیدا میکنه
      { message: messageFrom(data) },
      // کد خطایی که سرویس اصلی برگردانده
      { status: upstream.status },
    );
  }
  // بعد از درست بودن fetch
  if (action === "start") {
    return NextResponse.json({ data });
  }
  const tokens =
    data.tokens && typeof data.tokens === "object"
      ? (data.tokens as Record<string, unknown>)
      : undefined;

  const access = typeof data.access === "string" ? data.access : tokens?.access;

  const refresh =
    typeof data.refresh === "string" ? data.refresh : tokens?.refresh;

  // access و refresh دو توکن هستند که سرویس ورود پس از تأیید هویت می‌دهد:
  //access token کاربر را شناسایی میکند و زود منقضی میشود
  //refresh token برای تمدید ورود پس از انقضا استفاده میشه و اعتبار بشتری دارد

  if (typeof access !== "string" || typeof refresh !== "string") {
    return NextResponse.json(
      { message: "Login service did not return valid tokens." },
      { status: 502 },
    );
  }
  //این کار باعث می‌شود توکن‌ها داخل داده‌ای که کد فرانت‌اند می‌خواند قرار نگیرند.
  // یک کپی از پاسخ api میسازد
  const safeData = { ...data };
  // توکن ها را از کپی حذف میکنند
  delete safeData.access;
  delete safeData.refresh;
  delete safeData.tokens;
  // پاسخ بدون توکن میسازیم و توکن ها را در کوکی ذخیره میکنیم
  // یک پاسخ جیسون میسازه که فقط سیف دیتا داره
  const response = NextResponse.json({ data: safeData });
  // بررسی میکنه برنامه در حالت پروداکشن اجرا میشه یا خیر
  // اگر بله باشد مقدار secure - true
  const secure = process.env.NODE_ENV === "production";
  // کوکی کمک میکنه سایت کاربر را بشناسد و وضعیت او را حفظ کند
  //کوکی‌ای به نام access با مقدار توکن دسترسی به پاسخ اضافه می‌کند.
  response.cookies.set("access", access, {
    // جاوا داخل صفحه نمیتواند این کوکی را بخواند
    httpOnly: true,
    // در پروداکشن مرورگر کوکی را فقط از اتصال امن http میفرستد
    secure,
    // رفتار ارسال کوکی بین سایت های مختلف را محدود میکند
    sameSite: "lax",
    // کوکی را برای همه ی مسیر های این سایت قابل ارسال میکند
    path: "/",
  });
  // کوکی دیگری به نام رفرش میسازد
  response.cookies.set("refresh", refresh, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });
  // پاسخ json را همراه هر دو کوکی به درخواست کننده بر میگرداند
  return response;
}
