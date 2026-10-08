"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectDB from "@/lib/mongodb";

import User from "@/models/User";
import Subscriber from "@/models/Subscriber";

export type ProfileAddress = {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  addresses: ProfileAddress[];
  emailUpdates: boolean;
};

export async function getProfile(): Promise<ProfileUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  await connectDB();

  const user = await User.findById(session.user.id)
    .select("name email phone addresses")
    .lean();

  if (!user) {
    return null;
  }

  // Check whether this user's email is subscribed
  // to LoisBanks Beauty email updates.
  const subscriber = await Subscriber.findOne({
    email: user.email,
  })
    .select("isActive")
    .lean();

  const emailUpdates = subscriber?.isActive ?? false;

  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",

    emailUpdates,

    addresses: (user.addresses ?? []).map((a) => ({
      _id: String(a._id),
      firstName: a.firstName,
      lastName: a.lastName,
      address: a.address,
      apartment: a.apartment ?? "",
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    })),
  };
}

