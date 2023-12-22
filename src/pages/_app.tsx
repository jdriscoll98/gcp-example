import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { serializeError } from "serialize-error";

export const logError = async (
  err: Error | string | unknown,
  id = generateRandomId(),
  componentStack?: string,
  message?: string
) => {
  try {
    console.error(err);
    if (process.env.NODE_ENV === "development") return;
    const ctx = serializeError(err);
    if (componentStack) ctx.stack = componentStack;
    const body = JSON.stringify({ ...serializeError(err), id, message });
    console.error("Reporting error", body);
  } catch (e) {
    console.error("Error reporting error", e);
  }
};

export const generateRandomId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function App({ Component, pageProps }: AppProps) {
  const id = useMemo(generateRandomId, []);
  return (
    <ErrorBoundary
      onError={(error, { componentStack }) => {
        const script = document.getElementById("__NEXT_DATA__");
        logError(
          error,
          id,
          componentStack ?? "",
          JSON.stringify(script?.innerHTML ?? "")
        );
      }}
      fallbackRender={({ error }: { error: Error }) => {
        const msg = error instanceof Error ? error.message : error;
        return <>{msg}</>;
      }}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
