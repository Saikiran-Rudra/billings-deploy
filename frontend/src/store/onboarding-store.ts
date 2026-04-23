import { create } from "zustand";
import { persist, StateStorage } from "zustand/middleware";

export interface OnboardingFormData {
  business: {
    businessName: string;
    businessType: string;
    industry: string;
    businessAddress: string;
  };
  bank: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
  };
  tax: {
    gstRegistration: string;
    gstin: string;
    panNumber: string;
    financialYearStart: string;
  };
}

interface OnboardingStore {
  formData: OnboardingFormData;
  currentUserId: string | null;
  setFormData: (step: keyof OnboardingFormData, data: any) => void;
  updateField: (step: keyof OnboardingFormData, field: string, value: any) => void;
  resetForm: () => void;
  getFormData: () => OnboardingFormData;
  setCurrentUserId: (userId: string | null) => void;
  clearForUser: (userId: string) => void;
}

const initialFormData: OnboardingFormData = {
  business: {
    businessName: "",
    businessType: "",
    industry: "",
    businessAddress: "",
  },
  bank: {
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
  },
  tax: {
    gstRegistration: "",
    gstin: "",
    panNumber: "",
    financialYearStart: "",
  },
};

/**
 * Custom storage handler for user-specific localStorage keys
 * Uses format: onboarding-${userId}
 */
const createUserSpecificStorage = (): StateStorage => ({
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    // Extract userId from key format: "onboarding-store-userId"
    const match = key.match(/onboarding-store-(.*)/);
    const userId = match ? match[1] : null;

    if (!userId || userId === "null" || userId === "") {
      return null;
    }

    const userSpecificKey = `onboarding-${userId}`;
    const item = localStorage.getItem(userSpecificKey);
    return item;
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    // Extract userId from key format: "onboarding-store-userId"
    const match = key.match(/onboarding-store-(.*)/);
    const userId = match ? match[1] : null;

    if (!userId || userId === "null" || userId === "") {
      console.warn("Cannot persist onboarding data: No valid userId");
      return;
    }

    const userSpecificKey = `onboarding-${userId}`;
    localStorage.setItem(userSpecificKey, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    // Extract userId from key format: "onboarding-store-userId"
    const match = key.match(/onboarding-store-(.*)/);
    const userId = match ? match[1] : null;

    if (!userId || userId === "null" || userId === "") {
      return;
    }

    const userSpecificKey = `onboarding-${userId}`;
    localStorage.removeItem(userSpecificKey);
  },
});

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      currentUserId: null,

      setFormData: (step: keyof OnboardingFormData, data: any) => {
        set((state) => ({
          formData: {
            ...state.formData,
            [step]: {
              ...state.formData[step],
              ...data,
            },
          },
        }));
      },

      updateField: (step: keyof OnboardingFormData, field: string, value: any) => {
        set((state) => ({
          formData: {
            ...state.formData,
            [step]: {
              ...state.formData[step],
              [field]: value,
            },
          },
        }));
      },

      resetForm: () => {
        set({ formData: initialFormData });
      },

      getFormData: () => {
        return get().formData;
      },

      setCurrentUserId: (userId: string | null) => {
        set({ currentUserId: userId });
      },

      /**
       * Clears all onboarding data for a specific user
       * Call this after successful submission or logout
       */
      clearForUser: (userId: string) => {
        if (typeof window === "undefined") return;
        const storageKey = `onboarding-${userId}`;
        localStorage.removeItem(storageKey);
      },
    }),
    {
      name: `onboarding-store-${typeof window !== "undefined" ? localStorage.getItem("userId") || "default" : "default"}`,
      storage: createUserSpecificStorage(),
      partialize: (state) => ({ formData: state.formData }),
    }
  )
);
