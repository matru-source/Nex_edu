import { useMutation } from "@tanstack/react-query";
import type {
  VerifyOTPRequestParams,
} from "../../types/zod";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { useEffect, useState } from "react";
import {
  Eye,
  EyeClosed,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Target,
  Briefcase,
  Linkedin,
  Chrome,
  ArrowLeft,
} from "lucide-react";
import type { Response } from "../../types";
import { userStore } from "../../state/global";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface SignupResponse extends Response {
  data: {
    message: string;
  };
}

interface VerifyOTPResponse extends Response {
  data: {
    user: any;
    token: string;
  };
}

const features = [
  {
    icon: <CheckCircle2 size={24} />,
    title: "Learn from Experts",
    description: "Get access to courses created by industry professionals",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "Flexible Learning",
    description: "Study at your own pace with lifetime access to courses",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "Career Growth",
    description: "Advance your skills and boost your career prospects",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "Certifications",
    description: "Earn recognized certificates upon course completion",
  },
];

const goals = [
  "Career Change",
  "Skill Enhancement",
  "Certification",
  "Personal Interest",
  "Job Promotion",
  "Entrepreneurship",
];

const currentStatuses = [
  "Student",
  "Professional",
  "Unemployed",
  "Entrepreneur",
  "Freelancer",
  "Other",
];

