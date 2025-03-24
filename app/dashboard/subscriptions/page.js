"use client";
import PricingCard from "@/components/PricingCard";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@/context/UserContext";

const pricingCards = [
    {
        id: "price_1R4PjxPFeWozK4w0xh6lAuic",
        title: "Pro",
        description: "For the casual user",
        price: "228",
        features: [
            { id: 1, feature: "1000 credits" },
           
        ],
        type: "Yearly",
    },
    {
        id: "price_1R4PnmPFeWozK4w0RDKavyji",
        title: "Premium",
        description: "For the power user",
        price: "19.99",
        features: [
            { id: 1, feature: "50 images per day" },
            
        ],
        type: "Monthly",
    },
    // {
    //     id: "price_1R4YtKPFeWozK4w0eJBpOoZz",
    //     title: "Enterprise",
    //     description: "For the enterprise user",
    //     price: "39.91",
    //     features: [
    //         { id: 1, feature: "1000 credits" },
    //         { id: 2, feature: "1000 credits" },
    //         { id: 3, feature: "1000 credits" },
    //         { id: 4, feature: "1000 credits" },
    //         { id: 5, feature: "1000 credits" },
    //     ],
    //     type: "Monthly",
    // }
];

const Subscription = () => {
    const [activeTab, setActiveTab] = useState("Monthly");
    const [activeCard, setActiveCard] = useState(null);
    const [currentPackage, setCurrentPackage] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;
        console.log("user in subscription",user);

        const fetchCurrentPackage = async () => {
            try {
                const res = await axios.get(`/api/packages/${user.userId || user._id}`);
                if (!res.data) {
                    setCurrentPackage("Basic"); // Default to Basic if no package is found
                    return;
                }

                setCurrentPackage(res.data.name); // Set the current package name
            } catch (error) {
                console.error("Error fetching current package:", error);
                setCurrentPackage("Basic"); // Fallback to Basic if there's an error
            }
        };

        fetchCurrentPackage();
    }, [user]);

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-[1200px] mx-auto py-[60px] px-4">
            <div className="flex items-center gap-4 bg-[#217DFE08] backdrop-blur-[70px] p-2 rounded-full w-fit mx-auto">
                <p
                    className={`text-lg font-normal px-4 py-2 cursor-pointer rounded-full transition-all ${
                        activeTab === "Monthly" ? "bg-[#217DFE21] border border-[#217DFE] text-white" : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("Monthly")}
                >
                    Monthly
                </p>

                <p
                    className={`text-lg font-normal px-4 py-2 cursor-pointer rounded-full transition-all ${
                        activeTab === "Yearly" ? "bg-[#217DFE21] border border-[#217DFE] text-white" : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("Yearly")}
                >
                    Yearly
                </p>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {pricingCards
                    .filter((card) => card.type === activeTab)
                    .map((card) => (
                        <PricingCard
                            key={card.id}
                            card={card}
                            active={card.id === activeCard}
                            onClick={() => setActiveCard(card.id)}
                            currentPlan={card.title === currentPackage} // Set currentPlan dynamically
                        />
                    ))}
            </div>
        </div>
    );
};

export default Subscription;