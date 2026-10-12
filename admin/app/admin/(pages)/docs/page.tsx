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
  MapPin,
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
  { id: "shipping-rates", title: "Shipping Rates", icon: MapPin },
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
            {/* ===== Dashboard ===== */}
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
                  — total revenue generated from completed orders
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Total orders
                  </span>{" "}
                  — the total number of orders placed on the store
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Total visitors
                  </span>{" "}
                  — website visitors recorded in the last 30 days
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Conversion rate
                  </span>{" "}
                  — the percentage of visitors who completed an order
                </li>
              </ul>
              <p>
                Below the overview cards, you&rsquo;ll find your revenue chart,
                traffic sources, top countries, and top-selling products. These
                sections help you understand where your visitors are coming from,
                where they are located, and which products are performing best.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Revenue chart
                  </span>{" "}
                  — shows your store&rsquo;s revenue and order activity over time
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Traffic sources
                  </span>{" "}
                  — shows where visitors are coming from
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Top countries
                  </span>{" "}
                  — shows the countries generating the most website traffic
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Top-selling products
                  </span>{" "}
                  — shows the products receiving the most sales
                </li>
              </ul>
            </SectionBlock>

            {/* ===== Products ===== */}
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
                <Term name="In Stock">
                  Controls whether the product is available for purchase. Turn this
                  off when the product is currently unavailable.
                </Term>
                <Term name="Average Rating">
                  The product&rsquo;s average customer rating. This is calculated from
                  the reviews the product receives.
                </Term>
                <Term name="Review Count">
                  The total number of customer reviews the product has received.
                </Term>
                <Term name="Featured">
                  Shows the product in special / highlighted areas on the
                  website.
                </Term>
              </div>
            </SectionBlock>

            {/* ===== Categories ===== */}
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

            {/* ===== Orders ===== */}
            <SectionBlock
              id="orders"
              title="Orders"
              icon={ShoppingCart}
              register={(el) => (sectionRefs.current.orders = el)}
            >
              <p>
                Here you can view and manage every order customers place. Open an
                order to see the products purchased, customer details, shipping
                address, payment information, shipping method, and order total.
              </p>

              <p className="text-foreground">
                You can update the order status as you process each order:
              </p>

              <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center gap-3">
                  <StatusBadge label="Pending" />
                  <span>new order that has not been confirmed yet</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Confirmed" />
                  <span>order has been accepted and confirmed</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Shipped" />
                  <span>order has left the store and is being transported</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Out for delivery" />
                  <span>order is currently on its way to the customer</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Ready for pickup" />
                  <span>pickup order is ready for the customer to collect</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Delivered" />
                  <span>customer has received the order</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label="Cancelled" />
                  <span>order has been cancelled</span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <Term name="Payment method">
                  Orders currently use bank transfer as the payment method.
                </Term>
                <Term name="Shipping fee">
                  The delivery charge added to the order. Pickup orders can have a
                  shipping fee of zero.
                </Term>
                <Term name="Tracking number">
                  An optional tracking number you can add when the order is being
                  shipped or delivered.
                </Term>
                <Term name="Admin note">
                  A private note for internal use. Use this to record useful
                  information about the order while processing it.
                </Term>
              </div>
            </SectionBlock>

            {/* ===== Shipping Rates (NEW) ===== */}
            <SectionBlock
              id="shipping-rates"
              title="Shipping Rates"
              icon={MapPin}
              register={(el) => (sectionRefs.current["shipping-rates"] = el)}
            >
              <p>
                Use this page to manage door delivery fees for different locations
                in Ghana. Customers will only be able to choose door delivery for
                locations you have added here.
              </p>

              <div className="space-y-3 pt-1">
                <Term name="Location">
                  The name of the region or area (for example &ldquo;Greater Accra&rdquo;,
                  &ldquo;Ashanti&rdquo;, &ldquo;Northern&rdquo;). Use the exact name that appears
                  in the Region dropdown on the checkout page.
                </Term>

                <Term name="Fee">
                  The delivery charge in Ghana Cedis (GHS) for that location.
                </Term>

                <Term name="Active">
                  When turned on, customers can select this location for door delivery.
                  When turned off, the location is hidden from customers.
                </Term>
              </div>

              <p className="pt-2">
                <strong className="text-foreground">Important:</strong> The location
                name must match the Region name exactly (for example &ldquo;Greater Accra&rdquo;).
                If it does not match, customers will see “Delivery not available for
                this region”.
              </p>
            </SectionBlock>

            {/* ===== Users ===== */}
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

            {/* ===== Discounts ===== */}
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

            {/* ===== Reviews ===== */}
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

            {/* ===== Account ===== */}
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

            {/* ===== Preferences ===== */}
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

            {/* ===== Tips ===== */}
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
                <li>
                  When adding Shipping Rates, use the exact Region name
                  (e.g. “Greater Accra”) so it matches the checkout form.
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