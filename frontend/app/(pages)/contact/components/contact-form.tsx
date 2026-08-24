"use client";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin } from "lucide-react";
import { SplitLines } from "@/components/animations/SplitLines";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Message sent!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      value: "bencordinvestmentt@gmail.com",
      href: "mailto:bencordinvestmentt@gmail.com",
    },
    {
      icon: Phone,
      value: "+233552256922",
      href: "tel:+233552256922",
    },
    {
      icon: MapPin,
      value:
        "71, JONES NELSON ROAD , GOIL FILLING STATION, OPPOSITE CUA HOUSE, ACCRA",
      href: "https://www.google.com/maps/dir//Bencord+ltd,+Opposite+CUA+House,+71,+Jones+Nelson+Road+Goil+filling+station,+Ghana/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0xfdf91c8b23506e3:0xb83c276c1cff35fb?sa=X&ved=1t:57443&ictx=111",
    },
  ];

  return (
    <main className="w-full px-[1.5rem] sm:px-8 lg:px-[3rem] pb-[4rem] pt-[9rem]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-24">
        {/* LEFT */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <SplitLines
            text="Contact Us"
            tag="span"
            className="subtitle"
            duration={0.8}
            stagger={0.02}
            ease="power3.out"
            yPercent={120}
            threshold={0.1}
            rootMargin="-80px"
          />

          <SplitLines
            text="We’re Here to Help"
            tag="h2"
            className="heading-1 max-w-[min(37.5rem,100%)] text-black"
            duration={1}
            stagger={0.025}
            ease="power3.out"
            yPercent={150}
            threshold={0.1}
            rootMargin="-100px"
            delay={0.12}
          />

          <div className="flex flex-col gap-4 pt-2 sm:gap-5 sm:pt-4">
            {contactItems.map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={i}
                  className="flex items-start gap-3 sm:items-center sm:gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ee0a0a]/10 sm:h-12 sm:w-12">
                    <Icon
                      size={16}
                      className="text-[#ee0a0a] sm:size-[18px]"
                    />
                  </div>

                  {item.href ? (
                    <a
                      href={item.href}
                      className="break-words text-[0.95rem] text-black/90 transition-opacity font-medium hover:opacity-60 sm:text-[1.1rem]"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="break-words text-[0.95rem] text-black/90 sm:text-[1.1rem] font-medium">
                      {item.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.08)] sm:gap-6 sm:rounded-[2rem] sm:p-6 md:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                Name
              </label>
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="h-11 rounded-[0.75rem] sm:h-12"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="h-11 rounded-[0.75rem] sm:h-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
              Subject
            </label>
            <Input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="h-11 rounded-[0.75rem] sm:h-12"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
              Message
            </label>
            <Textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="min-h-[7rem] w-full resize-none rounded-[0.75rem]"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {loading ? <Spinner className="size-6" /> : "Send Message"}
          </button>
        </div>
      </div>
    </main>
  );
}