"use client";
import React, { useState } from "react";

const HeroSection = () => {
    return (
        <div className="relative w-full flex flex-col items-center justify-center px-4 pb-[100px] pt-[200px]">
            {/* Layer Image - Positioned Below Content */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/layer.png"
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                />
            </div>
            {/* Blur Effect */}
            <div className="absolute top-0 left-0 w-full h-full z-10 flex justify-end items-center pointer-events-none">
                <div
                    className="w-[500px] h-[400px] rounded-full bg-[#2176FE14] blur-[150px]"
                ></div>
            </div>

            <div className="relative flex flex-col items-center justify-center max-w-[1200px] mx-auto">
                {/* Content Section */}
                <div className="flex flex-col items-center justify-center gap-1 text-white relative">
                    <h1 className="text-2xl sm:text-[35px] md:text-[65px] font-semibold">Pricing</h1>
                    <h1 className="text-2xl sm:text-[35px] md:text-[65px] font-semibold"> <span className="bg-gradient-to-r from-[#21ABFD] to-[#0055DE] bg-clip-text text-transparent font-bold">Chronedo.AI</span>
                    </h1>

                </div>

                <p className="text-center mt-4 relative z-10">
                    Upload a watch photo & get a stunning  <br /> background in seconds!
                </p>
            </div>
        </div>
    );
};

export default HeroSection;
