import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { uploadMediaFile } from "../../lib/upload";
import TopBar from "../lazy/TopBar";
import {
  User,
  Mail,
  Camera,
  X,
  CheckCircle2,
  Lock,
  CreditCard,
  Edit,
  Trash2,
  BookOpen,
  Award,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import Modal from "../lazy/Modal";
import ConfirmDialog from "../lazy/ConfirmDialog";
import type { Response } from "../../types";
import { useToast } from "../../contexts/ToastContext";


interface ProfileResponse extends Response {
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      profilePhoto?: string | null;
      phone?: string | null;
      bio?: string | null;
      dateOfBirth?: string | null;
      location?: string | null;
      website?: string | null;
      linkedinUrl?: string | null;
      twitterUrl?: string | null;
      goal?: string | null;
      currentStatus?: string | null;
      emailVerified: boolean;
    };
    stats: {
      coursesEnrolled: number;
      lessonsCompleted: number;
      quizzesCompleted: number;
      totalLearningHours: number;
    };
  };
}

interface BillingInfo {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  cardLast4?: string | null;
  cardBrand?: string | null;
  cardExpiryMonth?: number | null;
  cardExpiryYear?: number | null;
  isDefault: boolean;
}

interface BillingInfoResponse extends Response {
  data: BillingInfo[];
}

type TabType = "personal" | "account" | "billing" | "security";

