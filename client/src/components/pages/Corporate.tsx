import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Target,
  Award,
  TrendingUp,
  CheckCircle2,
  MessageCircle,
  Briefcase,
  GraduationCap,
  BarChart3,
  Shield,
  BookOpen,
} from "lucide-react";

export default function Corporate() {
  const navigate = useNavigate();

  const corporateOptions = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Training Programs",
      description:
        "Customized learning paths designed specifically for your team's skill development needs. Empower your workforce with targeted training.",
      features: [
        "Custom curriculum design",
        "Progress tracking dashboard",
        "Team performance analytics",
        "Dedicated support manager",
      ],
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Enterprise Solutions",
      description:
        "Comprehensive learning management solutions for large organizations with advanced reporting and integration capabilities.",
      features: [
        "SSO & SAML integration",
        "API access",
        "White-label options",
        "24/7 priority support",
      ],
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Certification Programs",
      description:
        "Industry-recognized certification programs to validate your team's expertise and enhance professional credibility.",
      features: [
        "Accredited certifications",
        "Digital badges",
        "Verification portal",
        "Bulk enrollment discounts",
      ],
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Onboarding Solutions",
      description:
        "Streamline new employee onboarding with structured learning programs that accelerate time-to-productivity.",
      features: [
        "Role-based learning paths",
        "Automated assignments",
        "Completion tracking",
        "Customizable content",
      ],
    },
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Improved Productivity",
      stat: "40%",
      description: "Average increase in team productivity",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Skill Development",
      stat: "500+",
      description: "Courses across various domains",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certified Professionals",
      stat: "10K+",
      description: "Professionals certified globally",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "ROI Tracking",
      stat: "3x",
      description: "Average return on training investment",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background)] to-blue-500/10 py-20 lg:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--primary)]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Corporate Training Solutions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6">
              Empower Your{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-blue-500 bg-clip-text text-transparent">
                Workforce
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto mb-8">
              Transform your organization with comprehensive corporate training
              solutions. Build skills, drive innovation, and achieve business
              excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Stats */}
      <section className="py-16 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
                  {benefit.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-1">
                  {benefit.stat}
                </div>
                <div className="text-sm font-medium text-[var(--foreground)] mb-1">
                  {benefit.title}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {benefit.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Options */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Corporate Training Options
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Choose from our range of corporate solutions designed to meet your
              organization's unique learning needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {corporateOptions.map((option, index) => (
              <div
                key={index}
                className="group bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 hover:border-[var(--primary)]/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-blue-500/20 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {option.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center gap-3 text-sm text-[var(--foreground)]"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[var(--muted)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
                Why Organizations Choose Us
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] mb-8">
                Partner with us for world-class corporate training that delivers
                measurable results and transforms your workforce capabilities.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: <Shield className="w-5 h-5" />,
                    text: "Enterprise-grade security and compliance",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    text: "Dedicated customer success team",
                  },
                  {
                    icon: <BarChart3 className="w-5 h-5" />,
                    text: "Advanced analytics and reporting",
                  },
                  {
                    icon: <BookOpen className="w-5 h-5" />,
                    text: "Extensive course library with regular updates",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                      {item.icon}
                    </div>
                    <span className="text-[var(--foreground)] font-medium">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto">
            Contact our corporate team to discuss your organization's training needs and get a customized solution.
          </p>
          <button
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                const contactSection = document.getElementById("contact");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }, 100);
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[var(--primary)]/30 transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            Get in Touch
          </button>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-8 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </section>
    </div>
  );
}
