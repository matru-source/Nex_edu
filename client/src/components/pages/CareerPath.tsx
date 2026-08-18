import { useState } from "react";
import NavBar from "../ui/Landing/NavBar";
import {
  GraduationCap,
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  Award,
  Briefcase,
  BarChart3,
  Target,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CareerPath {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  courses: {
    name: string;
    duration: string;
    level: string;
  }[];
  qualifications: string[];
  benefits: string[];
  marketAnalysis: {
    growth: string;
    demand: string;
    companies: string[];
  };
  salary: {
    entry: string;
    mid: string;
    senior: string;
    currency: string;
  };
  jobRoles: string[];
}

// ✅ Hardcoded Career Path Data
const careerPaths: CareerPath[] = [
  {
    id: "oracle-fusion-cloud",
    title: "Oracle Fusion Cloud Specialist",
    description:
      "Become an expert in Oracle Fusion Cloud ERP, the leading cloud-based enterprise resource planning solution. Master financial management, supply chain, human capital, and more.",
    category: "ERP",
    icon: <Briefcase size={32} />,
    color: "from-blue-500 to-cyan-500",
    courses: [
      {
        name: "Oracle Fusion Cloud Financials",
        duration: "60 hours",
        level: "Intermediate",
      },
      {
        name: "Oracle Fusion Cloud HCM",
        duration: "45 hours",
        level: "Beginner",
      },
      {
        name: "Oracle Fusion Cloud SCM",
        duration: "50 hours",
        level: "Advanced",
      },
    ],
    qualifications: [
      "Bachelor's degree in Business, IT, or related field",
      "Basic understanding of ERP concepts",
      "Strong analytical and problem-solving skills",
      "Willingness to learn cloud technologies",
    ],
    benefits: [
      "High demand in enterprise organizations",
      "Opportunity to work with Fortune 500 companies",
      "Excellent career growth potential",
      "Competitive salary packages",
      "Remote work opportunities",
      "Continuous learning and skill development",
    ],
    marketAnalysis: {
      growth: "25% annually",
      demand: "Very High",
      companies: [
        "Oracle Corporation",
        "Deloitte",
        "Accenture",
        "IBM",
        "Capgemini",
        "TCS",
        "Wipro",
      ],
    },
    salary: {
      entry: "$60,000 - $80,000",
      mid: "$90,000 - $130,000",
      senior: "$140,000 - $200,000",
      currency: "USD",
    },
    jobRoles: [
      "Oracle Fusion Cloud Consultant",
      "ERP Implementation Specialist",
      "Financial Systems Analyst",
      "HCM Cloud Specialist",
      "Supply Chain Consultant",
    ],
  },
  {
    id: "sap-erp",
    title: "SAP ERP Professional",
    description:
      "Build a career in SAP ERP systems, one of the most widely used enterprise software solutions globally. Learn modules like FICO, MM, SD, and more.",
    category: "ERP",
    icon: <TrendingUp size={32} />,
    color: "from-green-500 to-emerald-500",
    courses: [
      {
        name: "SAP FICO (Financial Accounting)",
        duration: "80 hours",
        level: "Intermediate",
      },
      {
        name: "SAP MM (Materials Management)",
        duration: "70 hours",
        level: "Beginner",
      },
      {
        name: "SAP SD (Sales & Distribution)",
        duration: "65 hours",
        level: "Intermediate",
      },
    ],
    qualifications: [
      "Bachelor's degree in Commerce, IT, or Engineering",
      "Understanding of business processes",
      "Logical thinking and attention to detail",
      "Good communication skills",
    ],
    benefits: [
      "Global recognition and certification",
      "Work with leading multinational corporations",
      "Diverse career paths across industries",
      "High job security",
      "Travel opportunities for projects",
      "Strong professional network",
    ],
    marketAnalysis: {
      growth: "20% annually",
      demand: "High",
      companies: [
        "SAP",
        "IBM",
        "Infosys",
        "Cognizant",
        "HCL Technologies",
        "Deloitte",
        "PwC",
      ],
    },
    salary: {
      entry: "$55,000 - $75,000",
      mid: "$85,000 - $120,000",
      senior: "$130,000 - $180,000",
      currency: "USD",
    },
    jobRoles: [
      "SAP FICO Consultant",
      "SAP MM Consultant",
      "SAP Basis Administrator",
      "SAP ABAP Developer",
      "SAP Project Manager",
    ],
  },
  {
    id: "erp-general",
    title: "ERP Systems Analyst",
    description:
      "Develop comprehensive skills in ERP systems analysis and implementation. Work with various ERP platforms to optimize business processes.",
    category: "ERP",
    icon: <BarChart3 size={32} />,
    color: "from-purple-500 to-pink-500",
    courses: [
      {
        name: "ERP Fundamentals",
        duration: "40 hours",
        level: "Beginner",
      },
      {
        name: "Business Process Analysis",
        duration: "35 hours",
        level: "Intermediate",
      },
      {
        name: "ERP Implementation",
        duration: "50 hours",
        level: "Advanced",
      },
    ],
    qualifications: [
      "Bachelor's degree in Business, IT, or related field",
      "Strong analytical skills",
      "Knowledge of business processes",
      "Project management basics",
    ],
    benefits: [
      "Versatile skill set across industries",
      "High demand in consulting firms",
      "Opportunity for entrepreneurship",
      "Cross-functional expertise",
      "Business-focused career path",
    ],
    marketAnalysis: {
      growth: "18% annually",
      demand: "High",
      companies: [
        "McKinsey & Company",
        "Boston Consulting Group",
        "Deloitte Consulting",
        "KPMG",
        "EY",
      ],
    },
    salary: {
      entry: "$50,000 - $70,000",
      mid: "$80,000 - $110,000",
      senior: "$120,000 - $170,000",
      currency: "USD",
    },
    jobRoles: [
      "ERP Business Analyst",
      "Systems Analyst",
      "Process Consultant",
      "ERP Project Coordinator",
      "Business Process Manager",
    ],
  },
];

export default function CareerPath() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);

  const handleExploreCourses = (category: string) => {
    navigate(`/?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award size={18} />
              <span>Free Service for All Users</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Discover Your
              <span className="block text-primary mt-2">Career Path</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore comprehensive career paths with detailed course
              information, qualifications, market analysis, salary ranges, and
              job opportunities. Start your journey to a successful career in
              ERP systems.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Free Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Detailed Roadmaps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Market Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Paths Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Popular Career Paths
          </h2>
          <p className="text-muted-foreground">
            Choose a career path to explore courses, qualifications, and
            opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {careerPaths.map((path) => (
            <div
              key={path.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedPath(path)}
            >
              {/* Card Header */}
              <div
                className={`bg-gradient-to-br ${path.color} p-8 text-white relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="mb-4">{path.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{path.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {path.description}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Entry Salary
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {path.salary.entry}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Market Demand
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {path.marketAnalysis.demand}
                    </div>
                  </div>
                </div>

                {/* Courses Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <BookOpen size={16} />
                  <span>{path.courses.length} Courses Available</span>
                </div>

                {/* Explore Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPath(path);
                  }}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  View Details
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Path Detail Modal */}
      {selectedPath && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedPath(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`bg-gradient-to-r ${selectedPath.color} p-8 text-white sticky top-0 z-10`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    {selectedPath.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {selectedPath.title}
                    </h2>
                    <p className="text-white/90">{selectedPath.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPath(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Courses Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Recommended Courses
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPath.courses.map((course, index) => (
                    <div
                      key={index}
                      className="bg-muted/50 rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-foreground text-lg">
                          {course.name}
                        </h4>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                          {course.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    handleExploreCourses(selectedPath.category);
                    setSelectedPath(null);
                  }}
                  className="mt-6 w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Explore All {selectedPath.category} Courses
                  <ArrowRight size={18} />
                </button>
              </section>

              {/* Qualifications Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Qualifications Required
                  </h3>
                </div>
                <div className="space-y-3">
                  {selectedPath.qualifications.map((qual, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <CheckCircle2
                        size={20}
                        className="text-primary flex-shrink-0 mt-0.5"
                      />
                      <p className="text-foreground">{qual}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Benefits Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Target size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Career Benefits
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPath.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                    >
                      <CheckCircle2
                        size={20}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Market Analysis Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Market Analysis
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp size={24} className="text-blue-500" />
                      <h4 className="font-bold text-foreground text-lg">
                        Market Growth
                      </h4>
                    </div>
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      {selectedPath.marketAnalysis.growth}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Annual growth rate in this field
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users size={24} className="text-green-500" />
                      <h4 className="font-bold text-foreground text-lg">
                        Job Demand
                      </h4>
                    </div>
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {selectedPath.marketAnalysis.demand}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current market demand level
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Briefcase size={20} />
                    Top Hiring Companies
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedPath.marketAnalysis.companies.map(
                      (company, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20"
                        >
                          {company}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </section>

              {/* Salary Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Salary Range
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Entry Level
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {selectedPath.salary.entry}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (0-2 years experience)
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Mid Level
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {selectedPath.salary.mid}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (3-5 years experience)
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Senior Level
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {selectedPath.salary.senior}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (6+ years experience)
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  * Salaries vary by location, company size, and specific role
                </p>
              </section>

              {/* Job Roles Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Popular Job Roles
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPath.jobRoles.map((role, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-foreground font-medium">
                        {role}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
