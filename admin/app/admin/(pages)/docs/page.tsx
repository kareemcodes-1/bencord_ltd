"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Percent,
  Star,
  UserCog,
  SlidersHorizontal,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Section registry — drives both the sticky nav and the content     */
/* ------------------------------------------------------------------ */

const SECTIONS: { id: string; title: string; icon: LucideIcon }[] = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "products", title: "Products", icon: Package },
  { id: "categories", title: "Categories", icon: FolderTree },
  { id: "orders", title: "Orders", icon: ShoppingCart },
  { id: "users", title: "Users", icon: Users },
  { id: "discounts", title: "Discounts", icon: Percent },
  { id: "reviews", title: "Reviews", icon: Star },
  { id: "account", title: "Account", icon: UserCog },
  { id: "preferences", title: "Preferences", icon: SlidersHorizontal },
  { id: "tips", title: "Quick tips", icon: Lightbulb },
];

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */

function SectionBlock({
  id,
  title,
  icon: Icon,
  register,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  register: (el: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      ref={register}
      className="scroll-mt-24 rounded-xl border bg-card"
    >
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-4.5" />
        </span>
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Term({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-l-2 border-border pl-4 sm:grid-cols-[140px_1fr] sm:gap-4">
      <p className="text-sm font-medium text-foreground">{name}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="shrink-0 font-medium">
      {label}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DocumentationPage() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <PageHeader
          title="Documentation"
          description="A simple guide to using your admin panel. No technical knowledge needed."
        />

        <div className="w-full gap-8 ">

          {/* Content */}
          <div className="flex flex-col gap-6 pb-16">
            <SectionBlock
              id="dashboard"
              title="Dashboard"
              icon={LayoutDashboard}
              register={(el) => (sectionRefs.current.dashboard = el)}
            >
              <p>
                This is your overview page. It shows how the store is doing
                at a glance.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Total revenue
                  </span>{" "}
                  — money made from completed orders
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Total products
                  </span>{" "}
                  — how many products are in the store
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Total orders
                  </span>{" "}
                  — how many orders customers have placed
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Total users
                  </span>{" "}
                  — how many customer accounts exist
                </li>
              </ul>
              <p>
                The chart shows orders over time (for example last 7 days, 30
                days, or 3 months). Below that you&rsquo;ll see recent
                customers and recent reviews.
              </p>
            </SectionBlock>

            <SectionBlock
              id="products"
              title="Products"
              icon={Package}
              register={(el) => (sectionRefs.current.products = el)}
            >
              <p>
                Use this page to add, edit, or delete products that appear on
                the website — such as printers, toner cartridges, ink
                cartridges, laptops, and office essentials.
              </p>
              <div className="space-y-3 pt-1">
                <Term name="Name">The product name customers see.</Term>
                <Term name="Slug">
                  The link text for the product page (usually created from
                  the name).
                </Term>
                <Term name="Category">
                  The group this product belongs to (for example Toner
                  Cartridges, Ink Cartridges, Printers, or Office
                  Essentials).
                </Term>
                <Term name="Description">
                  Short details about the product for the product page.
                  Include compatibility info where useful (for example which
                  printer models a cartridge fits).
                </Term>
                <Term name="Price">Selling price in Ghana Cedis (GHS).</Term>
                <Term name="Media">
                  Photos of the product. Add clear images so customers can
                  see what they are buying.
                </Term>
                <Term name="Track inventory">
                  Turn this on if you want the website to count how many you
                  have left. Turn it off if you always have stock or
                  don&rsquo;t want the site to track numbers.
                </Term>
                <Term name="Stock">
                  How many of this product you currently have. When it
                  reaches 0 (and tracking is on), customers can&rsquo;t buy
                  it.
                </Term>
                <Term name="Low stock threshold">
                  A warning level. Example: if you set 5, the product is
                  marked &ldquo;low stock&rdquo; when 5 or fewer are left.
                </Term>
                <Term name="Featured">
                  Shows the product in special / highlighted areas on the
                  website.
                </Term>
                <Term name="Active">
                  When on, the product is visible in the store. When off, it
                  is hidden from customers but still saved in admin.
                </Term>
              </div>
            </SectionBlock>

            <SectionBlock
              id="categories"
              title="Categories"
              icon={FolderTree}
              register={(el) => (sectionRefs.current.categories = el)}
            >
              <p>
                Categories are groups of products (for example &ldquo;Toner
                Cartridges&rdquo;, &ldquo;Ink Cartridges&rdquo;,
                &ldquo;Printers&rdquo;, or &ldquo;Office Essentials&rdquo;).
              </p>
              <p>
                You can create, edit, or delete a category. Give it a name,
                description, and image. Mark it as featured if you want it
                shown more prominently on the site.
              </p>
              <p>
                Products must belong to a category, so create categories
                before (or while) adding products.
              </p>
            </SectionBlock>

            <SectionBlock
              id="orders"
              title="Orders"
              icon={ShoppingCart}
              register={(el) => (sectionRefs.current.orders = el)}
            >
              <p>
                Here you see every order customers place. Open an order to
                see items, address, payment, and total.
              </p>
              <p className="text-foreground">
                You can update the order status as you process it:
              </p>
              <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center gap-3">
                  <StatusBadge label="Processing" />
                  <span>new order, still being prepared</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Confirmed" />
                  <span>you&rsquo;ve accepted the order</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Shipped" />
                  <span>order has left the store / is on the way</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Ready for pickup" />
                  <span>for store pickup orders that are ready</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Delivered" />
                  <span>customer has received a door delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Cancelled" />
                  <span>order was cancelled</span>
                </div>
              </div>
              <p className="pt-1">
                You deliver across Ghana. Update the status as the order
                moves so you can track progress clearly.
              </p>
            </SectionBlock>

            <SectionBlock
              id="users"
              title="Users"
              icon={Users}
              register={(el) => (sectionRefs.current.users = el)}
            >
              <p>
                This page lists customer accounts. You can open a user to see
                their contact details, saved addresses, and orders.
              </p>
            </SectionBlock>

            <SectionBlock
              id="discounts"
              title="Discounts"
              icon={Percent}
              register={(el) => (sectionRefs.current.discounts = el)}
            >
              <p>
                Create sales on selected products. Discounts show on the
                product card and product page (for example &ldquo;20%
                off&rdquo;).
              </p>
              <div className="space-y-3 pt-1">
                <Term name="Percentage vs fixed">
                  Percentage = off by % (e.g. 20%). Fixed = off by a set
                  amount in Ghana Cedis (e.g. GHS 50).
                </Term>
                <Term name="Products">
                  Choose which products the discount applies to.
                </Term>
                <Term name="Start / end dates">
                  When the discount becomes active and when it stops.
                </Term>
                <Term name="Active">
                  Turn off to pause a discount without deleting it.
                </Term>
              </div>
            </SectionBlock>

            <SectionBlock
              id="reviews"
              title="Reviews"
              icon={Star}
              register={(el) => (sectionRefs.current.reviews = el)}
            >
              <p>
                Customer product reviews appear here. You can approve
                reviews so they show on the website, or hide/delete ones
                that shouldn&rsquo;t be public.
              </p>
            </SectionBlock>

            <SectionBlock
              id="account"
              title="Account"
              icon={UserCog}
              register={(el) => (sectionRefs.current.account = el)}
            >
              <p>
                Update your admin name, email, and phone. This is your login
                profile for the admin panel.
              </p>
            </SectionBlock>

            <SectionBlock
              id="preferences"
              title="Preferences"
              icon={SlidersHorizontal}
              register={(el) => (sectionRefs.current.preferences = el)}
            >
              <p>
                Choose light or dark mode for the admin panel display. This
                only changes how the admin looks for you — not the customer
                website.
              </p>
            </SectionBlock>

            <SectionBlock
              id="tips"
              title="Quick tips"
              icon={Lightbulb}
              register={(el) => (sectionRefs.current.tips = el)}
            >
              <ul className="list-disc space-y-2 pl-5">
                <li>Always set price in Ghana Cedis (GHS).</li>
                <li>
                  Include printer compatibility in product descriptions
                  where relevant (especially for toner and ink cartridges).
                </li>
                <li>
                  Turn a product off (inactive) instead of deleting it if you
                  might sell it again.
                </li>
                <li>
                  Update order status as you process orders so you can
                  follow progress.
                </li>
                <li>
                  Create categories first, then add products into those
                  categories.
                </li>
                <li>
                  Check Reviews regularly so only suitable reviews appear on
                  the site.
                </li>
              </ul>
            </SectionBlock>

            <Separator className="mt-2" />
          </div>
        </div>
      </div>
    </main>
  );
}