export default function Profile() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [editBillingOpen, setEditBillingOpen] = useState(false);
  const [deleteBillingOpen, setDeleteBillingOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<BillingInfo | null>(
    null
  );
  const [emailChangeStep, setEmailChangeStep] = useState<"request" | "verify">(
    "request"
  );
  const [newEmail, setNewEmail] = useState("");
  const [emailOTP, setEmailOTP] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  // Fetch profile data
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<ProfileResponse>(API_ROUTES.USER.GET_PROFILE);
      return res.data;
    },
  });

  // Fetch billing info
  const billingQuery = useQuery({
    queryKey: ["billing-info"],
    queryFn: async () => {
      const res = await api.get<BillingInfoResponse>(
        API_ROUTES.USER.GET_BILLING
      );
      return res.data;
    },
  });

  const profileData = profileQuery.data?.data;
  const billingData = billingQuery.data?.data || [];

  // Update profile mutation
 const updateProfileMutation = useMutation({
   mutationFn: async (data: any) => {
     const res = await api.put(API_ROUTES.USER.UPDATE_PROFILE, data);
     return res.data;
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["profile"] });
     success("Profile updated successfully!");
   },
   onError: (err: any) => {
     const message =
       err?.response?.data?.message ||
       "Failed to update profile. Please try again.";
     error(message);
   },
 });

 const updatePhotoMutation = useMutation({
   mutationFn: async (photoUrl: string) => {
     const res = await api.post(API_ROUTES.USER.UPDATE_PROFILE_PHOTO, {
       photoUrl,
     });
     return res.data;
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["profile"] });
     setIsUploadingPhoto(false);
     success("Profile photo updated successfully!");
   },
   onError: () => {
     setIsUploadingPhoto(false);
     error("Failed to update profile photo. Please try again.");
   },
 });

 // Remove photo mutation
 const removePhotoMutation = useMutation({
   mutationFn: async () => {
     const res = await api.delete(API_ROUTES.USER.REMOVE_PROFILE_PHOTO);
     return res.data;
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["profile"] });
     success("Profile photo removed successfully!");
   },
   onError: () => {
     error("Failed to remove profile photo. Please try again.");
   },
 });

  // Handle file upload
  const handlePhotoUpload = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      error("Please select a valid image file.");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const result = await uploadMediaFile(file, { folder: "erp-bugs/profiles" });
      updatePhotoMutation.mutate(result.fileUrl);
    } catch (err) {
      console.error(err);
      setIsUploadingPhoto(false);
      error("Failed to upload photo. Please try again.");
    }
  };

  // Request email change mutation
 const requestEmailChangeMutation = useMutation({
   mutationFn: async (email: string) => {
     const res = await api.post(API_ROUTES.USER.REQUEST_EMAIL_CHANGE, {
       newEmail: email,
     });
     return res.data;
   },
   onSuccess: () => {
     setEmailChangeStep("verify");
     success("OTP sent to new email address!");
   },
   onError: (err: any) => {
     const message =
       err?.response?.data?.message || "Failed to send OTP. Please try again.";
     error(message);
   },
 });

  // Verify email change mutation
   const verifyEmailChangeMutation = useMutation({
     mutationFn: async (data: { newEmail: string; otp: string }) => {
       const res = await api.post(API_ROUTES.USER.VERIFY_EMAIL_CHANGE, data);
       return res.data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["profile"] });
       setEmailChangeStep("request");
       setNewEmail("");
       setEmailOTP("");
       success("Email changed successfully!");
     },
     onError: (err: any) => {
       const message =
         err?.response?.data?.message ||
         "Failed to verify OTP. Please try again.";
       error(message);
     },
   });

   // Change password mutation
   const changePasswordMutation = useMutation({
     mutationFn: async (data: {
       currentPassword: string;
       newPassword: string;
     }) => {
       const res = await api.post(API_ROUTES.USER.CHANGE_PASSWORD, data);
       return res.data;
     },
     onSuccess: () => {
       setShowPasswordForm(false);
       success("Password changed successfully!");
     },
     onError: (err: any) => {
       const message =
         err?.response?.data?.message ||
         "Failed to change password. Please try again.";
       error(message);
     },
   });

   // Billing mutations
   const createBillingMutation = useMutation({
     mutationFn: async (data: any) => {
       const res = await api.post(API_ROUTES.USER.CREATE_BILLING, data);
       return res.data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["billing-info"] });
       setEditBillingOpen(false);
       setSelectedBilling(null);
       success("Billing information added successfully!");
     },
     onError: (err: any) => {
       const message =
         err?.response?.data?.message ||
         "Failed to add billing information. Please try again.";
       error(message);
     },
   });

   const updateBillingMutation = useMutation({
     mutationFn: async ({ id, data }: { id: string; data: any }) => {
       const res = await api.put(API_ROUTES.USER.UPDATE_BILLING(id), data);
       return res.data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["billing-info"] });
       setEditBillingOpen(false);
       setSelectedBilling(null);
       success("Billing information updated successfully!");
     },
     onError: (err: any) => {
       const message =
         err?.response?.data?.message ||
         "Failed to update billing information. Please try again.";
       error(message);
     },
   });

   const deleteBillingMutation = useMutation({
     mutationFn: async (id: string) => {
       const res = await api.delete(API_ROUTES.USER.DELETE_BILLING(id));
       return res.data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["billing-info"] });
       setDeleteBillingOpen(false);
       setSelectedBilling(null);
       success("Billing information deleted successfully!");
     },
     onError: (err: any) => {
       const message =
         err?.response?.data?.message ||
         "Failed to delete billing information. Please try again.";
       error(message);
     },
   });

   const setDefaultBillingMutation = useMutation({
     mutationFn: async (id: string) => {
       const res = await api.put(API_ROUTES.USER.SET_DEFAULT_BILLING(id));
       return res.data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["billing-info"] });
       success("Default billing information updated!");
     },
     onError: (err: any) => {
       const message =
         err?.response?.data?.message ||
         "Failed to set default billing. Please try again.";
       error(message);
     },
   });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (profileQuery.isLoading) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-xl mb-6"></div>
            <div className="h-96 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--background)] min-h-screen">
      <TopBar />
      <div className="p-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent rounded-2xl p-8 mb-6 border border-[var(--border)]">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--card)] shadow-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/60 flex items-center justify-center relative">
                {isUploadingPhoto ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : profileData.user.profilePhoto ? (
                  <img
                    src={profileData.user.profilePhoto}
                    alt={profileData.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {getInitials(profileData.user.name)}
                  </span>
                )}
              </div>
              {!isUploadingPhoto && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer"
                    title="Change photo"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  {profileData.user.profilePhoto && (
                    <button
                      onClick={() => {
                        if (confirm("Remove profile photo?")) {
                          removePhotoMutation.mutate();
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-[var(--destructive)] text-white rounded-full p-1.5 hover:bg-[var(--destructive)]/80 transition-colors shadow-lg z-10"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePhotoUpload(file);
                  }
                }}
                disabled={isUploadingPhoto}
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[var(--foreground)]">
                  {profileData.user.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/20 text-[var(--primary)]">
                  {profileData.user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-4">
                <Mail size={16} />
                <span>{profileData.user.email}</span>
                {profileData.user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500 border border-green-500/30">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                    <X size={12} />
                    Not Verified
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={18} className="text-[var(--primary)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Courses
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {profileData.stats.coursesEnrolled}
                  </p>
                </div>
                <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Completed
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {profileData.stats.lessonsCompleted}
                  </p>
                </div>
                <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={18} className="text-yellow-500" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Quizzes
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {profileData.stats.quizzesCompleted}
                  </p>
                </div>
                <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={18} className="text-blue-500" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Hours
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {profileData.stats.totalLearningHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="flex border-b border-[var(--border)]">
            {[
              { id: "personal", label: "Personal Information", icon: User },
              { id: "account", label: "Account Settings", icon: Mail },
              { id: "billing", label: "Billing Information", icon: CreditCard },
              { id: "security", label: "Security", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] border-b-2 border-[var(--primary)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/30"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <PersonalInfoTab
                user={profileData.user}
                onUpdate={(data) => updateProfileMutation.mutate(data)}
                isLoading={updateProfileMutation.isPending}
              />
            )}

            {/* Account Settings Tab */}
            {activeTab === "account" && (
              <AccountSettingsTab
                user={profileData.user}
                emailChangeStep={emailChangeStep}
                setEmailChangeStep={setEmailChangeStep} // ✅ Add this
                newEmail={newEmail}
                setNewEmail={setNewEmail}
                emailOTP={emailOTP}
                setEmailOTP={setEmailOTP}
                onRequestEmailChange={(email) =>
                  requestEmailChangeMutation.mutate(email)
                }
                onVerifyEmailChange={(data) =>
                  verifyEmailChangeMutation.mutate(data)
                }
                isLoadingRequest={requestEmailChangeMutation.isPending}
                isLoadingVerify={verifyEmailChangeMutation.isPending}
              />
            )}

            {/* Billing Information Tab */}
            {activeTab === "billing" && (
              <BillingInfoTab
                billingData={billingData}
                onEdit={(billing) => {
                  setSelectedBilling(billing);
                  setEditBillingOpen(true);
                }}
                onDelete={(billing) => {
                  setSelectedBilling(billing);
                  setDeleteBillingOpen(true);
                }}
                onSetDefault={(id) => setDefaultBillingMutation.mutate(id)}
                onCreate={() => {
                  setSelectedBilling(null);
                  setEditBillingOpen(true);
                }}
                isLoading={setDefaultBillingMutation.isPending}
              />
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <SecurityTab
                showPasswordForm={showPasswordForm}
                setShowPasswordForm={setShowPasswordForm}
                onChangePassword={(data) => changePasswordMutation.mutate(data)}
                isLoading={changePasswordMutation.isPending}
                onError={(message) => error(message)} // Add this
              />
            )}
          </div>
        </div>
      </div>

      {/* Billing Edit Modal */}
      <BillingEditModal
        open={editBillingOpen}
        billing={selectedBilling}
        onClose={() => {
          setEditBillingOpen(false);
          setSelectedBilling(null);
        }}
        onSave={(data) => {
          if (selectedBilling) {
            updateBillingMutation.mutate({ id: selectedBilling.id, data });
          } else {
            createBillingMutation.mutate(data);
          }
        }}
        isLoading={
          createBillingMutation.isPending || updateBillingMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteBillingOpen}
        title="Delete Billing Information"
        description={`Are you sure you want to delete this billing information? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() =>
          selectedBilling && deleteBillingMutation.mutate(selectedBilling.id)
        }
        onClose={() => {
          setDeleteBillingOpen(false);
          setSelectedBilling(null);
        }}
        loading={deleteBillingMutation.isPending}
      />
    </div>
  );
}

// Personal Information Tab Component
function PersonalInfoTab({
  user,
  onUpdate,
  isLoading,
}: {
  user: ProfileResponse["data"]["user"];
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || "",
    bio: user.bio || "",
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    location: user.location || "",
    website: user.website || "",
    linkedinUrl: user.linkedinUrl || "",
    twitterUrl: user.twitterUrl || "",
    goal: user.goal || "",
    currentStatus: user.currentStatus || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <User className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Full Name <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50
                         disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50 resize-none
                         min-h-[120px]"
              placeholder="Tell us about yourself, your background, and what you're passionate about..."
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--muted-foreground)]">
                Share a brief introduction about yourself
              </p>
              <p
                className={`text-xs font-medium ${
                  formData.bio.length > 450
                    ? "text-[var(--destructive)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {formData.bio.length}/500
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <User className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Personal Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50
                         [&::-webkit-calendar-picker-indicator]:cursor-pointer
                         [&::-webkit-calendar-picker-indicator]:opacity-70
                         [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="City, Country"
            />
          </div>
        </div>
      </div>

      {/* Professional Links Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <BookOpen className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Professional Links
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkedinUrl: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Twitter/X URL
            </label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) =>
                setFormData({ ...formData, twitterUrl: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
        </div>
      </div>

      {/* Learning Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Award className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Learning Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Learning Goal
            </label>
            <input
              type="text"
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="e.g., Career Change, Skill Enhancement"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Current Status
            </label>
            <input
              type="text"
              value={formData.currentStatus}
              onChange={(e) =>
                setFormData({ ...formData, currentStatus: e.target.value })
              }
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="e.g., Student, Professional"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-[var(--border)]">
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 
                     text-[var(--primary-foreground)] rounded-xl font-medium shadow-lg 
                     transition-all duration-200 hover:shadow-xl hover:from-[var(--primary)]/90 
                     hover:to-[var(--primary)]/70 disabled:opacity-50 disabled:cursor-not-allowed 
                     disabled:hover:shadow-lg flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)] rounded-full animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Account Settings Tab Component
function AccountSettingsTab({
  user,
  emailChangeStep,
  setEmailChangeStep,
  newEmail,
  setNewEmail,
  emailOTP,
  setEmailOTP,
  onRequestEmailChange,
  onVerifyEmailChange,
  isLoadingRequest,
  isLoadingVerify,
}: {
  user: ProfileResponse["data"]["user"];
  emailChangeStep: "request" | "verify";
  setEmailChangeStep: (step: "request" | "verify") => void;
  newEmail: string;
  setNewEmail: (email: string) => void;
  emailOTP: string;
  setEmailOTP: (otp: string) => void;
  onRequestEmailChange: (email: string) => void;
  onVerifyEmailChange: (data: { newEmail: string; otp: string }) => void;
  isLoadingRequest: boolean;
  isLoadingVerify: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* Change Email Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Mail className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Change Email Address
          </h3>
        </div>

        {emailChangeStep === "request" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Current Email
              </label>
              <input
                type="email"
                value={user.email}
                className="w-full px-4 py-3 bg-[var(--muted)]/30 border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)]/70 cursor-not-allowed
                           transition-all duration-200 shadow-sm"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                New Email Address{" "}
                <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                placeholder="Enter new email address"
                required
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                We'll send a verification code to this email address
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onRequestEmailChange(newEmail)}
                className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 
                           text-[var(--primary-foreground)] rounded-xl font-medium shadow-lg 
                           transition-all duration-200 hover:shadow-xl hover:from-[var(--primary)]/90 
                           hover:to-[var(--primary)]/70 disabled:opacity-50 disabled:cursor-not-allowed 
                           flex items-center gap-2"
                disabled={!newEmail || isLoadingRequest}
              >
                {isLoadingRequest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)] rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
              <p className="text-sm text-[var(--foreground)] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                <span>
                  Verification code sent to <strong>{newEmail}</strong>
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Verification Code{" "}
                <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="text"
                value={emailOTP}
                onChange={(e) =>
                  setEmailOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50
                           text-center text-2xl tracking-widest font-semibold"
                placeholder="000000"
                maxLength={6}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Enter the 6-digit code from your email
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEmailChangeStep("request");
                  setEmailOTP("");
                }}
                className="px-6 py-3 rounded-xl border border-[var(--border)] 
                           text-[var(--foreground)] hover:bg-[var(--muted)]/50 
                           transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onVerifyEmailChange({ newEmail, otp: emailOTP })}
                className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 
                           text-[var(--primary-foreground)] rounded-xl font-medium shadow-lg 
                           transition-all duration-200 hover:shadow-xl hover:from-[var(--primary)]/90 
                           hover:to-[var(--primary)]/70 disabled:opacity-50 disabled:cursor-not-allowed 
                           flex items-center gap-2"
                disabled={emailOTP.length !== 6 || isLoadingVerify}
              >
                {isLoadingVerify ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)] rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Change Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Billing Information Tab Component
function BillingInfoTab({
  billingData,
  onEdit,
  onDelete,
  onSetDefault,
  onCreate,
  isLoading,
}: {
  billingData: BillingInfo[];
  onEdit: (billing: BillingInfo) => void;
  onDelete: (billing: BillingInfo) => void;
  onSetDefault: (id: string) => void;
  onCreate: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Billing Addresses
          </h3>
        </div>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 
                     text-[var(--primary-foreground)] rounded-xl font-medium shadow-lg 
                     transition-all duration-200 hover:shadow-xl hover:from-[var(--primary)]/90 
                     hover:to-[var(--primary)]/70 flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add New Address</span>
        </button>
      </div>

      {billingData.length === 0 ? (
        <div className="text-center py-16 bg-[var(--muted)]/30 rounded-xl border border-[var(--border)]">
          <CreditCard
            size={56}
            className="mx-auto mb-4 text-[var(--muted-foreground)]"
          />
          <p className="text-[var(--muted-foreground)] text-lg mb-2">
            No billing addresses added yet
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Add your first billing address to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {billingData.map((billing) => (
            <div
              key={billing.id}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                billing.isDefault
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {billing.isDefault && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                   bg-[var(--primary)] text-[var(--primary-foreground)] mb-3"
                    >
                      Default
                    </span>
                  )}
                  <h4 className="font-semibold text-[var(--foreground)] text-lg mb-1">
                    {billing.fullName}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(billing)}
                    className="p-2 rounded-lg border border-[var(--border)] 
                             hover:bg-[var(--muted)] hover:border-[var(--primary)]/50 
                             transition-all duration-200"
                    title="Edit"
                  >
                    <Edit size={16} className="text-[var(--primary)]" />
                  </button>
                  <button
                    onClick={() => onDelete(billing)}
                    className="p-2 rounded-lg border border-[var(--border)] 
                             hover:bg-[var(--destructive)]/10 hover:border-[var(--destructive)]/50 
                             transition-all duration-200"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-[var(--destructive)]" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <p className="flex items-center gap-2">
                  <Mail size={14} />
                  {billing.email}
                </p>
                {billing.phone && (
                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    {billing.phone}
                  </p>
                )}
                <div className="pt-2 border-t border-[var(--border)]/50">
                  <p>{billing.addressLine1}</p>
                  {billing.addressLine2 && <p>{billing.addressLine2}</p>}
                  <p>
                    {billing.city}, {billing.state} {billing.postalCode}
                  </p>
                  <p>{billing.country}</p>
                </div>
                {billing.cardLast4 && (
                  <p className="mt-3 pt-3 border-t border-[var(--border)]/50 flex items-center gap-2 font-medium">
                    <CreditCard size={16} className="text-[var(--primary)]" />
                    <span className="text-[var(--foreground)]">
                      {billing.cardBrand} •••• {billing.cardLast4}
                    </span>
                  </p>
                )}
              </div>
              {!billing.isDefault && (
                <button
                  onClick={() => onSetDefault(billing.id)}
                  className="mt-4 w-full py-2.5 rounded-xl border border-[var(--border)] 
                           text-sm font-medium text-[var(--foreground)] 
                           hover:bg-[var(--muted)] hover:border-[var(--primary)]/50 
                           transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Security Tab Component
function SecurityTab({
  showPasswordForm,
  setShowPasswordForm,
  onChangePassword,
  isLoading,
  onError, // Add this prop
}: {
  showPasswordForm: boolean;
  setShowPasswordForm: (show: boolean) => void;
  onChangePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => void;
  isLoading: boolean;
  onError?: (message: string) => void; // Add this
}) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (formData.newPassword.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      setPasswordError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      const errorMsg = "New passwords do not match";
      setPasswordError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    onChangePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!showPasswordForm) {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Lock className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Change Password
            </h3>
          </div>

          <div className="bg-[var(--muted)]/30 rounded-xl p-6 border border-[var(--border)]">
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Update your password to keep your account secure. Make sure to use
              a strong password with at least 6 characters.
            </p>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 
                         text-[var(--primary-foreground)] rounded-xl font-medium shadow-lg 
                         transition-all duration-200 hover:shadow-xl hover:from-[var(--primary)]/90 
                         hover:to-[var(--primary)]/70 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Lock className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Change Password
          </h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Current Password{" "}
              <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => {
                setFormData({ ...formData, currentPassword: e.target.value });
                setPasswordError("");
              }}
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              New Password <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => {
                setFormData({ ...formData, newPassword: e.target.value });
                setPasswordError("");
              }}
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="Enter new password (min. 6 characters)"
              required
              minLength={6}
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Password must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Confirm New Password{" "}
              <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setPasswordError("");
              }}
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                         text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                         transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              placeholder="Confirm your new password"
              required
              minLength={6}
            />
            {passwordError && (
              <p className="text-xs text-[var(--destructive)] flex items-center gap-1">
                <X className="w-3 h-3" />
                {passwordError}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-6 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setShowPasswordForm(false);
              setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setPasswordError("");
            }}
            className="px-6 py-3 rounded-xl border border-[var(--border)] 
                       text-[var(--foreground)] hover:bg-[var(--muted)]/50 
                       transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 
                       text-[var(--primary-foreground)] rounded-xl font-medium shadow-lg 
                       transition-all duration-200 hover:shadow-xl hover:from-[var(--primary)]/90 
                       hover:to-[var(--primary)]/70 disabled:opacity-50 disabled:cursor-not-allowed 
                       flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)] rounded-full animate-spin" />
                <span>Changing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Change Password</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// Billing Edit Modal Component
function BillingEditModal({
  open,
  billing,
  onClose,
  onSave,
  isLoading,
}: {
  open: boolean;
  billing: BillingInfo | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    fullName: billing?.fullName || "",
    email: billing?.email || "",
    phone: billing?.phone || "",
    addressLine1: billing?.addressLine1 || "",
    addressLine2: billing?.addressLine2 || "",
    city: billing?.city || "",
    state: billing?.state || "",
    postalCode: billing?.postalCode || "",
    country: billing?.country || "",
    isDefault: billing?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] max-h-[90vh] overflow-y-auto scrollbar-sm">
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            {billing ? "Edit" : "Add"} Billing Information
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Full Name <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Email <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Address Line 1{" "}
                <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine1: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine2: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                City <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                State/Province{" "}
                <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Postal Code <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Country <span className="text-[var(--destructive)]">*</span>
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl 
                           text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]
                           transition-all duration-200 shadow-sm hover:border-[var(--primary)]/50"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] 
                         focus:ring-[var(--primary)]/20 cursor-pointer"
            />
            <label
              htmlFor="isDefault"
              className="text-sm text-[var(--foreground)] cursor-pointer"
            >
              Set as default billing address
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-[var(--border)] 
                         text-[var(--foreground)] hover:bg-[var(--muted)]/50 
                         transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 
                         text-[var(--primary-foreground)] rounded-xl font-medium shadow-lg 
                         transition-all duration-200 hover:shadow-xl hover:from-[var(--primary)]/90 
                         hover:to-[var(--primary)]/70 disabled:opacity-50 disabled:cursor-not-allowed 
                         flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)] rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{billing ? "Update" : "Add"} Address</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
