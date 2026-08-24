"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CurrencyState = {
  currency: "GHS";
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    () => ({
      currency: "GHS",
    }),
    {
      name: "bencord-currency",
    },
  ),
);