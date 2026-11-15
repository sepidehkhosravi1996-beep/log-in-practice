import styles from "../page.module.css";

// نوع ورودی کامپوننت
//loginMessage
// تعریف میشه
//. آکولاد باز، فهرست اطلاعاتی را شروع می‌کند که صفحهٔ والد باید به کامپوننت بدهد.
type LoginMessageProps = {
  message: string;
  messageType: "error" | "success" | "info";
};

// کامپوننت
//loginMessage
// رو تعریف میکنه
// ورودی های message, messagetype
//رو از props میگیره
export function LoginMessage({ message, messageType }: LoginMessageProps) {
  if (!message) return null;

  return (
    <p
      className={`${styles.message} ${
        messageType === "error"
          ? styles.errorMessage
          : messageType === "success"
            ? styles.successMessage
            : styles.infoMessage
      }`}
      role={messageType === "error" ? "alert" : "status"}
      dir="auto"
    >
      {message}
    </p>
  );
}
