"use client";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useSearchParams } from "next/navigation";
import { LoginMessage } from "../login/-components/loginMessage";
import styles from "../login/page.module.css";

type RegistrationOption = {
  value: string;
  label: string;
};
type BuildingApiItem = {
  id: string | number;
  name?: string;
  title?: string;
  facing_sides?: {
    id: string | number;
    name?: string;
    title?: string;
  }[];
};
export default function RegisterPage() {
  // پارامتر های query  رو میخونه
  // مثل شماره تلفن
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const authenticationRefId = searchParams.get("authentication_ref_id") ?? "";

  const [otp, setOtp] = useState("");
  // متن پیامی که به کاربر نشون میدیم
  const [message, setMessage] = useState("");
  // برای نوع پیام
  const [messageType, setMessageType] = useState<"error" | "success" | "info">(
    "info",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"details" | "success">("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [building, setBuilding] = useState("");
  const [facingSide, setFacingSide] = useState("");
  const [floor, setFloor] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [address, setAddress] = useState("");
  const [buildingOptions, setBuildingOptions] = useState<RegistrationOption[]>(
    [],
  );
  const [floorOptions, setFloorOptions] = useState<RegistrationOption[]>([]);
  const [facingSideOptions, setFacingSideOptions] = useState<
    RegistrationOption[]
  >([]);
  const [buildingRecords, setBuildingRecords] = useState<BuildingApiItem[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isAddressRequired, setIsAddressRequired] = useState(false);
  const [isUnitNumberRequired, setIsUnitNumberRequired] = useState(true);
  const floorRequestId = useRef(0);

  useEffect(() => {
    const savedOtp = sessionStorage.getItem("registrationOtp");

    if (savedOtp) {
      setOtp(savedOtp);
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    // برای دریافت ساختمان
    async function loadBuildings() {
      try {
        const buildings: BuildingApiItem[] = [];
        let page = 1;
        let totalCount = 0;

        do {
          const response = await fetch(
            `https://staging.api.chitgar.avijepardaz.com/building/buildings_list/?page=${page}&page_size=10`,
            { method: "GET" },
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error("Could not load buildings.");
          }

          const pageResults: BuildingApiItem[] = Array.isArray(result.results)
            ? result.results
            : [];

          buildings.push(...pageResults);
          totalCount = Number(result.total_count ?? buildings.length);
          page += 1;

          if (pageResults.length === 0) break;
        } while (buildings.length < totalCount);

        if (cancelled) return;

        setBuildingRecords(buildings);
        setBuildingOptions(
          buildings.map((item) => ({
            value: String(item.id),
            label: item.name ?? item.title ?? String(item.id),
          })),
        );
      } catch {
        if (cancelled) return;

        setMessageType("error");
        setMessage("Could not load buildings from Chitgar.");
      }
    }

    loadBuildings();

    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    // اگر کاربر انتخاب رو عوض کنه - نسخه قبلی لغو میشه
    let cancelled = false;

    setIsAddressRequired(false);
    //اینجا شمارهٔ واحد را موقتاً اجباری در نظر می‌گیرد
    setIsUnitNumberRequired(true);

    if (!building) {
      return () => {
        cancelled = true;
      };
    }

    async function loadRegistrationRequirements() {
      try {
        const params = new URLSearchParams({ building });

        if (facingSide) params.set("facing_side", facingSide);
        if (floor) params.set("floor", floor);

        const response = await fetch(
          `https://staging.api.chitgar.avijepardaz.com/user/registration_requirements/?${params.toString()}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error("Could not load registration requirements.");
        }

        if (cancelled) return;

        setIsAddressRequired(result.address_required === true);
        setIsUnitNumberRequired(result.unit_number_required !== false);
      } catch {
        if (cancelled) return;
        setIsAddressRequired(false);
        setIsUnitNumberRequired(true);
      }
    }

    loadRegistrationRequirements();

    return () => {
      cancelled = true;
    };
  }, [building, facingSide, floor]);
  // فهرست طبقات ساختمان
  async function handleBuildingChange(value: string) {
    const requestId = ++floorRequestId.current;
    // شناسه ساختمان را ذخیره میکند
    setBuilding(value);
    //مقدار طبقهٔ قبلی را پاک می‌کند
    setFloor("");
    setFacingSide("");
    //فهرست طبقه‌های قبلی را پاک می‌کند
    setFloorOptions([]);
    setFacingSideOptions([]);

    //جست‌وجو در فهرست کامل ساختمان‌هایی را شروع می‌کند که از API گرفته‌ایم.
    const selectedBuilding = buildingRecords.find(
      (item) => String(item.id) === value,
    );
    // فهرست جهت‌ها یا بلوک‌های ساختمان انتخاب‌شده را می‌گیرد.
    const facingSides = selectedBuilding?.facing_sides ?? [];
    //به‌روزرسانی فهرست گزینه‌های جهت/بلوک را شروع می‌کند
    setFacingSideOptions(
      //روی هر جهت یا بلوک می‌چرخد و برای هرکدام یک گزینه می‌سازد
      facingSides.map((item) => ({
        // شناسهٔ جهت یا بلوک را به رشته تبدیل می‌کند و به‌عنوان مقدار گزینه می‌گذارد
        // برای ارسال به api
        value: String(item.id),
        label: item.name ?? item.title ?? String(item.id),
      })),
    );
    //اگر انتخاب ساختمان خالی باشد، تابع همین‌جا متوقف می‌شود و درخواست دریافت طبقات را نمی‌فرستد. وقتی ساختمان انتخاب شده باشد، کد به خط بعد می‌رود و بارگذاری طبقات را شروع می‌کند.
    if (!value) {
      setIsLoadingFloors(false);
      return;
    }
    //این خط وضعیت بارگذاری طبقات را روشن می‌کند. معمولاً از این وضعیت برای نشان‌دادن پیام یا حالت «در حال بارگذاری» کنار فهرست طبقات استفاده می‌شود.
    setIsLoadingFloors(true);

    try {
      const floors: BuildingApiItem[] = [];
      let page = 1;
      let totalCount = 0;

      do {
        const response = await fetch(
          `https://staging.api.chitgar.avijepardaz.com/building/floors_list/?building=${encodeURIComponent(value)}&page=${page}&page_size=20`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error("Could not load floors.");
        }

        const pageResults: BuildingApiItem[] = Array.isArray(result.results)
          ? result.results
          : [];

        floors.push(...pageResults);
        totalCount = Number(result.total_count ?? floors.length);
        page += 1;
        if (requestId !== floorRequestId.current) return;
        if (pageResults.length === 0) break;
      } while (floors.length < totalCount);

      setFloorOptions(
        floors.map((item) => ({
          value: String(item.id),
          label: item.name ?? item.title ?? String(item.id),
        })),
      );
    } catch {
      if (requestId !== floorRequestId.current) return;
      setMessageType("error");
      setMessage("Could not load floors for the selected building.");
    } finally {
      // دریافت طبقات تمام شده
      if (requestId === floorRequestId.current) {
        setIsLoadingFloors(false);
      }
    }
  }
  //این تابع فعلاً درخواست را می‌فرستد و نتیجه را نشان می‌دهد.
  async function handleRegister(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://staging.api.chitgar.avijepardaz.com/user/submit_registration/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone,
            building,
            floor,
            facing_side: facingSide || undefined,
            unit_number: unitNumber || undefined,
            address: address.trim() || undefined,
            password: null,
            authentication_ref_id: authenticationRefId,
            semver: null,
            otp_code: otp,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(result.message ?? "Registration failed.");
        return;
      }
      sessionStorage.removeItem("registrationOtp");
      // محل پیدا کردن توکن ها در پاسخ api
      const tokenData =
        result.tokens && typeof result.tokens === "object"
          ? result.tokens
          : result;

      const access = tokenData.access;
      const refresh = tokenData.refresh;
      //اگر یکی از آن‌ها رشته نباشد، شرط برقرار می‌شود و کد وارد بخش خطا خواهد شد.
      if (typeof access !== "string" || typeof refresh !== "string") {
        setMessageType("error");
        setMessage(
          "Registration succeeded, but valid tokens were not returned.",
        );
        return;
      }
      // ساخت کوکی
      const secure = window.location.protocol === "https:" ? "; Secure" : "";

      document.cookie = `access=${encodeURIComponent(access)}; Path=/; SameSite=Lax${secure}`;
      document.cookie = `refresh=${encodeURIComponent(refresh)}; Path=/; SameSite=Lax${secure}`;
      setStep("success");
      setMessageType("success");
      //این پیام پس از موفقیت درخواست ثبت‌نام و ذخیرهٔ هر دو کوکی به کاربر نشان داده می‌شود. فعلاً صفحه به مسیر دیگری نمی‌رود و همین‌جا پیام موفقیت را نمایش می‌دهد.
      setMessage("Registration completed successfully.");
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the registration service.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.description}>
          {step === "details"
            ? "Enter your details to complete registration."
            : "Your registration is complete."}
        </p>
        {step === "details" && (
          <form className={styles.form} onSubmit={handleRegister}>
            <label className={styles.label} htmlFor="firstName">
              First name
            </label>
            <input
              className={styles.input}
              id="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />

            <label className={styles.label} htmlFor="lastName">
              Last name
            </label>
            <input
              className={styles.input}
              id="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
            <label className={styles.label} htmlFor="building">
              Building
            </label>
            <select
              className={styles.input}
              id="building"
              value={building}
              onChange={(event) => handleBuildingChange(event.target.value)}
              required
            >
              <option value="">Select a building</option>
              {buildingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className={styles.label} htmlFor="facingSide">
              Facing side / Block
            </label>
            <select
              className={styles.input}
              id="facingSide"
              value={facingSide}
              onChange={(event) => setFacingSide(event.target.value)}
              disabled={!facingSideOptions.length}
            >
              <option value="">Select a facing side / block</option>
              {facingSideOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className={styles.label} htmlFor="floor">
              Floor
            </label>
            <select
              className={styles.input}
              id="floor"
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              disabled={!building || isLoadingFloors || !floorOptions.length}
              required
            >
              <option value="">
                {isLoadingFloors ? "Loading floors..." : "Select a floor"}
              </option>
              {floorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className={styles.label} htmlFor="unitNumber">
              Unit number
            </label>
            <input
              className={styles.input}
              id="unitNumber"
              type="text"
              inputMode="numeric"
              required={isUnitNumberRequired}
              value={unitNumber}
              onChange={(event) => setUnitNumber(event.target.value)}
            />
            <label className={styles.label} htmlFor="address">
              Address
            </label>
            <textarea
              className={styles.input}
              id="address"
              required={isAddressRequired}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
            />
            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Complete registration"}
            </button>
          </form>
        )}

        <LoginMessage message={message} messageType={messageType} />
      </section>
    </main>
  );
}
