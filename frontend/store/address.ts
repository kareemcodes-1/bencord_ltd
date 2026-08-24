// store/address.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedAddress = {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type AddressStore = {
  addresses: SavedAddress[];
  setAddresses: (addresses: SavedAddress[]) => void;
  addAddress: (address: SavedAddress) => void;
  updateAddress: (id: string, data: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  getDefaultAddress: () => SavedAddress | null;
  clear: () => void;
};

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      setAddresses: (addresses) => set({ addresses }),

      addAddress: (address) =>
        set((state) => ({
          addresses: [...state.addresses, address],
        })),

      updateAddress: (id, data) =>
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr._id === id ? { ...addr, ...data } : addr
          ),
        })),

      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr._id !== id),
        })),

      getDefaultAddress: () => {
        const { addresses } = get();
        return (
          addresses.find((a) => a.isDefault) || addresses[0] || null
        );
      },

      clear: () => set({ addresses: [] }),
    }),
    {
      name: "bencord-addresses", // localStorage key
    }
  )
);