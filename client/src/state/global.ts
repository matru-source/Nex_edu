import { create } from 'zustand';
import { localKey } from "../lib/api"
import type { UserRole } from '../types';

export interface NavStack {
  title: string;
  path: string;
}

interface NavigationStore {
  navStack: NavStack[];
  setNavStack: (navStack: NavStack[]) => void;
  safeSetNavStack: (navStack: NavStack[]) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  navStack: [],
  setNavStack: (navStack) => set({ navStack }),
  safeSetNavStack: (navStack) => {
    if (navStack.length != 0) {
      set({ navStack });
    }
  },
}));

interface SideBarStore {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapse: (isCollapsed: boolean) => void;
}

export const useSideBarStore = create<SideBarStore>((set) => ({
  isCollapsed: false,
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapse: (isCollapsed) => set({ isCollapsed }),
}));

interface UserStore {
  token: string | null;
  setToken: (token: string) => void;
  user: {
    password: string;
    name: string;
    id: string;
    email: string;
    role: UserRole;
    profilePhoto?: string | null;
  } | null;
  setUser: (user: UserStore['user']) => void;
}

export const userStore = create<UserStore>((set) => ({
  token: localStorage.getItem(localKey.token) || null,
  setToken: (token) => {
    localStorage.setItem(localKey.token, token);
    set({ token });
  },
  user: localStorage.getItem(localKey.user) ? JSON.parse(localStorage.getItem(localKey.user)!) : null,
  setUser: (user) => {
    localStorage.setItem(localKey.user, JSON.stringify(user));
    set({ user });
  },
}));