// app/checkout/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import CheckoutForm from "./components/checkout-form"; // or "@/components/checkout/checkout-form"

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/checkout");
  }

  await connectDB();

  // Fetch user + addresses together
  const userDoc = await User.findOne({ email: session.user.email })
    .select("name email phone addresses")
    .lean();

  if (!userDoc) {
    redirect("/login?callbackUrl=/checkout");
  }

  const user = {
    email: userDoc.email,
    phone: userDoc.phone || "",
    name: userDoc.name || "",
    addresses: (userDoc.addresses || []).map((addr: any) => ({
      _id: addr._id.toString(),
      firstName: addr.firstName,
      lastName: addr.lastName,
      address: addr.address,
      apartment: addr.apartment || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault || false,
    })),
  };

  return (
    <section className="min-h-screen px-6 pb-24 pt-[9rem] lg:px-[3rem]">
           <div className="mx-auto mb-8 max-w-[60rem] text-center sm:mb-10 lg:mb-12">
        <span className="subtitle">Checkout</span>
        <h1 className="heading-1 mt-3">Secure Checkout</h1>
        <p className="mx-auto mt-3 max-w-[22rem] text-sm text-black/50 sm:max-w-[28rem]">
          Confirm your details and place your order.
        </p>
      </div>

      <div className="mx-auto max-w-[72rem]">
        <CheckoutForm user={user} />
      </div>
    </section>
  );
}
