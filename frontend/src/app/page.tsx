'use client'

import { useState } from "react";
import NextAuthLayout from "../components/mainpage/NextAuthLayout";
import LoginForm from "../components/login/LoginForm";
import EmailVerification from "../components/email_verification/EmailVerification";

export default function Home() {
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const handleSignupClick = () => {
    setShowEmailVerification(true);
  };

  const handleVerificationComplete = () => {
    // 인증 완료 후 /signup 페이지로 이동
    window.location.href = "/signup";
  };

  return (
    <NextAuthLayout>
      {showEmailVerification ? (
        <EmailVerification onComplete={handleVerificationComplete} />
      ) : (
        <LoginForm onSignupClick={handleSignupClick} />
      )}
    </NextAuthLayout>
  );
}
