import { useState } from "react";
import { Send, User, Mail, Phone, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function GetInTouch() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const res = await api.post(API_ROUTES.CONTACT.CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setShowSuccess(false), 5000);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to send message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-2 relative pb-6 overflow-hidden">
      {/* Noisy Pattern Background */}
    
      
      {/* Gradient Overlay */}
    
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--primary)]/8 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-[var(--primary)]/15 text-[var(--primary)] mb-6 border border-[var(--primary)]/20">
            <MessageSquare className="w-4 h-4" />
            Contact Us
          </span>
          <h2 className="text-5xl font-bold text-[var(--foreground)] mb-6">
            Get in <span className="text-[var(--primary)]">Touch</span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Have questions about our courses or need assistance? We're here to help! 
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-[var(--card)]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--border)] p-10 relative overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl" />
            
            {/* Success Message Overlay */}
            {showSuccess && (
              <div className="absolute inset-0 bg-[var(--card)]/98 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in zoom-in-95 duration-300 rounded-3xl">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-[var(--primary)]/15 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-lg">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              {/* 4 Input Fields in Horizontal Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--foreground)]">
                    Full Name <span className="text-[var(--primary)]">*</span>
                  </label>
                  <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'name' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--foreground)]">
                    Email <span className="text-[var(--primary)]">*</span>
                  </label>
                  <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'email' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                    }`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--foreground)]">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'phone' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                    }`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-12 pr-4 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--foreground)]">
                    Subject <span className="text-[var(--primary)]">*</span>
                  </label>
                  <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'subject' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                    }`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="How can we help?"
                      className="w-full pl-12 pr-4 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Message Full Width */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--foreground)]">
                  Your Message <span className="text-[var(--primary)]">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Tell us more about your inquiry, questions, or feedback..."
                  rows={6}
                  className={`w-full px-5 py-4 bg-[var(--background)] border-2 rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 resize-none focus:outline-none transition-all duration-200 ${
                    focusedField === 'message' 
                      ? 'border-[var(--primary)] ring-4 ring-[var(--primary)]/10' 
                      : 'border-[var(--border)]'
                  }`}
                  required
                />
              </div>

              {/* Submit Button Centered */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="group relative px-12 py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/25 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-3 overflow-hidden"
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
