import { Link2, LogOut, ChevronRight, UserIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { routes, getDefaultRouteForRole } from "../../../routes";
import { userStore, useSideBarStore } from "../../../state/global";
import useRouter from "../../../hooks/useRouter";

export default function AsideLeft({ style }: { style?: React.CSSProperties }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = useSideBarStore((state) => state.isCollapsed);
  const router = useRouter();
  const user = userStore((state) => state.user);
  const userRole = user?.role;
  const setToken = userStore((state) => state.setToken);
  const setUser = userStore((state) => state.setUser);

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("erpbugs-auth-jwt-token");
    localStorage.removeItem("erpbugs-user-client");
    navigate("/");
  };

  // Filter routes based on user role
  const filteredRoutes = routes.filter((route) => {
    if (!route.menu) return false;
    if (!route.role || route.role === "ALL") return true;
    return route.role === userRole;
  });

  console.log("User Role:", userRole);
  console.log("All Routes:", routes);
  console.log("Filtered Routes:", filteredRoutes);

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "ADMIN":
        return "bg-red-500/20 text-red-700 dark:text-red-300";
      case "MODERATOR":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "CONTRIBUTOR":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300";
      case "STUDENT":
        return "bg-green-500/20 text-green-700 dark:text-green-300";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
    }
  };

  if (isCollapsed) {
    return (
      <aside
        className="relative flex flex-col bg-gradient-to-b from-[var(--sidebar)] via-[var(--card)] to-[var(--sidebar)] h-screen overflow-x-hidden border-r border-[var(--sidebar-border)] scrollbar-sm"
        style={{ width: style?.width }}
      >
        <div className="flex items-center justify-center p-4 mb-6">
          <button
            onClick={() => navigate(getDefaultRouteForRole(userRole))}
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
            title="Go to Dashboard"
          >
            <div className="absolute inset-0 rounded-lg blur opacity-75"></div>
            <img
              src="/image copy 2.png"
              className="relative h-10 w-10 object-contain rounded-lg transition-transform hover:scale-105"
              alt="ERP Bugs Logo"
            />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-3 overflow-y-auto scrollbar-sm">
          {filteredRoutes.map((route) => {
            const isActive = getIsActive(route.path, location.pathname);

            return (
              <button
                key={route.path}
                onClick={() =>
                  router.replace(
                    route.path,
                    route.name ? route.name : route.path.replace("/", "")
                  )
                }
                className={`relative group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${isActive
                    ? "bg-gradient-to-r from-[var(--sidebar-primary)] to-[var(--sidebar-ring)] text-[var(--sidebar-primary-foreground)]"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/20 hover:text-[var(--sidebar-foreground)]"
                  }`}
                title={route.name}
              >
                <span className="flex items-center justify-center">
                  {route.icon || <Link2 className="w-5 h-5" />}
                </span>

                {/* Tooltip */}
                <div className="absolute left-14 bg-[var(--sidebar-foreground)] text-[var(--sidebar)] px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {route.name || route.path.replace("/", "")}
                  <ChevronRight className="absolute -left-1 w-3 h-3 text-[var(--sidebar-foreground)]" />
                </div>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[var(--sidebar-border)] p-3">
          <div className="flex flex-col gap-2">
            {/* Profile Circle */}
            <button
              onClick={() => navigate("/profile")}
              className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
              title={user?.name || "Profile"}
            >
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-2 border-[var(--sidebar-primary)]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--sidebar-primary)] to-[var(--sidebar-ring)] flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || <UserIcon size={18} />}
                </div>
              )}
              <div className="absolute left-14 bg-[var(--sidebar-foreground)] text-[var(--sidebar)] px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Profile
                <ChevronRight className="absolute -left-1 w-3 h-3 text-[var(--sidebar-foreground)]" />
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="relative group flex items-center justify-center w-10 h-10 rounded-lg text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <div className="absolute left-14 bg-[var(--sidebar-foreground)] text-[var(--sidebar)] px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Logout
                <ChevronRight className="absolute -left-1 w-3 h-3 text-[var(--sidebar-foreground)]" />
              </div>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="relative flex flex-col bg-gradient-to-b from-[var(--sidebar)] via-[var(--card)] to-[var(--sidebar)] h-screen overflow-x-hidden border-r border-[var(--sidebar-border)] scrollbar-sm"
      style={{ width: style?.width }}
    >
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[var(--sidebar)] to-transparent px-4 py-4 flex justify-center">
        <button
          onClick={() => navigate(getDefaultRouteForRole(userRole))}
          className="flex items-center justify-center cursor-pointer group w-full relative"
          title="Go to Dashboard"
        >
          <div className="relative overflow-hidden rounded-xl px-3 py-1.5 flex items-center justify-center mx-auto">
            <img
              src="/erpbugs Logo.png"
              className="h-16 sm:h-18 w-auto max-w-[210px] object-contain transition-transform duration-300 group-hover:scale-105 mx-auto"
              alt="Nex Edu Logo"
            />
            {/* Sleek Light Sheen */}
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-25 pointer-events-none" />
          </div>
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto scrollbar-sm">
        {filteredRoutes.map((route) => {
          const isActive = getIsActive(route.path, location.pathname);

          return (
            <button
              key={route.path}
              onClick={() =>
                router.replace(
                  route.path,
                  route.name ? route.name : route.path.replace("/", "")
                )
              }
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                  ? "bg-gradient-to-r from-[var(--sidebar-primary)]/20 to-[var(--sidebar-ring)]/20 text-[var(--sidebar-primary)] font-semibold"
                  : "text-[var(--sidebar-foreground)] hover:text-[var(--sidebar-primary-foreground)] hover:bg-[var(--sidebar-accent)]/10"
                }`}
            >
              <span
                className={`flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-[var(--sidebar-primary)]" : ""
                  }`}
              >
                {route.icon || <Link2 className="w-5 h-5" />}
              </span>
              <span className="truncate text-sm font-medium">
                {route.name || route.path.replace("/", "")}
              </span>
              {isActive && (
                <div className="absolute right-0 w-1 h-6 bg-gradient-to-b from-[var(--sidebar-primary)] to-[var(--sidebar-ring)] rounded-l-md"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[var(--sidebar-border)] p-3 bg-gradient-to-t from-[var(--sidebar)] to-transparent space-y-2">
        {/* Profile Button with Role Badge */}
        <button
          onClick={() => navigate("/profile")}
          className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--sidebar-accent)]/10 transition-all duration-300"
        >
          <div className="flex-shrink-0">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[var(--sidebar-primary)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sidebar-primary)] to-[var(--sidebar-ring)] flex items-center justify-center text-white font-semibold text-sm">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || <UserIcon size={18} />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {user?.name || "User"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeColor()}`}
              >
                {userRole || "GUEST"}
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300 font-medium"
        >
          <span className="flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <LogOut className="w-5 h-5" />
          </span>
          <span className="truncate text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function getIsActive(routePath: string, currentPath: string): boolean {
  if (routePath === currentPath) return true;

  const route = routes.find((r) => r.path === routePath);
  if (!route) return false;

  if (currentPath.startsWith(routePath)) return true;

  return (route.activeFor || []).some((path) => currentPath.startsWith(path));
}
