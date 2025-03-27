import { savePackage } from "@/lib/savePackage";
import { buffer } from "micro"; 
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

// Disable bodyParser for raw body (required by Stripe)
export const config = {
    api: {
        bodyParser: false,
    },
};

// Correct Next.js 15 syntax
export async function POST(req) {
    const sig = req.headers.get("stripe-signature");

    let event;
    try {
        const buf = await buffer(req.body);  // Correctly access the body
        event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const packageDetails = session.metadata;

        if (packageDetails) {
            try {
                await savePackage({
                    UserId: packageDetails.UserId,
                    name: packageDetails.name,
                    price: packageDetails.price,
                    images: JSON.parse(packageDetails.images),
                });
            } catch (error) {
                console.error("Failed to save package:", error);
                return new Response("Failed to save package", { status: 500 });
            }
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}
