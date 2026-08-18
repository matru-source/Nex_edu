import { Fragment } from "react/jsx-runtime";
import { useNavigationStore, useSideBarStore } from "../../state/global";
import useRouter from "../../hooks/useRouter";
import {
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Sun,
  Moon,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
// import NotificationBell from "../ui/NotificationBell";
import { useCartStore } from "../../state/cart";
import { userStore } from "../../state/global";

export default function TopBar({ children }: { children?: React.ReactNode }) {
  const { navStack } = useNavigationStore();
  const router = useRouter();
  const toogleSidebar = useSideBarStore((state) => state.toggleCollapse);
  const isSidebarCollapsed = useSideBarStore((state) => state.isCollapsed);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  // Cart integration
  const { items: cartItems, fetchCart } = useCartStore();
  const { user } = userStore();
  const isStudent = user?.role === "STUDENT";

  useEffect(() => {
    if (isStudent) {
      fetchCart();
    }
  }, [isStudent, fetchCart]);


  return (
    <div className="py-4 px-8 flex items-center justify-between gap-6 sticky top-0 z-10 bg-gradient-to-r from-[var(--background)] via-[var(--card)] to-[var(--background)] border-b border-[var(--border)] backdrop-blur-md bg-opacity-95">
      {/* Left Section - Sidebar Toggle & Breadcrumb */}
      <div className="flex gap-4 items-center flex-1 min-w-0">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toogleSidebar}
          className="p-2.5 rounded-lg hover:bg-[var(--muted)]/50 transition-all duration-300 text-[var(--foreground)] hover:text-[var(--primary)] flex-shrink-0 hover:shadow-md"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Breadcrumb Navigation */}
        <div className="flex gap-1 items-center flex-1 min-w-0 bg-[var(--muted)]/20 rounded-lg px-2 py-1">
          {navStack.map((nav, index) => {
            const isLast = index === navStack.length - 1;

            return (
              <Fragment key={index}>
                <button
                  onClick={() => router.goto(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 whitespace-nowrap truncate relative group ${
                    isLast
                      ? "text-[var(--primary)] font-bold   "
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/30"
                  }`}
                >
                  <span
                    className={`text-sm font-${
                      isLast ? "bold" : "medium"
                    } capitalize truncate`}
                  >
                    {nav.title}
                  </span>

                  {/* Active indicator dot */}
                  {isLast && (
                    <span className="inline-flex items-center justify-center">
                      <span className="flex h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                    </span>
                  )}
                </button>

                {!isLast && (
                  <ChevronRight className="w-4 h-4 text-[var(--border)] flex-shrink-0 group-hover:text-[var(--primary)]/50 transition-colors" />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Right Section - Theme Toggle, Notification & Children */}
      <div className="flex gap-3 items-center flex-shrink-0">
        {/* Cart Button (Students Only) */}
        {isStudent && (
          <button
            onClick={() => router.push("/cart", "My Cart")}
            className="p-2.5 rounded-lg bg-gradient-to-br from-[var(--muted)]/40 to-[var(--accent)]/20 hover:from-[var(--primary)]/20 hover:to-[var(--ring)]/15 transition-all duration-300 text-[var(--foreground)] hover:text-[var(--primary)] hover:shadow-md hover:scale-105 active:scale-95 relative group"
            title="My Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            
            {/* Cart Badge */}
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm animate-in scale-in zoom-in duration-200">
                {cartItems.length}
              </span>
            )}
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg bg-gradient-to-br from-[var(--muted)]/40 to-[var(--accent)]/20 hover:from-[var(--primary)]/20 hover:to-[var(--ring)]/15 transition-all duration-300 text-[var(--foreground)] hover:text-[var(--primary)] hover:shadow-md hover:scale-105 active:scale-95"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        {/* <NotificationBell /> */}

        {/* Children Content */}
        {children && (
          <div className="flex-shrink-0 pl-2 border-l border-[var(--border)] ml-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
