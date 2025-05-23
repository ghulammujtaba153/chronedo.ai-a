import { savePackage, sendEmail } from "@/lib/savePackage";
import { Readable } from "stream";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

export const config = {
    api: {
        bodyParser: false, // ✅ Stripe requires raw body
    },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export async function POST(req) {
    const sig = req.headers.get("stripe-signature");

    let event;
    try {
        const buf = await buffer(req.body);
        event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle checkout session completion
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const packageDetails = session.metadata;

        if (packageDetails) {
            await savePackage({
                UserId: packageDetails.UserId,
                name: packageDetails.name,
                price: packageDetails.price,
                images: JSON.parse(packageDetails.images), // ✅ Correctly parsing images data
            });

            await sendEmail(
                session.customer_details.email, // Use the email from checkout
                session.metadata.name,
                session.metadata.price
              );
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}
