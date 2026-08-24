"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  X,
  User,
  Package,
  Star,
  LogOut,
  Store,
  Info,
  Mail,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface MenuModalProps {
  openMenuModal: boolean;
  setOpenMenuModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const links = [
  { label: "Shop", href: "/shop", icon: Store },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Mail },
];

const MenuModal = ({ openMenuModal, setOpenMenuModal }: MenuModalProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const go = (href: string) => {
    setOpenMenuModal(false);
    router.push(href);
  };

  return (
    <Sheet open={openMenuModal} onOpenChange={setOpenMenuModal}>
      <SheetContent
        side="right"
        className="z-[350] flex h-full w-full max-w-full flex-col gap-0 border-l border-black/10 bg-white p-0 sm:max-w-[24rem] [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b px-5 py-4 sm:px-6">
          <SheetTitle className="heading-3 text-left">Menu</SheetTitle>

          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close menu"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors duration-300 hover:bg-[#ee0a0a] hover:text-white sm:h-10 sm:w-10"
            >
              <X size={18} strokeWidth={1.5} className="sm:size-5" />
            </button>
          </SheetClose>
        </SheetHeader>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => go(link.href)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
              >
                <link.icon
                  size={16}
                  strokeWidth={1.8}
                  className="text-black/50"
                />
                {link.label}
              </button>
            ))}
          </div>

          {/* Account */}
          <div className="mt-2 border-t border-black/10 pt-2">
            {session?.user ? (
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => go("/profile")}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
                >
                  <User size={16} strokeWidth={1.8} className="text-black/50" />
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() => go("/orders")}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
                >
                  <Package
                    size={16}
                    strokeWidth={1.8}
                    className="text-black/50"
                  />
                  Orders
                </button>

                <button
                  type="button"
                  onClick={() => go("/reviews/pending")}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
                >
                  <Star size={16} strokeWidth={1.8} className="text-black/50" />
                  Pending Reviews
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuModal(false);
                    signOut();
                  }}
                  className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} strokeWidth={1.8} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => go("/login")}
                  className="btn-primary w-full"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuModal;