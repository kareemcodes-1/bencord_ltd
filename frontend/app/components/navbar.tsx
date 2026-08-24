"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

import {
  Menu,
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  MessageSquareMore,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CartModal from "./modals/cart-modal";
import SearchModal from "./modals/search-modal";
import MenuModal from "./modals/menu-modal";
import { useCartStore } from "@/store/cart";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openCartModal, setOpenCartModal] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openMenuModal, setOpenMenuModal] = useState(false);

  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);

  // Total quantity of items in cart
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openMenuModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openMenuModal]);

  const links = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {openSearchModal && (
        <SearchModal
          openSearchModal={openSearchModal}
          setOpenSearchModal={() => setOpenSearchModal(false)}
        />
      )}

      {openCartModal && (
        <CartModal
          openCartModal={openCartModal}
          setOpenCartModal={() => setOpenCartModal(false)}
        />
      )}

      {openMenuModal && (
        <MenuModal
          openMenuModal={openMenuModal}
          setOpenMenuModal={setOpenMenuModal}
        />
      )}

      <header
        className={`fixed left-0 right-0 top-0 z-[300] transition-all duration-500 ${
          scrolled ? "translate-y-0" : ""
        }`}
      >
        <nav
          className={`relative flex items-center justify-between border px-4 py-3.5 transition-all duration-500 sm:px-6 sm:py-4 lg:px-8 lg:py-5 ${
            scrolled
              ? "border-black/5 bg-white shadow-sm"
              : "border-[#EDEAE6] bg-white shadow-sm"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            scroll
            className="relative block h-[36px] w-[105px] shrink-0 sm:h-[40px] sm:w-[115px] lg:h-[56px] lg:w-[170px]"
          >
            <Image
              src="/logo.jpeg"
              alt="Logo"
              fill
              priority
              quality={100}
              className="object-cover"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-[2.5rem] lg:flex">
            {links.map((link) => (
              <Link
                scroll
                key={link.href}
                href={link.href}
                className="relative inline-block text-[.9rem] font-[550] uppercase tracking-wide transition-colors duration-300 hover:text-[#ee0a0a] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#ee0a0a] after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-[5rem]">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <button
                onClick={() => setOpenSearchModal(true)}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[.5rem] border border-black/10 bg-white transition-all duration-300 hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 sm:h-11 sm:w-11"
              >
                <Search size={18} className="sm:hidden" />
                <Search size={20} className="hidden sm:block" />
              </button>

              {/* Cart with badge */}
              <button
                onClick={() => setOpenCartModal(true)}
                className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[.5rem] border border-black/10 bg-white transition-all duration-300 hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 sm:h-11 sm:w-11"
              >
                <ShoppingCart size={18} className="sm:hidden" />
                <ShoppingCart size={20} className="hidden sm:block" />

                {/* Badge */}
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ee0a0a] px-1 text-[10px] font-semibold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* User - desktop only */}
              <div className="hidden lg:block">
                {!session ? (
                  <Link
                    href="/login"
                    className="flex h-11 w-11 items-center justify-center rounded-[.5rem] border border-black/10 bg-white transition-all duration-300 hover:border-red-500/30 hover:bg-red-50 hover:text-red-600"
                  >
                    <User size={20} />
                  </Link>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-11 w-11 items-center justify-center rounded-[.5rem] border border-black/10 bg-white outline-none transition-all duration-300 hover:border-red-500/30 hover:bg-red-50 hover:text-red-600">
                        <User size={20} />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="z-[500] w-[240px] overflow-hidden rounded-[1.25rem] border border-black/5 p-0 shadow-xl"
                    >
                      <div className="border-b border-black/5 bg-black/[0.02] px-5 py-4">
                        <p className="truncate font-medium">
                          {session.user.name}
                        </p>
                        <p className="mt-1 truncate text-[.78rem] text-black/50">
                          {session.user.email}
                        </p>
                      </div>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          className="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:text-[#ee0a0a]"
                        >
                          <LayoutDashboard size={18} />
                          Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/orders"
                          className="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:text-[#ee0a0a]"
                        >
                          <Package size={18} />
                          Orders
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/reviews/pending"
                          className="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:text-[#ee0a0a]"
                        >
                          <MessageSquareMore size={18} />
                          Pending Reviews
                        </Link>
                      </DropdownMenuItem>

                      <div className="border-t border-black/5" />

                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="flex cursor-pointer items-center gap-3 px-5 py-3 text-red-500 hover:text-red-600"
                      >
                        <LogOut size={18} />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setOpenMenuModal(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[.75rem] border border-black/10 transition-all hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 sm:h-11 sm:w-11 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;