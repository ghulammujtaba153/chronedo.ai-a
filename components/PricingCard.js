import React from "react";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const PricingCard = ({ card, active, onClick, currentPlan=false }) => {
    return (
        <div 
            onClick={onClick}
            className={`flex flex-col gap-4 border ${
                active 
                    ? "border-[#21ADFD] shadow-lg shadow-[##21ADFD]/20" 
                    : "border-[#0093E87D]"
            } bg-[#217DFE08] backdrop-blur-[70px] rounded-[20px] p-4 transition-all duration-300 cursor-pointer hover:scale-[1.02]`}
        >
            <div className="flex flex-col gap-2">
                <h1 className={`${active ? "text-[#21ACFD]" : "text-white"} text-2xl font-bold transition-colors`}>{card.title}</h1>
                <p className="text-gray-400 text-sm">{card.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
                <p className="text-white text-4xl font-bold">{card.price == 0 ? "Free" : `$${card.price}`}</p>
                <p className="text-gray-400 text-sm">\ Per {card.type}</p>
            </div>
            <div className="flex flex-col py-2 gap-2">
                <p className="text-white text-sm">Features</p>
                <div className="w-full h-[1px] bg-gray-700"></div>
            </div>
            <ul className="list-disc list-inside text-gray-400 text-lg">
                {card.features.map((feature) => (
                    <li key={feature.id} className="flex items-center gap-2">
                        <CheckCircleIcon className={`w-4 h-4 ${active ? "text-[#21ACFD]" : "text-gray-400"}`} />
                        {feature.feature}
                    </li>
                ))}
            </ul>
            <Link 
                href={card.link} 
                className={`text-white text-lg font-semibold my-4 border ${
                    currentPlan 
                        ? "bg-gradient-to-r from-[#21ACFD] to-[#2174FE] border-transparent" 
                        : "border-gray-700 bg-[#217DFE08]"
                } backdrop-blur-[70px] rounded-lg items-center justify-center flex gap-2 p-2 transition-all hover:bg-gradient-to-r hover:from-[#21ACFD] hover:to-[#2174FE] hover:border-transparent`}
            >
                {
                    currentPlan? "Current plan" : "Get Started"
                }
                
            </Link>
        </div>
    );
};

export default PricingCard;
