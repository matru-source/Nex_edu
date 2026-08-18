import { useNavigate } from "react-router-dom";
import {
  Search,
  Home,
  BookOpen,
  Compass,
  ArrowRight,
  Smile,
  TrendingUp,
} from "lucide-react";
import NavBar from "../ui/Landing/NavBar";

export default function NotFound() {
  const navigate = useNavigate();

  const funnyMessages = [
    "Our team built so many useful things, and yet... you found this page! 🎉",
    "You've discovered our secret hideout! But it's empty... just like this page.",
    "404? More like 'Four-Oh-Four-Get-About-It'! 😄",
    "This page went on a coffee break and never came back.",
    "Even our best developers couldn't prevent you from finding this void!",
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)" }}
    >
      <NavBar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full text-center">
          {/* Animated 404 */}
          <div className="mb-8">
            <h1
              className="text-9xl md:text-[12rem] font-black mb-4 tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </h1>
            <div className="flex items-center justify-center gap-2 text-4xl mb-6">
              <Smile size={40} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--foreground)" }}>
                Oops! Page Not Found
              </span>
            </div>
          </div>

          {/* Funny Message */}
          <div className="mb-12">
            <p
              className="text-xl md:text-2xl font-medium mb-4 leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {funnyMessages[0]}
            </p>
            <p
              className="text-lg md:text-xl mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              Don't worry, even the best explorers get lost sometimes! 🌟
            </p>
          </div>

          {/* Fun Illustration/Icon Section */}
          <div className="mb-12 flex items-center justify-center gap-8 flex-wrap">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary)/80 100%)",
                opacity: 0.1,
              }}
            >
              <Search size={40} style={{ color: "var(--primary)" }} />
            </div>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--secondary) 0%, var(--secondary)/80 100%)",
                opacity: 0.1,
              }}
            >
              <Compass size={40} style={{ color: "var(--secondary)" }} />
            </div>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary)/80 100%)",
                opacity: 0.1,
              }}
            >
              <TrendingUp size={40} style={{ color: "var(--primary)" }} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 group"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <Home size={20} />
              Go Home
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 group"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
                backgroundColor: "var(--card)",
              }}
            >
              <BookOpen size={20} />
              Explore Courses
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 group"
              style={{
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
                backgroundColor: "transparent",
              }}
            >
              Go Back
              <ArrowRight
                size={18}
                className="group-hover:-translate-x-1 transition-transform rotate-180"
              />
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mb-8">
            <p
              className="text-sm mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Maybe you're looking for one of these?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Home
              </button>
              <span style={{ color: "var(--border)" }}>•</span>
              <button
                onClick={() => navigate("/career-path")}
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Career Path
              </button>
              <span style={{ color: "var(--border)" }}>•</span>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Dashboard
              </button>
              <span style={{ color: "var(--border)" }}>•</span>
              <button
                onClick={() => navigate("/courses")}
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                My Courses
              </button>
            </div>
          </div>

          {/* Fun Footer Text */}
          <div
            className="mt-12 p-6 rounded-2xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              💡{" "}
              <strong style={{ color: "var(--foreground)" }}>Pro Tip:</strong>{" "}
              Our team built amazing courses, interactive forums, quizzes, and
              so much more. Go explore and discover what you're really looking
              for! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
