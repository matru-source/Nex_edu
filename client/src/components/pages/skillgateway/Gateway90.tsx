import { useEffect } from "react";
import NavBar from "../../ui/Landing/NavBar";
import {
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Rocket,
  Focus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { ExpertiseCard, ModuleCard, CourseCardSkeleton } from "../students/course/CourseCard";

export default function Gateway90() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const expertiseQuery = useQuery({
    queryKey: ["gateway-expertise", "PROFESSIONAL"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_EXPERTISE_ALL);
      return (res.data.data ?? []).filter((item: any) =>
        item.levels && item.levels.includes("PROFESSIONAL")
      );
    },
  });

  const moduleQuery = useQuery({
    queryKey: ["gateway-modules", "PROFESSIONAL"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_MODULES_ALL);
      return (res.data.data ?? []).filter((item: any) =>
        item.levels && item.levels.includes("PROFESSIONAL")
      );
    },
  });

  const isLoading = expertiseQuery.isLoading || moduleQuery.isLoading;
  const expertiseList = expertiseQuery.data || [];
  const moduleList = moduleQuery.data || [];

  const handleItemClick = (item: any) => {
    let courseId = undefined;
    if (item.course?.id) courseId = item.course.id;
    else if (item.skillCategory?.course?.id) courseId = item.skillCategory.course.id;
    else if (item.expertise?.skillCategory?.course?.id) courseId = item.expertise.skillCategory.course.id;
    else if (item.courseId) courseId = item.courseId;

    if (courseId) {
      navigate(`/public/course/${courseId}`);
    }
  };

  const features = [
    {
      icon: <Focus size={32} />,
      title: "Laser Focus",
      description:
        "Intensive specialization in one core area for maximum expertise and impact",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: <Zap size={32} />,
      title: "Rapid Mastery",
      description:
        "Fast-track program designed for quick skill acquisition and immediate application",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: <Target size={32} />,
      title: "Specialized Excellence",
      description:
        "Deep dive into a specific domain to become a recognized expert",
      gradient: "from-rose-500 to-red-500",
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Quick Results",
      description:
        "See immediate career impact with focused, high-intensity learning",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const pathways = [
    {
      title: "ERP Specialist Track",
      duration: "3-6 months",
      level: "Focused",
      skills: [
        "Oracle Fusion",
        "SAP Systems",
        "Implementation",
        "Configuration",
      ],
      color: "from-amber-600 to-orange-600",
    },
    {
      title: "Business Analyst Track",
      duration: "4-7 months",
      level: "Focused",
      skills: [
        "Requirements Analysis",
        "Process Mapping",
        "Stakeholder Management",
        "Documentation",
      ],
      color: "from-red-600 to-pink-600",
    },
    {
      title: "Technical Consultant Track",
      duration: "3-6 months",
      level: "Focused",
      skills: [
        "System Integration",
        "Technical Solutions",
        "Client Consulting",
        "Problem Solving",
      ],
      color: "from-rose-600 to-red-600",
    },
  ];

  const patternSvg = encodeURIComponent(
    '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#9C92AC" fill-opacity="0.05"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>'
  );

  const ctaPatternSvg = encodeURIComponent(
    '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.1"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-amber-950 dark:to-orange-950">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-red-500/10"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 text-amber-700 dark:text-amber-300 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <Sparkles
                size={18}
                className="text-amber-600 dark:text-amber-400"
              />
              <span>Focused Specialization</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent leading-tight">
              90⁰ Gateway
            </h1>

            <p className="text-2xl lg:text-3xl text-slate-700 dark:text-slate-300 mb-8 font-light leading-relaxed">
              Master One Domain, Excel in Your Career
            </p>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              A focused, intensive program for professionals who want to become
              experts in a specific area. Perfect for those seeking rapid
              specialization and immediate career advancement.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium">Focused Learning</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium">Rapid Results</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium">Expert-Level Skills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose 90⁰ Gateway?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Focused excellence for rapid career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                ></div>
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Pathways */}
      <section className="py-20 bg-gradient-to-b from-transparent to-amber-100/50 dark:to-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Choose Your Specialization
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Three focused tracks for rapid expertise development
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pathways.map((pathway, index) => (
              <div
                key={index}
                className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pathway.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <div
                  className={`relative bg-gradient-to-br ${pathway.color} p-8 text-white`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Rocket size={40} className="opacity-90" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      {pathway.level}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{pathway.title}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <BookOpen size={16} />
                    <span>{pathway.duration}</span>
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wide">
                    Core Skills
                  </h4>
                  <div className="space-y-3 mb-6">
                    {pathway.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${pathway.color}`}
                        ></div>
                        <span className="text-slate-700 dark:text-slate-300">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/career-path")}
                    className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${pathway.color} text-white font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105`}
                  >
                    Explore Pathway
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,${ctaPatternSvg}")`,
          }}
        ></div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Award size={64} className="mx-auto mb-6 text-white opacity-90" />
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Specialize?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join professionals who have accelerated their careers through our
            focused 90° Gateway program.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white text-amber-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate("/career-path")}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Content Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Explore 90⁰ Gateway Programs
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Discover dedicated domains and modules designed for Professional advancement.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (expertiseList.length === 0 && moduleList.length === 0) ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Programs Available</h3>
              <p className="text-slate-500 max-w-md mx-auto">There are currently no programs configured for the 90⁰ Gateway. Check back soon for new content!</p>
            </div>
          ) : (
            <div className="space-y-16">
              {expertiseList.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Target className="text-amber-500" />
                    Specialized Domains
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {expertiseList.map((item: any) => (
                      <ExpertiseCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        description={item.description}
                        thumbnailUrl={item.tumbnailUrl}
                        skillCategoryName={item.skillCategory?.name}
                        moduleCount={item.moduleCount || item._count?.Module}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {moduleList.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Rocket className="text-amber-500" />
                    Focused Modules
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {moduleList.map((item: any) => (
                      <ModuleCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        thumbnailUrl={item.tumbnailUrl}
                        expertiseName={item.expertise?.name}
                        chapterCount={item.chapterCount || item._count?.chapters}
                        estimatedTime={item.estimatedTime ?? 120}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
