import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  BookOpen,
  GraduationCap,
  Ban,
  CheckCircle,
  Activity,
  Award,
  Globe,
  Linkedin,
  Twitter,
  User as UserIcon
} from "lucide-react";
import TopBar from "../../lazy/TopBar";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { format } from "date-fns";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "purchases", label: "Purchases", icon: CreditCard },
  { id: "courses", label: "Course Progress", icon: BookOpen },
  { id: "quizzes", label: "Quiz Results", icon: GraduationCap },
  { id: "billing", label: "Billing", icon: MapPin },
];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: student, isLoading, error } = useQuery({
    queryKey: ["student-details", id],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.ADMIN.GET_STUDENT_DETAILS(id!));
      return res.data.data;
    },
    enabled: !!id,
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(API_ROUTES.ADMIN.TOGGLE_BLOCK_USER(id!));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-details", id] });
      // You might also want to show a toast notification here
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Error loading student</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[var(--primary)]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Full Name</p>
                    <p className="font-medium text-[var(--foreground)]">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Email</p>
                    <p className="font-medium text-[var(--foreground)]">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Phone</p>
                    <p className="font-medium text-[var(--foreground)]">{student.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Location</p>
                    <p className="font-medium text-[var(--foreground)]">{student.location || "Not provided"}</p>
                  </div>
                  <div className="col-span-full">
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">About</p>
                    <p className="font-medium text-[var(--foreground)] text-sm leading-relaxed">
                      {student.bio || "No biography provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals & Status */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                 <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--primary)]" />
                  Goals & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Current Status</p>
                     <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                       {student.currentStatus || "Not Specified"}
                     </span>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Learning Goal</p>
                    <p className="font-medium text-[var(--foreground)]">{student.goal || "Not Specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Stats */}
            <div className="space-y-6">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <CreditCard size={18} />
                      </div>
                      <span className="text-sm font-medium">Total Spent</span>
                    </div>
                    <span className="font-bold text-[var(--foreground)]">
                      ${student.Purchase.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                        <BookOpen size={18} />
                      </div>
                      <span className="text-sm font-medium">Courses</span>
                    </div>
                    <span className="font-bold text-[var(--foreground)]">
                      {new Set(student.Purchase.map((p: any) => p.chapter.module.expertise.skillCategory.course.id)).size}
                    </span>
                  </div>
                   <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        <GraduationCap size={18} />
                      </div>
                      <span className="text-sm font-medium">Quizzes</span>
                    </div>
                    <span className="font-bold text-[var(--foreground)]">
                      {student.QuizAttempt.length}
                    </span>
                  </div>
                </div>
              </div>
               
              {/* Social Links */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Social Profiles</h3>
                <div className="space-y-3">
                  {student.website && (
                    <a href={student.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                      <Globe size={16} /> Website
                    </a>
                  )}
                  {student.twitterUrl && (
                    <a href={student.twitterUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                      <Twitter size={16} /> Twitter
                    </a>
                  )}
                  {student.linkedinUrl && (
                    <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                      <Linkedin size={16} /> LinkedIn
                    </a>
                  )}
                  {!student.website && !student.twitterUrl && !student.linkedinUrl && (
                    <p className="text-sm text-[var(--muted-foreground)] italic">No social profiles linked.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "purchases":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)] font-medium">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {student.Purchase.length > 0 ? (
                    student.Purchase.map((purchase: any) => (
                      <tr key={purchase.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                          {purchase.chapter.title}
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)]">Chapter</td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)]">
                          {format(new Date(purchase.purchaseAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-[var(--foreground)]">
                          ${purchase.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                        No purchase history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "courses":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Course Progress</h3>
            {student.courseProgress && student.courseProgress.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {student.courseProgress.map((course: any) => (
                   <div key={course.id} className="border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow">
                     <h4 className="font-semibold text-[var(--foreground)] mb-2">{course.title}</h4>
                     <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)] mb-2">
                       <span>{course.completedLessons} Lessons Completed</span>
                      </div>
                      <div className="w-full bg-[var(--muted)] rounded-full h-2">
                        <div 
                          className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (course.completedLessons / 10) * 100)}%` }} // Placeholder percentage
                        />
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
               <p className="text-[var(--muted-foreground)] text-center py-8">No course activity recorded yet.</p>
            )}
            
            <h3 className="text-lg font-bold text-[var(--foreground)] mt-8 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {student.ViewingHistory.map((history: any) => (
                <div key={history.id} className="flex items-start gap-4 p-4 border border-[var(--border)] rounded-lg">
                  <div className="p-2 bg-[var(--muted)] rounded-lg">
                    <Activity size={16} className="text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <h5 className="font-medium text-[var(--foreground)]">{history.lesson.title}</h5>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {history.lesson.chapter.module.expertise.skillCategory.course.title}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Last accessed: {format(new Date(history.updatedAt), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
              {student.ViewingHistory.length === 0 && (
                <p className="text-[var(--muted-foreground)] text-center py-4">No recent viewing history.</p>
              )}
            </div>
          </div>
        );

      case "quizzes":
         return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)] font-medium">
                  <tr>
                    <th className="px-6 py-4">Quiz Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {student.QuizAttempt.length > 0 ? (
                    student.QuizAttempt.map((attempt: any) => (
                      <tr key={attempt.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                          {attempt.quiz.title}
                        </td>
                         <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                             attempt.status === 'COMPLETED' 
                               ? 'bg-green-500/10 text-green-600' 
                               : 'bg-amber-500/10 text-amber-600'
                           }`}>
                             {attempt.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                          {attempt.score !== null ? `${attempt.percentage?.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)]">
                          {format(new Date(attempt.startedAt), "MMM d, yyyy")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                        No quiz attempts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case "billing":
         return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Billing Information</h3>
             {student.BillingInfo.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {student.BillingInfo.map((info: any) => (
                   <div key={info.id} className="border border-[var(--border)] rounded-lg p-5 relative overflow-hidden">
                      {info.isDefault && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded-bl-lg">
                          Default
                        </div>
                      )}
                      <h4 className="font-bold text-[var(--foreground)] mb-2">{info.fullName}</h4>
                      <div className="space-y-1 text-sm text-[var(--muted-foreground)]">
                        <p>{info.addressLine1}</p>
                        {info.addressLine2 && <p>{info.addressLine2}</p>}
                        <p>{info.city}, {info.state} {info.postalCode}</p>
                        <p>{info.country}</p>
                        <p className="mt-2 text-xs uppercase tracking-wider opacity-70">Phone: {info.phone}</p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="text-center py-12 bg-[var(--muted)]/30 rounded-lg">
                  <CreditCard className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
                  <p className="text-[var(--muted-foreground)]">No billing information saved.</p>
                </div>
             )}
          </div>
         );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300 pb-12">
      <TopBar />
      
      {/* Header */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate("/admin/students")}
            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Students
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center border-4 border-[var(--card)] shadow-lg overflow-hidden">
                  {student.profilePhoto ? (
                    <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-[var(--primary)]" />
                  )}
               </div>
               <div>
                 <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
                   {student.name}
                   {student.emailVerified && (
                     <CheckCircle size={20} className="text-green-500" />
                   )}
                 </h1>
                 <div className="flex items-center gap-4 mt-2 text-[var(--muted-foreground)]">
                   <span className="flex items-center gap-1.5 text-sm">
                     <Mail size={14} /> {student.email}
                   </span>
                   <span className="flex items-center gap-1.5 text-sm">
                     <Calendar size={14} /> Joined {format(new Date(student.createdAt), "MMM yyyy")}
                   </span>
                 </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBlockMutation.mutate()}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  student.isBlocked
                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                }`}
              >
                {student.isBlocked ? (
                  <>
                    <Shield size={18} /> Unblock User
                  </>
                ) : (
                  <>
                    <Ban size={18} /> Block User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8 mt-8">
        <div className="flex items-center gap-1 border-b border-[var(--border)] mb-8 overflow-x-auto">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === section.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="animate-in fade-in zoom-in-95 duration-200">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}
