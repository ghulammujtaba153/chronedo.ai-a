// // app/api/create-checkout-session/route.js
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(request) {
//   try {
//     const { priceId } = await request.json();

//     // Create a Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price: priceId, // Price ID from Stripe Dashboard
//           quantity: 1,
//         },
//       ],
//       mode: "payment", // or "subscription" for every month payments
//       success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${request.headers.get("origin")}/cancel`,
//       metadata: packageDetails,  // Attach package details as metadata
//     });

//     return new Response(JSON.stringify({ id: session.id }), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     console.error("Error creating checkout session:", error);
//     return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
//       status: 500,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   }
// }

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { priceId, customer_email, packageDetails } = await request.json();  // ✅ Extract packageDetails here

    // Ensure metadata values are strings
    const metadata = {
      UserId: packageDetails.UserId.toString(),
      name: packageDetails.name,
      price: packageDetails.price.toString(),
      images: JSON.stringify(packageDetails.images),  // ✅ Metadata values must be strings
    };

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // Price ID from Stripe Dashboard
          quantity: 1,
        },
      ],
      mode: "payment", // or "subscription" for recurring payments
      success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
      metadata,  // ✅ Correctly passed metadata

      billing_address_collection: 'auto', // Collect billing address
      customer_email,
    });

    return new Response(JSON.stringify({ id: session.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
