import Stripe from 'stripe';
import { savePackage } from '@/context/PackageContext';  // Replace with your actual import

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const packageDetails = session.metadata;

        await savePackage({
            UserId: packageDetails.UserId,
            name: packageDetails.name,
            price: packageDetails.price,
            images: packageDetails.images
        });
    }

    res.status(200).json({ received: true });
}
