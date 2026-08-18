import { useEffect } from "react";
import { userStore } from "../state/global";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const user = userStore(state => state.user);
  const userRole = user?.role || null;

  const currentPath = window.location.pathname;
  const navigate = useNavigate();

  useEffect(() => {
    // No user and trying to access protected route
    if (!userRole && currentPath !== '/' && currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/forget-password' && !currentPath.startsWith('/public') && !currentPath.startsWith('/career-path') && !currentPath.startsWith('/gateway')) {
      navigate('/');
      return;
    }

    // Role-based redirections
    if (userRole === 'ADMIN' && !currentPath.startsWith('/admin') && !currentPath.startsWith('/profile') && !currentPath.startsWith('/notifications')) {
      navigate('/admin/dashboard');
    } else if (userRole === 'STUDENT' && (currentPath.startsWith('/admin') || currentPath.startsWith('/contributor') || currentPath.startsWith('/moderator'))) {
      navigate('/dashboard');
    } else if (userRole === 'CONTRIBUTOR' && (currentPath.startsWith('/admin') || currentPath.startsWith('/moderator'))) {
      navigate('/contributor/courses');
    } else if (userRole === 'MODERATOR' && (currentPath.startsWith('/admin') || currentPath.startsWith('/contributor'))) {
      navigate('/moderator/submissions');
    }
  }, [userRole, currentPath, navigate]);
}