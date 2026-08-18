import { useQuery } from "@tanstack/react-query";
import { userStore } from "../state/global";
import { API_ROUTES } from "../lib/api";
import api from "../lib/axios/axios";

async function getMe() {
  const res = await api.get(API_ROUTES.AUTH.ME);
  return res.data;
}

export default function useLogin() {
  const { token } = userStore();

  const enabled = Boolean(token);
  const { data, isLoading } = useQuery({
    queryKey: ["me", token],
    queryFn: getMe,
    enabled,
    retry: false,
  });

  return {
    isLoading,
    isLogedIn: Boolean(data),
  }
}