export default function Signup() {
  // ✅ Change to 3 steps
  const [step, setStep] = useState<"basic" | "verify" | "additional">("basic");
  const [showPassword, setShowPassword] = useState(false);
  const [, setAnimatedFeatures] = useState(0);
  const [basicFormData, setBasicFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [emailForOTP, setEmailForOTP] = useState("");
  const [additionalFormData, setAdditionalFormData] = useState({
    goal: "",
    currentStatus: "",
  });

  const setToken = userStore((state) => state.setToken);
  const setUser = userStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  // Cycle through features animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedFeatures((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Step 1: Send signup (basic info only)
  const signupMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      const res = await api.post<SignupResponse>(API_ROUTES.AUTH.SIGNUP, {
        ...data,
        goal: "",
        currentStatus: "",
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      setEmailForOTP(variables.email);
      setStep("verify");
    },
  });

  // ✅ Step 2: Verify OTP
  const verifyOTPMutation = useMutation({
    mutationFn: async (data: VerifyOTPRequestParams) => {
      const res = await api.post<VerifyOTPResponse>(
        API_ROUTES.AUTH.VERIFY_OTP,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      // Store token and user temporarily, but don't navigate yet
      setToken(data.data.token);
      setUser(data.data.user);
      setStep("additional");
    },
  });

  // ✅ Step 3: Update user with additional info
  const completeSignupMutation = useMutation({
    mutationFn: async () => {
      // Update user profile with goal and status
      // You'll need to create this endpoint or use existing user update endpoint
      const res = await api.put(API_ROUTES.USER.UPDATE_PROFILE, {
        goal: additionalFormData.goal || null,
        currentStatus: additionalFormData.currentStatus || null,
      });
      return res.data;
    },
    onSuccess: () => {
      const redirect = location.state?.redirect || "/dashboard";
      navigate(redirect);
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(API_ROUTES.AUTH.RESEND_OTP, {
        email: emailForOTP,
      });
      return res.data;
    },
    onSuccess: () => {
      alert("OTP resent to your email");
    },
  });

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdditionalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
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

  // ✅ Step 1: Handle basic info submit
  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (basicFormData.password !== basicFormData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const { confirmPassword, ...signupData } = basicFormData;
    signupMutation.mutate(signupData);
  };

  // ✅ Step 2: Handle OTP verify
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      alert("Please enter complete OTP");
      return;
    }
    verifyOTPMutation.mutate({ email: emailForOTP, otp: otpString });
  };

  // ✅ Step 3: Handle complete signup
  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeSignupMutation.mutate();
  };

  const goToPreviousStep = () => {
    if (step === "verify") {
      setStep("basic");
      setOtp(["", "", "", "", "", ""]);
    } else if (step === "additional") {
      setStep("verify");
      setOtp(["", "", "", "", "", ""]);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: "var(--background)" }}
    >

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[40%_60%] gap-0 items-start">
        {/* Left Side - Features & Animation */}
        <div className="hidden lg:flex flex-col justify-start space-y-8 pl-8 pr-12 py-8">
          <div>
            <h2
              className="text-5xl font-bold mb-4 leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              Welcome to
              <span className="block" style={{ color: "var(--primary)" }}>
                ERPBugs LMS
              </span>
            </h2>
            <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
              Unlock your potential with industry-leading courses and expert
              instruction
            </p>
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            <div
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors"
              style={{ backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <Target size={24} />
              </div>
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Expert-Led Courses
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Learn from industry professionals with real-world experience
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors"
              style={{ backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Lifetime Access
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Study at your own pace with permanent access to all content
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors"
              style={{ backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <Briefcase size={24} />
              </div>
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Career Advancement
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Gain skills employers value and boost your career prospects
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors"
              style={{ backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Certificates
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Earn recognized certificates to showcase your achievements
                </p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div
            className="pt-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className="text-3xl font-bold"
                  style={{ color: "var(--primary)" }}
                >
                  10K+
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Students
                </p>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl font-bold"
                  style={{ color: "var(--primary)" }}
                >
                  500+
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Courses
                </p>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl font-bold"
                  style={{ color: "var(--primary)" }}
                >
                  4.8★
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Rating
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Multi-step Form */}
        <div className="flex items-center justify-center lg:pl-8 py-12">
          <div
            className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            style={{ backgroundColor: "var(--card)" }}
          >
            <div className="p-8 lg:p-10">
              {/* Step Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === "basic"
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`h-1 flex-1 ${
                      step === "verify" || step === "additional"
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === "verify"
                        ? "bg-primary text-primary-foreground"
                        : step === "additional"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    2
                  </div>
                  <div
                    className={`h-1 flex-1 ${
                      step === "additional" ? "bg-primary" : "bg-border"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === "additional"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    3
                  </div>
                </div>
              </div>

              {/* STEP 1: Basic Info */}
              {step === "basic" && (
                <>
                  <div className="lg:hidden text-center mb-8">
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Create Account
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>
                      Sign up to start learning
                    </p>
                  </div>

                  <div className="hidden lg:block text-center mb-8">
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Sign Up
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>
                      Create your account to get started
                    </p>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-3 mb-6">
                    <button
                      type="button"
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 border hover:opacity-80"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        backgroundColor: "var(--input)",
                      }}
                    >
                      <Chrome size={20} />
                      Continue with Google
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 border hover:opacity-80 col-span-2"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                          backgroundColor: "var(--input)",
                        }}
                      >
                        <Linkedin size={20} />
                        LinkedIn
                      </button>
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className="w-full border-t"
                        style={{ borderColor: "var(--border)" }}
                      ></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span style={{ color: "var(--muted-foreground)" }}>
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleBasicSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User
                            size={20}
                            style={{ color: "var(--muted-foreground)" }}
                          />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={basicFormData.name}
                          onChange={handleBasicChange}
                          className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                          placeholder="John Doe"
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

                    {/* Email Field */}
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
                          name="email"
                          type="email"
                          required
                          value={basicFormData.email}
                          onChange={handleBasicChange}
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

                    {/* Password Field */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Password
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
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={basicFormData.password}
                          onChange={handleBasicChange}
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
                          {showPassword ? (
                            <Eye
                              size={20}
                              style={{ color: "var(--muted-foreground)" }}
                            />
                          ) : (
                            <EyeClosed
                              size={20}
                              style={{ color: "var(--muted-foreground)" }}
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
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
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          value={basicFormData.confirmPassword}
                          onChange={handleBasicChange}
                          className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
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

                    {/* Next Button */}
                    <button
                      type="submit"
                      disabled={signupMutation.isPending}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {signupMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  {signupMutation.isError && (
                    <div
                      className="mt-4 p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                      }}
                    >
                      <p className="text-sm">
                        {signupMutation.error instanceof Error
                          ? signupMutation.error.message
                          : "Signup failed. Please try again."}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: OTP Verification */}
              {step === "verify" && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={32} style={{ color: "var(--primary)" }} />
                    </div>
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Verify Your Email
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>
                      We've sent a 6-digit code to{" "}
                      <strong>{emailForOTP}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifySubmit} className="space-y-6">
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
                          Next
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => resendOTPMutation.mutate()}
                        disabled={resendOTPMutation.isPending}
                        className="text-sm font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        {resendOTPMutation.isPending
                          ? "Sending..."
                          : "Resend OTP"}
                      </button>
                    </div>
                  </form>

                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="mt-4 w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  {verifyOTPMutation.isError && (
                    <div
                      className="mt-4 p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                      }}
                    >
                      <p className="text-sm">
                        {verifyOTPMutation.error instanceof Error
                          ? verifyOTPMutation.error.message
                          : "Verification failed. Please try again."}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 3: Additional Info */}
              {step === "additional" && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target size={32} style={{ color: "var(--primary)" }} />
                    </div>
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Tell Us About Yourself
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>
                      Help us personalize your learning experience (Optional)
                    </p>
                  </div>

                  <form onSubmit={handleCompleteSubmit} className="space-y-5">
                    {/* Goal Field */}
                    <div>
                      <label
                        htmlFor="goal"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        <Target size={16} className="inline mr-1" />
                        Learning Goal (Optional)
                      </label>
                      <select
                        id="goal"
                        name="goal"
                        value={additionalFormData.goal}
                        onChange={handleAdditionalChange}
                        className="block w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={
                          {
                            backgroundColor: "var(--input)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--primary)",
                          } as any
                        }
                      >
                        <option value="">Select your goal</option>
                        {goals.map((goal) => (
                          <option key={goal} value={goal}>
                            {goal}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Current Status Field */}
                    <div>
                      <label
                        htmlFor="currentStatus"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        <Briefcase size={16} className="inline mr-1" />
                        Current Status (Optional)
                      </label>
                      <select
                        id="currentStatus"
                        name="currentStatus"
                        value={additionalFormData.currentStatus}
                        onChange={handleAdditionalChange}
                        className="block w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={
                          {
                            backgroundColor: "var(--input)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--primary)",
                          } as any
                        }
                      >
                        <option value="">Select your status</option>
                        {currentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Complete Button */}
                    <button
                      type="submit"
                      disabled={completeSignupMutation.isPending}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {completeSignupMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Signup
                          <CheckCircle2 size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="mt-4 w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  {completeSignupMutation.isError && (
                    <div
                      className="mt-4 p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                      }}
                    >
                      <p className="text-sm">
                        {completeSignupMutation.error instanceof Error
                          ? completeSignupMutation.error.message
                          : "Failed to complete signup. Please try again."}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Sign In Link - Only show on step 1 */}
              {step === "basic" && (
                <div
                  className="mt-8 text-center"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      Sign in
                    </Link>
                  </p>
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <ArrowLeft size={16} />
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="py-4 px-6"
              style={{
                backgroundColor: "var(--muted)",
                borderTop: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs text-center"
                style={{ color: "var(--muted-foreground)" }}
              >
                By signing up, you agree to our{" "}
                <a href="#" className="underline hover:opacity-70">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:opacity-70">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
