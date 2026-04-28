"use client";

import ResetPassword from "@/components/Signup/ResetPassword";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChangePasswordContent() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");
  return <ResetPassword resetToken={resetToken || ""} />;
}

export default function ChangePassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChangePasswordContent />
    </Suspense>
  );
}
