import { useMutation } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgetPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [newEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const sendOTPMutation = useMutation({
    mutationFn: async (emailToUse: string) => {
      const res = await api.post(API_ROUTES.AUTH.FORGET_PASSWORD, {
        email: emailToUse,
      });
      return res.data;
    },
    onSuccess: () => {
      setStep("otp");
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(API_ROUTES.AUTH.VERIFY_FORGET_PASSWORD_OTP, {
        email: email,
        otp: otp.join(""),
      });
      return res.data;
    },
    onSuccess: () => {
      setStep("reset");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(API_ROUTES.AUTH.RESET_PASSWORD, {
        email: email,
        otp: otp.join(""),
        newPassword: password,
      });
      return res.data;
    },
    onSuccess: () => {
      navigate("/login");
    },
  });

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = newEmail || email;
    if (!emailToUse) {
      alert("Please enter an email address");
      return;
    }
    setEmail(emailToUse);
    sendOTPMutation.mutate(emailToUse);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length !== 6) {
      alert("Please enter complete OTP");
      return;
    }
    verifyOTPMutation.mutate();
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    resetPasswordMutation.mutate();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="p-8 lg:p-10">
            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === "email"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-1 flex-1 ${
                    step === "otp" || step === "reset"
                      ? "bg-primary"
                      : "bg-border"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === "otp"
                      ? "bg-primary text-primary-foreground"
                      : step === "reset"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <div
                  className={`h-1 flex-1 ${
                    step === "reset" ? "bg-primary" : "bg-border"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === "reset"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
              </div>
            </div>

            {/* Step 1: Email */}
            {step === "email" && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={32} style={{ color: "var(--primary)" }} />
                  </div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Forgot Password?
                  </h1>
                  <p style={{ color: "var(--muted-foreground)" }}>
                    Enter your email address and we'll send you an OTP to reset
                    your password
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail
                          size={20}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        placeholder="you@example.com"
                        style={
                          {
                            backgroundColor: "var(--input)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--primary)",
                          } as any
                        }
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className="w-full border-t"
                        style={{ borderColor: "var(--border)" }}
                      ></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                     
                    </div>
                  </div>

              

                  <button
                    type="submit"
                    disabled={sendOTPMutation.isPending}
                    className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {sendOTPMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-4 w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} style={{ color: "var(--primary)" }} />
                  </div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Verify OTP
                  </h1>
                  <p style={{ color: "var(--muted-foreground)" }}>
                    We've sent a 6-digit code to <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-4 text-center"
                      style={{ color: "var(--foreground)" }}
                    >
                      Enter OTP
                    </label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOTPChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOTPKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={
                            {
                              backgroundColor: "var(--input)",
                              borderColor: "var(--border)",
                              color: "var(--foreground)",
                              border: "1px solid var(--border)",
                              "--tw-ring-color": "var(--primary)",
                            } as any
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={verifyOTPMutation.isPending}
                    className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {verifyOTPMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="mt-4 w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2
                      size={32}
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Reset Password
                  </h1>
                  <p style={{ color: "var(--muted-foreground)" }}>
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock
                          size={20}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        placeholder="••••••••"
                        style={
                          {
                            backgroundColor: "var(--input)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--primary)",
                          } as any
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock
                          size={20}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        placeholder="••••••••"
                        style={
                          {
                            backgroundColor: "var(--input)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--primary)",
                          } as any
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
