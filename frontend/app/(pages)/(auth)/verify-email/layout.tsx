import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description:
    "Verify your email address to complete your account setup.",
};

const VerifyEmailLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};

export default VerifyEmailLayout;