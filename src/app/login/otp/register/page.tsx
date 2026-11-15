"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OtpForm } from "../../-components/otpForm";
import { LoginMessage } from "../../-components/loginMessage";
import styles from "../../page.module.css";

export default function RegisterOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = searchParams.get("phone") ?? "";
  const authenticationRefId = searchParams.get("authentication_ref_id") ?? "";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">(
    "info",
  );
  const [isLoading, setIsLoading] = useState(false);

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
            phone,
            action: "register",
            otp_code: otp,
            authentication_ref_id: authenticationRefId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(result.message ?? "Verification failed.");
        return;
      }
      sessionStorage.setItem("registrationOtp", otp);
      const params = new URLSearchParams({
        phone,
        authentication_ref_id: authenticationRefId,
        step: "details",
      });

      router.push(`/register?${params.toString()}`);
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
          Enter the verification code to continue registration.
        </p>

        <OtpForm
          otp={otp}
          setOtp={setOtp}
          isLoading={isLoading}
          onSubmit={handleVerifyOtp}
        />

        <LoginMessage message={message} messageType={messageType} />
      </section>
    </main>
  );
}
