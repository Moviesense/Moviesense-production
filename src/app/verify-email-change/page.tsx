"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/Common/Button";
import { useVerifyEmailChange } from "@/hooks/useEmailChange";
import { useLanguage } from "@/context/LanguageContext";

function VerifyEmailChangeContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifyEmailChange = useVerifyEmailChange();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  // Clear the local session and send the user to login (full reload so the
  // auth context re-reads cookies from scratch).
  const goToLogin = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    window.location.href = "/login";
  };

  useEffect(() => {
    // Guard against React's double-invoke in dev so we verify the token once.
    if (hasRun.current) return;
    hasRun.current = true;

    if (!token) {
      setStatus("error");
      setMessage(t("missingEmailChangeToken"));
      return;
    }

    verifyEmailChange
      .mutateAsync(token)
      .then((res) => {
        if (res.status) {
          setStatus("success");
          setMessage(res.message || t("emailUpdatedMessage"));
          // The backend revokes all sessions; drop the local tokens too.
          Cookies.remove("token");
          Cookies.remove("refreshToken");
        } else {
          setStatus("error");
          setMessage(res.message || t("invalidEmailChangeLink"));
        }
      })
      .catch((error: any) => {
        setStatus("error");
        setMessage(
          error?.response?.data?.message || t("invalidEmailChangeLink"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-redirect to login shortly after a successful verification.
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 4000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-background-2 p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-neutral-300">{t("verifyingEmailChange")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-500" />
            <h1 className="mb-2 text-xl font-bold text-white">
              {t("emailUpdatedTitle")}
            </h1>
            <p className="mb-6 text-neutral-300">{message}</p>
            <Button
              variant="primary"
              className="h-11 w-full"
              onClick={goToLogin}
            >
              {t("goToLogin")}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h1 className="mb-2 text-xl font-bold text-white">
              {t("emailChangeFailedTitle")}
            </h1>
            <p className="mb-6 text-neutral-300">{message}</p>
            <Button
              variant="primary"
              className="h-11 w-full"
              onClick={goToLogin}
            >
              {t("goToLogin")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <Header /> */}
      <div className="flex-grow">
        <Suspense
          fallback={
            <div className="flex min-h-[70vh] items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          }
        >
          <VerifyEmailChangeContent />
        </Suspense>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
