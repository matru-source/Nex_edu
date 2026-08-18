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
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { ExpertiseCard, ModuleCard, CourseCardSkeleton } from "../students/course/CourseCard";

export default function Gateway180() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const expertiseQuery = useQuery({
    queryKey: ["gateway-expertise", "PRACTITIONER"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_EXPERTISE_ALL);
      return (res.data.data ?? []).filter((item: any) =>
        item.levels && item.levels.includes("PRACTITIONER")
      );
    },
  });

  const moduleQuery = useQuery({
    queryKey: ["gateway-modules", "PRACTITIONER"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_MODULES_ALL);
      return (res.data.data ?? []).filter((item: any) =>
        item.levels && item.levels.includes("PRACTITIONER")
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
      icon: <Layers size={32} />,
      title: "Dual Expertise",
      description:
        "Master both technical and business skills for comprehensive professional growth",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: <Target size={32} />,
      title: "Focused Learning",
      description:
        "Concentrated curriculum covering the most essential skills for career success",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Balanced Approach",
      description:
        "Perfect balance between depth and breadth for accelerated career advancement",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Zap size={32} />,
      title: "Fast-Track Program",
      description:
        "Intensive learning path designed for professionals ready to level up quickly",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const pathways = [
    {
      title: "Technical-Business Hybrid",
      duration: "6-12 months",
      level: "Intermediate",
      skills: [
        "ERP Systems",
        "Business Analysis",
        "Project Management",
        "Data Insights",
      ],
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "Leadership & Strategy",
      duration: "8-14 months",
      level: "Advanced",
      skills: [
        "Strategic Thinking",
        "Team Management",
        "Business Acumen",
        "Communication",
      ],
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: "Innovation & Growth",
      duration: "7-13 months",
      level: "Intermediate",
      skills: [
        "Digital Transformation",
        "Process Innovation",
        "Change Leadership",
        "Agile Methods",
      ],
      color: "from-purple-600 to-pink-600",
    },
  ];

  const patternSvg = encodeURIComponent(
    '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#9C92AC" fill-opacity="0.05"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>'
  );

  const ctaPatternSvg = encodeURIComponent(
    '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.1"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-emerald-950 dark:to-teal-950">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <Sparkles
                size={18}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <span>Balanced Career Excellence</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              180⁰ Gateway
            </h1>

            <p className="text-2xl lg:text-3xl text-slate-700 dark:text-slate-300 mb-8 font-light leading-relaxed">
              Master Both Sides of Professional Excellence
            </p>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              A focused program that balances technical mastery with business
              acumen. Perfect for professionals who want comprehensive expertise
              without the full 360° commitment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium">Dual Expertise</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium">Focused Curriculum</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium">Accelerated Learning</span>
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
              Why Choose 180⁰ Gateway?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The perfect balance of depth and breadth
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
      <section className="py-20 bg-gradient-to-b from-transparent to-emerald-100/50 dark:to-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Choose Your Pathway
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Three focused tracks for balanced professional growth
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
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,${ctaPatternSvg}")`,
          }}
        ></div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Award size={64} className="mx-auto mb-6 text-white opacity-90" />
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join professionals who have accelerated their careers through our
            balanced 180° Gateway program.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
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
              Explore 180⁰ Gateway Programs
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Discover transitional domains and modules designed for Practitioner elevation.
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
              <p className="text-slate-500 max-w-md mx-auto">There are currently no programs configured for the 180⁰ Gateway. Check back soon for new content!</p>
            </div>
          ) : (
            <div className="space-y-16">
              {expertiseList.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Target className="text-emerald-500" />
                    Transitional Domains
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
                    <Rocket className="text-emerald-500" />
                    Bridge Modules
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
