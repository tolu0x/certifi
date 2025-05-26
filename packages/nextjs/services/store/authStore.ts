"use client";

import { Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "~~/types/auth";

export interface UserData extends Omit<User, "id"> {
  address: Address;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (address: Address, role: UserRole, profileData?: Partial<UserData["profileData"]>) => void;
  logout: () => void;
  updateUserProfile: (profileData: Partial<UserData>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: (address, role, profileData) => {
        const userData: UserData = {
          address,
          role,
          profileData: profileData || {},
        };

        set({ user: userData, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUserProfile: profileData => {
        set(state => {
          if (!state.user) return state;

          return {
            ...state,
            user: { ...state.user, ...profileData },
          };
        });
      },

      setLoading: loading => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "certifi-auth-storage",

      // Custom storage to handle Address type correctly
      storage: {
        getItem: name => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const obj = JSON.parse(str);
            return obj;
          } catch (error) {
            return null;
          }
        },

        setItem: (name, value) => {
          const str = JSON.stringify(value);
          localStorage.setItem(name, str);
        },

        removeItem: name => {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);
