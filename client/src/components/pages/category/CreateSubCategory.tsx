import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import useRouter from "../../../hooks/useRouter";
import { ArrowLeft, Loader } from "lucide-react";
import UploadImage from "../../lazy/UploadImage";
import { API_ROUTES } from "../../../lib/api";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import TopBar from "../../lazy/TopBar";


export default function CreateSubCategory() {
  useInitNavStackOnce([
    { title: "Create Application", path: "/admin/subcategories/create" },
  ]);

  const router = useRouter();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [selectedCategoryId,] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch categories

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      categoryId?: string;
      tumbnailUrl?: string;
    }) => {
      const response = await fetch(API_ROUTES.ADMIN.CREATE_SUBCATEGORY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "erpbugs-auth-jwt-token"
          )}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create subcategory");
      }

      return response.json();
    },
    onSuccess: () => {
      router.goto(0); // Go back to Categories in nav stack
    },
    onError: (error) => {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to create subcategory",
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Category is now optional - no validation needed

    if (!formData.name.trim()) {
      newErrors.name = "Application name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      categoryId: selectedCategoryId || undefined, // Optional now
      tumbnailUrl: thumbnailUrl || undefined,
    });
  };


  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <TopBar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 py-6">
          <button
            onClick={() => router.goto(0)}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} style={{ color: "var(--foreground)" }} />
          </button>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              Create New Application
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Add a new Application under an existing Brand
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{ backgroundColor: "var(--card)" }}
        >
          {/* Error Message */}
          {errors.submit && (
            <div
              className="mb-6 p-4 rounded-lg border"
              style={{
                backgroundColor: "var(--destructive)",
                borderColor: "var(--destructive)",
                opacity: 0.1,
              }}
            >
              <p
                style={{ color: "var(--destructive)" }}
                className="font-medium"
              >
                {errors.submit}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Layout - Two Columns */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Thumbnail Upload */}
              <div className="flex flex-col items-center justify-start">
                <div className="space-y-3 w-full">
                  <label
                    className="block font-semibold text-center"
                    style={{ color: "var(--foreground)" }}
                  >
                    Application Thumbnail
                  </label>
                  <p
                    className="text-sm text-center"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Upload a high-quality image (JPG, PNG recommended)
                  </p>
                  <div className="flex justify-center pt-4">
                    <UploadImage
                      imageUrl={thumbnailUrl}
                      setImageUrl={setThumbnailUrl}
                      width={280}
                      height={280}
                      text="Click to upload thumbnail"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-6 flex flex-col justify-between">
          

                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Application Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Development, Machine Learning"
                    className="input-form"
                    style={{
                      borderColor: errors.name
                        ? "var(--destructive)"
                        : "var(--border)",
                    }}
                  />
                  {errors.name && (
                    <p
                      className="text-sm"
                      style={{ color: "var(--destructive)" }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-2 flex-1">
                  <label
                    htmlFor="description"
                    className="block font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Write a compelling description for this subcategory..."
                    rows={5}
                    className="input-form resize-none"
                    style={{
                      borderColor: errors.description
                        ? "var(--destructive)"
                        : "var(--border)",
                    }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {formData.description.length}/500 characters
                  </p>
                  {errors.description && (
                    <p
                      className="text-sm"
                      style={{ color: "var(--destructive)" }}
                    >
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.goto(0)}
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn flex-1 justify-center"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Application"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
