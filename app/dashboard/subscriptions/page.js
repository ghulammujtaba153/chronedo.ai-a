"use client"
import PricingCard from "@/components/PricingCard";
import React, { useState } from "react";


const activeCardId=1;

const pricingCards = [
    {
        id: 1,
        title: "Basic",
        description: "For the casual user",
        price: "Free",
        features: [
            {id: 1, feature: "1000 credits"},
            {id: 2, feature: "1000 credits"},
            {id: 3, feature: "1000 credits"},
            {id: 4, feature: "1000 credits"},
            {id: 5, feature: "1000 credits"},
        ],
        link: "/",
        type: "Monthly",
    },
    {
        id: 2,
        title: "Pro",
        description: "For the power user",
        price: "$10",
        features: [
            {id: 1, feature: "1000 credits"},
            {id: 2, feature: "1000 credits"},
            {id: 3, feature: "1000 credits"},
            {id: 4, feature: "1000 credits"},
            {id: 5, feature: "1000 credits"},
        ],
        link: "/",
        type: "Monthly",
    },
    {
        id: 3,
        title: "Enterprise",
        description: "For the enterprise user",
        price: "$10",
        features: [
            {id: 1, feature: "1000 credits"},
            {id: 2, feature: "1000 credits"},
            {id: 3, feature: "1000 credits"},
            {id: 4, feature: "1000 credits"},
            {id: 5, feature: "1000 credits"},
        ],
        link: "/",
        type: "Monthly",
    },
    {
        id: 4,
        title: "Enterprise",
        description: "For the enterprise user",
        price: "$10",
        features: [
            {id: 1, feature: "1000 credits"},
            {id: 2, feature: "1000 credits"},
            {id: 3, feature: "1000 credits"},
            {id: 4, feature: "1000 credits"},
            {id: 5, feature: "1000 credits"},
        ],
        link: "/",
        type: "Yearly",
    },
];

const Subscription = () => {
    const [activeTab, setActiveTab] = useState("Monthly");
    const [activeCard, setActiveCard] = useState(2); // Pro plan has id: 2


    return <div className="flex flex-col items-center gap-4 w-full max-w-[1200px] mx-auto py-[60px] px-4">

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

        {/* pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {pricingCards
                .filter((card) => card.type === activeTab)
                .map((card) => (
                    <PricingCard 
                        key={card.id} 
                        card={card} 
                        active={card.id === activeCard}
                        onClick={() => setActiveCard(card.id)}
                        currentPlan={card.id === 1}
                    
                    />
                ))
            }
        </div>
    </div>;
};

export default Subscription;
