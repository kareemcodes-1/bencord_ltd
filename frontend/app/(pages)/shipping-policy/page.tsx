import React from "react";

export default function ShippingPolicyPage() {
  return (
    <main className="w-full pt-[9rem] pb-[6rem]">
      <section className="mx-auto w-full max-w-4xl px-[1.5rem] sm:px-[2rem] lg:px-[3rem]">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="subtitle mb-4">How We Ship</p>

          <h1 className="heading-1 text-black">
            Shipping Policy
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-black/60 leading-relaxed">
            We are committed to making sure your order is carefully processed
            and delivered to you as smoothly as possible.
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-12 text-black/70 leading-relaxed">
          {/* Processing Time */}
          <section>
            <h2 className="mb-4 text-xl font-medium text-black">
              Order Processing
            </h2>

            <p>
              All orders are processed and confirmed within{" "}
              <strong className="text-black">24–48 hours</strong> after
              payment has been received.
            </p>
          </section>

          {/* Delivery */}
          <section>
            <h2 className="mb-4 text-xl font-medium text-black">
              Delivery Time
            </h2>

            <p>
              Delivery times vary depending on your location and the delivery
              method used for your order. Once your order has been processed
              and handed over for delivery, the expected delivery timeframe
              will depend on your location.
            </p>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="mb-4 text-xl font-medium text-black">
              Shipping
            </h2>

            <p>
              We offer delivery within Nigeria and international shipping.
              Shipping arrangements and delivery timelines may vary depending
              on the destination.
            </p>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="mb-4 text-xl font-medium text-black">
              Order Tracking
            </h2>

            <p>
              Once your order has been processed and shipped, you will receive
              your tracking information. You can use your tracking details to
              follow the progress of your delivery.
            </p>
          </section>

          {/* Delays */}
          <section>
            <h2 className="mb-4 text-xl font-medium text-black">
              Delivery Delays
            </h2>

            <p>
              While we work with our delivery partners to ensure your order
              arrives as expected, delivery times may occasionally be affected
              by factors such as location, courier operations, weather, or
              other circumstances beyond our control.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-4 text-xl font-medium text-black">
              Questions About Your Order?
            </h2>

            <p>
              If you have any questions about your order or delivery, please
              contact our customer care team. We will be happy to assist you
              with your order and provide any available delivery information.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
