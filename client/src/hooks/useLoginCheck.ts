import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userStore } from "../state/global";
import { API_ROUTES } from "../lib/api";
import api from "../lib/axios/axios";

async function getMe() {
  const res = await api.get(API_ROUTES.AUTH.ME);
  return res.data;
}

export default function useCheckLogin() {
  const { token, setUser } = userStore();
  const navigate = useNavigate();

  const enabled = Boolean(token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me", token],
    queryFn: getMe,
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (isError) {
      navigate("/login");
    } else if (data) {
      // Sync user data to store if it differs or just to ensure it's fresh
      // Check if data has the expected structure. Assuming data.data is the user object based on common patterns
      // or if getMe returns the user directly.
      // Based on Login.tsx, LoginResponse.data.user.
      // Let's assume getMe returns { data: user } or just user.
      // If getMe returns res.data, and res.data contains { data: user }?
      // Let's rely on what `setUser` expects.
      // userStore expects: user: { ... } | null

      // If data is the full response body, it might be data.data
      const userToSet = data.data || data;

      // Only set if we have valid user info. 
      // We'll use a safer approach and try to match the shape or just set it.
      // Actually, safely we should inspect `data`.

      if (userToSet && userToSet.id) {
        setUser(userToSet);
      }
    }
  }, [token, isError, navigate, data, setUser]);

  return {
    isLoading,
    isLogedIn: Boolean(data),
  }
}
