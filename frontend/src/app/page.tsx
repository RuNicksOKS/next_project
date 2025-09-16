"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Notification from "../components/ui/Notification";
import InstagramAuthLayout from "../components/layouts/InstagramAuthLayout";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentView, setCurrentView] = useState<
    "login" | "signup" | "forgot-password" | "reset-password"
  >("login");
  const [isClient, setIsClient] = useState(false);

  // 회원가입 관련 상태
  const [signupData, setSignupData] = useState({
    email: "",
    nickname: "",
    username: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });

  const [signupErrors, setSignupErrors] = useState({
    email: "",
    password: "",
    verificationCode: "",
  });

  const [signupTouched, setSignupTouched] = useState({
    email: false,
    nickname: false,
    username: false,
    password: false,
    confirmPassword: false,
    verificationCode: false,
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // 비밀번호 재설정 관련 상태
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    username: "",
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    username: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    username: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    setIsClient(true);
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setCurrentView("reset-password");
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("로그인 시도:", { email, password });
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
  ) => {
    setNotification({
      isVisible: true,
      message,
      type,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // 이메일 형식 검증 함수
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 일치 검증 함수
  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    return password === confirmPassword;
  };

  // 모든 필드의 유효성 검사가 통과되었는지 확인하는 함수
  const isSignupFormValid = () => {
    return (
      emailVerified &&
      validateEmail(signupData.email) &&
      signupData.nickname.trim() !== "" &&
      signupData.username.trim() !== "" &&
      signupData.password !== "" &&
      signupData.confirmPassword !== "" &&
      validatePasswordMatch(signupData.password, signupData.confirmPassword)
    );
  };

  // 이메일 인증번호 전송 함수
  const sendVerificationEmail = async () => {
    if (!validateEmail(signupData.email)) {
      setSignupErrors((prev) => ({
        ...prev,
        email: "올바른 이메일 형식이 아닙니다",
      }));
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test/send_verification_email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: signupData.email }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setEmailSent(true);
        showNotification(
          "인증번호가 전송되었습니다. 이메일을 확인해주세요.",
          "success",
        );
      } else {
        showNotification(
          result.error || "인증번호 전송에 실패했습니다.",
          "error",
        );
      }
    } catch (error) {
      console.error("이메일 전송 오류:", error);
      showNotification("서버 연결에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 이메일 인증번호 검증 함수
  const verifyEmailCode = async () => {
    if (!signupData.verificationCode) {
      setSignupErrors((prev) => ({
        ...prev,
        verificationCode: "인증번호를 입력해주세요",
      }));
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test/verify_email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: signupData.email,
            verification_code: signupData.verificationCode,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setEmailVerified(true);
        showNotification("이메일 인증이 완료되었습니다!", "success");
      } else {
        setSignupErrors((prev) => ({
          ...prev,
          verificationCode: result.error || "인증번호가 올바르지 않습니다",
        }));
      }
    } catch (error) {
      console.error("이메일 인증 오류:", error);
      showNotification("서버 연결에 실패했습니다. 다시 시도해주세요.", "error");
    }
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 실시간 유효성 검사
    if (name === "email") {
      if (value && !validateEmail(value)) {
        setSignupErrors((prev) => ({
          ...prev,
          email: "올바른 이메일 형식이 아닙니다",
        }));
      } else {
        setSignupErrors((prev) => ({ ...prev, email: "" }));
      }
      // 이메일이 변경되면 인증 상태 초기화
      if (value !== signupData.email) {
        setEmailVerified(false);
        setEmailSent(false);
      }
    }

    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : signupData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : signupData.confirmPassword;

      if (
        password &&
        confirmPassword &&
        !validatePasswordMatch(password, confirmPassword)
      ) {
        setSignupErrors((prev) => ({
          ...prev,
          password: "비밀번호가 일치하지 않습니다",
        }));
      } else {
        setSignupErrors((prev) => ({ ...prev, password: "" }));
      }
    }

    if (name === "verificationCode") {
      if (value && value.length !== 6) {
        setSignupErrors((prev) => ({
          ...prev,
          verificationCode: "인증번호는 6자리입니다",
        }));
      } else {
        setSignupErrors((prev) => ({ ...prev, verificationCode: "" }));
      }
    }
  };

  const handleSignupBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setSignupTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드를 touched로 설정
    setSignupTouched({
      email: true,
      nickname: true,
      username: true,
      password: true,
      confirmPassword: true,
      verificationCode: true,
    });

    // 이메일 인증 확인
    if (!emailVerified) {
      showNotification("이메일 인증을 완료해주세요.", "error");
      return;
    }

    // 최종 유효성 검사
    let hasErrors = false;
    const newErrors = { email: "", password: "", verificationCode: "" };

    if (!validateEmail(signupData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
      hasErrors = true;
    }

    if (
      !validatePasswordMatch(signupData.password, signupData.confirmPassword)
    ) {
      newErrors.password = "비밀번호가 일치하지 않습니다";
      hasErrors = true;
    }

    setSignupErrors(newErrors);

    if (hasErrors) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test/signup/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupData),
        },
      );

      const result = await response.json();

      if (result.success) {
        showNotification(
          "회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.",
          "success",
        );

        // 2초 후 로그인 화면으로 전환
        setTimeout(() => {
          setCurrentView("login");
          // 폼 초기화
          setSignupData({
            email: "",
            nickname: "",
            username: "",
            password: "",
            confirmPassword: "",
            verificationCode: "",
          });
          setSignupTouched({
            email: false,
            nickname: false,
            username: false,
            password: false,
            confirmPassword: false,
            verificationCode: false,
          });
          setSignupErrors({ email: "", password: "", verificationCode: "" });
          setEmailVerified(false);
          setEmailSent(false);
        }, 2000);
      } else {
        // 서버에서 오류 응답
        if (
          result.field === "email" &&
          result.error === "이미 존재하는 이메일입니다."
        ) {
          setSignupErrors({
            email: "이미 존재하는 이메일입니다",
            password: "",
            verificationCode: "",
          });
          setSignupTouched((prev) => ({ ...prev, email: true }));
        } else {
          showNotification(
            result.error || "회원가입 중 오류가 발생했습니다.",
            "error",
          );
        }
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      showNotification("서버 연결에 실패했습니다. 다시 시도해주세요.", "error");
    }
  };

  // 비밀번호 재설정 요청 함수
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isClient) return;

    // 폼 검증
    const newErrors = {
      email: "",
      username: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!forgotPasswordData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!forgotPasswordData.username) {
      newErrors.username = "사용자명을 입력해주세요.";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test/request_password_reset/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotPasswordData.email,
            username: forgotPasswordData.username,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showNotification(data.message, "success");
        setForgotPasswordData({ email: "", username: "" });
        setTouched({
          email: false,
          username: false,
          newPassword: false,
          confirmPassword: false,
        });
      } else {
        showNotification(data.error, "error");
      }
    } catch (error) {
      console.error("비밀번호 재설정 요청 오류:", error);
      showNotification("서버 오류가 발생했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 함수
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isClient || !token) return;

    // 폼 검증
    const newErrors = {
      email: "",
      username: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!resetPasswordData.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (resetPasswordData.newPassword.length < 6) {
      newErrors.newPassword = "비밀번호는 최소 6자 이상이어야 합니다.";
    }

    if (!resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (
      resetPasswordData.newPassword !== resetPasswordData.confirmPassword
    ) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test/reset_password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            new_password: resetPasswordData.newPassword,
            confirm_password: resetPasswordData.confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showNotification(data.message, "success");
        setTimeout(() => {
          setCurrentView("login");
          setResetPasswordData({ newPassword: "", confirmPassword: "" });
          setTouched({
            email: false,
            username: false,
            newPassword: false,
            confirmPassword: false,
          });
        }, 3000);
      } else {
        showNotification(data.error, "error");
      }
    } catch (error) {
      console.error("비밀번호 재설정 오류:", error);
      showNotification("서버 오류가 발생했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "forgot" | "reset",
  ) => {
    const { name, value } = e.target;

    if (formType === "forgot") {
      setForgotPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setResetPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // 입력 시 에러 메시지 제거
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  return (
    <InstagramAuthLayout>
      {!isClient ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : currentView === "login" ? (
        <>
          {/* 로그인 폼 컨테이너 */}
          <div className={styles.loginForm}>
            {/* Instagram 로고 */}
            <div className={styles.logoContainer}>
              <h1 className={styles.logo}>Instagram</h1>
            </div>

            {/* 로그인 폼 */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* 이메일/사용자명 입력 */}
              <div>
                <input
                  type="text"
                  placeholder="전화번호, 사용자 이름 또는 이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              {/* 로그인 버튼 */}
              <button type="submit" className={styles.loginButton}>
                로그인
              </button>
            </form>

            {/* 구분선 */}
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>또는</span>
              <div className={styles.dividerLine}></div>
            </div>

            {/* 비밀번호 찾기 */}
            <div className={styles.forgotPassword}>
              <Link
                href="/forgot-password"
                className={styles.forgotPasswordLink}
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          {/* 회원가입 링크 */}
          <div className={styles.signupContainer}>
            <p className={styles.signupText}>
              계정이 없으신가요?{" "}
              <Link href="/signup" className={styles.signupLink}>
                가입하기
              </Link>
            </p>
          </div>
        </>
      ) : currentView === "signup" ? (
        <>
          {/* 회원가입 폼 컨테이너 */}
          <div className={styles.loginForm}>
            {/* Instagram 로고 */}
            <div className={styles.logoContainer}>
              <h1 className={styles.logo}>Instagram</h1>
            </div>

            <div className={styles.header}>
              <p className={styles.subtitle}>
                친구들의 사진과 동영상을 보려면 가입하세요.
              </p>
            </div>

            {/* 회원가입 폼 */}
            <form onSubmit={handleSignupSubmit} className={styles.form}>
              {/* 이메일 입력 */}
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  value={signupData.email}
                  onChange={handleSignupInputChange}
                  onBlur={handleSignupBlur}
                  className={`${styles.inputField} ${signupErrors.email && signupTouched.email ? styles.inputError : ""}`}
                />
                {signupErrors.email && signupTouched.email && (
                  <span className={styles.errorText}>{signupErrors.email}</span>
                )}
              </div>

              {/* 닉네임 입력 */}
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="nickname"
                  placeholder="성명"
                  value={signupData.nickname}
                  onChange={handleSignupInputChange}
                  onBlur={handleSignupBlur}
                  className={styles.inputField}
                />
              </div>

              {/* 사용자명 입력 */}
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="username"
                  placeholder="사용자 이름"
                  value={signupData.username}
                  onChange={handleSignupInputChange}
                  onBlur={handleSignupBlur}
                  className={styles.inputField}
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  value={signupData.password}
                  onChange={handleSignupInputChange}
                  onBlur={handleSignupBlur}
                  className={`${styles.inputField} ${signupErrors.password && signupTouched.password ? styles.inputError : ""}`}
                />
                {signupErrors.password && signupTouched.password && (
                  <span className={styles.errorText}>
                    {signupErrors.password}
                  </span>
                )}
              </div>

              {/* 비밀번호 확인 입력 */}
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="비밀번호 확인"
                  value={signupData.confirmPassword}
                  onChange={handleSignupInputChange}
                  onBlur={handleSignupBlur}
                  className={styles.inputField}
                />
              </div>

              {/* 이메일 인증 섹션 */}
              {signupData.email && validateEmail(signupData.email) && (
                <div className={styles.verificationSection}>
                  {!emailSent ? (
                    <button
                      type="button"
                      onClick={sendVerificationEmail}
                      disabled={isSendingEmail}
                      className={styles.verificationButton}
                    >
                      {isSendingEmail ? "전송 중..." : "인증번호 전송"}
                    </button>
                  ) : !emailVerified ? (
                    <div className={styles.verificationInput}>
                      <input
                        type="text"
                        name="verificationCode"
                        placeholder="인증번호 6자리"
                        value={signupData.verificationCode}
                        onChange={handleSignupInputChange}
                        onBlur={handleSignupBlur}
                        maxLength={6}
                        className={`${styles.inputField} ${signupErrors.verificationCode && signupTouched.verificationCode ? styles.inputError : ""}`}
                      />
                      <button
                        type="button"
                        onClick={verifyEmailCode}
                        className={styles.verifyButton}
                      >
                        인증
                      </button>
                      {signupErrors.verificationCode &&
                        signupTouched.verificationCode && (
                          <span className={styles.errorText}>
                            {signupErrors.verificationCode}
                          </span>
                        )}
                    </div>
                  ) : (
                    <div className={styles.verifiedMessage}>
                      ✅ 이메일 인증이 완료되었습니다
                    </div>
                  )}
                </div>
              )}

              {/* 회원가입 버튼 */}
              <button
                type="submit"
                className={`${styles.loginButton} ${!isSignupFormValid() ? styles.buttonDisabled : ""}`}
                disabled={!isSignupFormValid()}
              >
                가입하기
              </button>
            </form>

            <div className={styles.footer}>
              <button
                type="button"
                onClick={() => setCurrentView("login")}
                className={styles.backButton}
              >
                로그인으로 돌아가기
              </button>
            </div>
          </div>
        </>
      ) : currentView === "forgot-password" ? (
        <>
          {/* 비밀번호 재설정 요청 폼 */}
          <div className={styles.loginForm}>
            {/* Instagram 로고 */}
            <div className={styles.logoContainer}>
              <h1 className={styles.logo}>Instagram</h1>
            </div>

            <div className={styles.header}>
              <p className={styles.subtitle}>비밀번호를 잊으셨나요?</p>
              <p className={styles.description}>
                계정에 등록된 이메일과 사용자명을 입력하시면
                <br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  value={forgotPasswordData.email}
                  onChange={(e) => handleInputChange(e, "forgot")}
                  onBlur={handleInputBlur}
                  className={`${styles.inputField} ${errors.email && touched.email ? styles.inputError : ""}`}
                  disabled={isLoading}
                />
                {errors.email && touched.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="username"
                  placeholder="사용자명"
                  value={forgotPasswordData.username}
                  onChange={(e) => handleInputChange(e, "forgot")}
                  onBlur={handleInputBlur}
                  className={`${styles.inputField} ${errors.username && touched.username ? styles.inputError : ""}`}
                  disabled={isLoading}
                />
                {errors.username && touched.username && (
                  <span className={styles.errorText}>{errors.username}</span>
                )}
              </div>

              <button
                type="submit"
                className={`${styles.loginButton} ${isLoading ? styles.buttonLoading : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "전송 중..." : "비밀번호 재설정 링크 보내기"}
              </button>
            </form>

            <div className={styles.footer}>
              <button
                type="button"
                onClick={() => setCurrentView("login")}
                className={styles.backButton}
              >
                로그인으로 돌아가기
              </button>
            </div>
          </div>
        </>
      ) : currentView === "reset-password" ? (
        <>
          {/* 비밀번호 재설정 폼 */}
          <div className={styles.loginForm}>
            {/* Instagram 로고 */}
            <div className={styles.logoContainer}>
              <h1 className={styles.logo}>Instagram</h1>
            </div>

            <div className={styles.header}>
              <p className={styles.subtitle}>새 비밀번호 설정</p>
              <p className={styles.description}>
                새로운 비밀번호를 입력해주세요.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="새 비밀번호"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => handleInputChange(e, "reset")}
                  onBlur={handleInputBlur}
                  className={`${styles.inputField} ${errors.newPassword && touched.newPassword ? styles.inputError : ""}`}
                  disabled={isLoading}
                />
                {errors.newPassword && touched.newPassword && (
                  <span className={styles.errorText}>{errors.newPassword}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="새 비밀번호 확인"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => handleInputChange(e, "reset")}
                  onBlur={handleInputBlur}
                  className={`${styles.inputField} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ""}`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <span className={styles.errorText}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`${styles.loginButton} ${isLoading ? styles.buttonLoading : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : "비밀번호 변경"}
              </button>
            </form>

            <div className={styles.footer}>
              <button
                type="button"
                onClick={() => setCurrentView("login")}
                className={styles.backButton}
              >
                로그인으로 돌아가기
              </button>
            </div>
          </div>
        </>
      ) : null}

      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      )}
    </InstagramAuthLayout>
  );
}
