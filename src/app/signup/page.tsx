"use client";
import ReadyToWatch from "@/components/Signup/ReadyToWatch";
import VerifyEmail from "@/components/Signup/VerifyEmail";
import { Header } from "@/components/HomePage/Header";
import { useState } from "react";

import { AuthResponse } from "@/types/auth";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);

  const handleNextStep = (data: AuthResponse) => {
    // if (data.link) {
    //   // window.location.href = data.link;
    //   // return;
    // }
    setAuthData(data);
    setStep((prevStep) => prevStep + 1);
  };

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Header />
      <div className="flex-grow">
        {step === 1 && <ReadyToWatch onNextStep={handleNextStep} />}
        {step === 2 && <VerifyEmail authData={authData} />}
      </div>
    </div>
  );
}
