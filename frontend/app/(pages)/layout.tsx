import Navbar from "../components/navbar";
import Footer from "../components/footer";
import ScrollToTop from "../components/scroll-to-top";
import AuthProvider from "@/providers/session-provider";
import ToastProvider from "@/providers/toast-provider";
import NextTopLoader from "nextjs-toploader";
import PageTransition from "../components/page-transition";
import WhatsAppBubble from "../components/whatsapp-bubble";
import NewsletterModal from "../components/modals/newsletter-modal";

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>

      <ToastProvider />

      <ScrollToTop />

      <NextTopLoader
        color="#ee0a0a"
        height={2}
        showSpinner={false}
        crawlSpeed={200}
        speed={400}
        shadow="0 0 10px #ee0a0a, 0 0 5px #ee0a0a"
      />

      <Navbar />

      <main>
         <PageTransition>
          {children}
          </PageTransition>
          </main>

            <NewsletterModal />
        <WhatsAppBubble />
      <Footer />
    </>
  );
}