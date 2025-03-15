import React, { useState } from 'react';
import { CloudUpload, UploadIcon, RotateCcw } from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [uploadData, setUploadData] = useState(null);

    const handleReset = () => {
        setFile(null);
        setError("");
        setIsLoading(false);
        setResultImage(null);
        setUploadData(null);
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        const userType = localStorage.getItem("type") || "visitor"; // Default to 'visitor' if no type is found
        const maxLimit = userType === "visitor" ? 3 : 5; // 3 free images without registration, 5 per day with registration

        let currentCount = parseInt(localStorage.getItem("count")) || 0;
        let remainingCount = Math.max(0, maxLimit - currentCount);

        if (currentCount < maxLimit) {
            localStorage.setItem("count", currentCount + 1);
            remainingCount -= 1;
            console.log("local storage count", localStorage.getItem("count"));
            console.log("remaining count", remainingCount);
            
            setFile(URL.createObjectURL(selectedFile));
            await uploadToLightX(selectedFile); // Trigger the upload
        }
        else {
            const errorMessage = userType === "visitor"
                ? `You have used all your 3 free images. Please register to get 5 images per day.`
                : `You have used all your 5 daily images. Please upgrade to PRO for unlimited images.`;

            setError(errorMessage);
            console.log("local storage count", localStorage.getItem("count"));
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setFile(URL.createObjectURL(file));
            await uploadToLightX(file); // Trigger the upload
        }
    };

    const uploadToLightX = async (file) => {
        setIsLoading(true);
        setError("");

        try {
            // Step 1: Generate the upload URL
            const requestBody = {
                uploadType: "imageUrl",
                size: file.size,
                contentType: file.type,
            };

            const uploadResponse = await fetch(
                "https://api.lightxeditor.com/external/api/v2/uploadImageUrl",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": process.env.NEXT_PUBLIC_LIGHTX_API_KEY,
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const uploadData = await uploadResponse.json();
            console.log("Upload response:", uploadData);

            if (uploadData.statusCode === 2000) {
                const { uploadImage, imageUrl } = uploadData.body;
                setUploadData(uploadData);

                // Step 2: Upload the image using the generated uploadImage URL
                const putResponse = await fetch(uploadImage, {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type,
                    },
                    body: file, // Directly use the file object
                });

                if (!putResponse.ok) {
                    throw new Error(
                        `Failed to upload image. Status: ${putResponse.status}`
                    );
                }

                console.log("Image uploaded successfully:", putResponse.status);

                // Step 3: Remove the background
                await generateAIBackground(imageUrl); // Call the removeBackground function
            } else {
                throw new Error("Failed to generate upload URL.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            setError("Failed to upload image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateAIBackground = async (imageUrl) => {
        try {
            console.log("Making request to generate AI background...");

            // Call the Next.js API route
            const response = await fetch("/api/ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl }),
            });

            const data = await response.json();
            console.log("Response from AI background generation:", data);

            if (response.ok) {
                const { orderId } = data;
                await pollForResult(orderId); // Poll for the result
            } else {
                throw new Error(data.message || "Failed to generate background.");
            }
        } catch (error) {
            console.error("Error generating background:", error);
            setError("Error generating background. Please try again.");
        }
    };

    const pollForResult = async (orderId) => {
        const pollInterval = 3000; // Poll every 3 seconds
        const maxAttempts = 5; // Maximum number of retries

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await fetch("/api/ai/poll", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ orderId }),
                });

                const data = await response.json();
                console.log("Polling response:", data);

                if (data.status === "active") {
                    setResultImage(data.output); // Set the result image URL
                    return;
                } else if (data.status === "failed") {
                    throw new Error("Background generation failed.");
                }
            } catch (error) {
                console.error("Error fetching result:", error);
            }

            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        setError("Failed to generate background. Please try again."); // Show error if max attempts exceeded
    };

    return (
        <div className="flex flex-col md:flex-row justify-between bg-[#217DFE0F] p-6 rounded-xl border border-[#0093E87D]"
             onDrop={handleDrop}
             onDragOver={(e) => e.preventDefault()}>
            {/* Left Section */}
            <div className='flex flex-col w-full md:w-1/2 space-y-4 leading-wide'>
                <h1 className='text-xl sm:text-2xl md:text-4xl font-bold text-white'>
                    Transform Your Watch <br /> Photos with
                    <span className="bg-gradient-to-r from-[#21ABFD] to-[#0055DE] bg-clip-text text-transparent font-bold">
                        Chronedo.AI
                    </span>
                </h1>
                <p className='text-gray-500'>
                    Upload a watch photo & get a stunning <br /> background in seconds!
                </p>

                <select
                    className='max-w-[300px] p-2 rounded-md border border-[#2174FE]/10'
                    aria-label="Select an option"
                >
                    <option value="1" className='text-gray-500 bg-transparent'>Create a stunning background</option>
                    <option value="2" className='text-gray-500 bg-transparent'>Create a stunning background</option>
                    <option value="3" className='text-gray-500 bg-transparent'>Create a stunning background</option>
                </select>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type='file'
                            id='file-upload'
                            className='hidden'
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .png"
                            aria-label="Upload a watch photo"
                        />

                        <label
                            htmlFor="file-upload"
                            className='cursor-pointer bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white px-4 py-2 rounded-full flex items-center gap-2'
                        >
                            Upload
                            <UploadIcon className='w-4 h-4' />
                        </label>
                        
                        {(file || resultImage || error) && (
                            <button
                                onClick={handleReset}
                                className='cursor-pointer bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white px-4 py-2 rounded-full flex items-center gap-2'
                                aria-label="Reset"
                            >
                                Reset
                                <RotateCcw className='w-4 h-4' />
                            </button>
                        )}
                    </div>

                    <Link href="/login">
                        Upgrade Pro
                    </Link>
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {isLoading && <p className="text-blue-500 text-sm">Processing...</p>}
            </div>

            {/* Right Section */}
            <div className='flex flex-col max-h-[300px] h-auto px-10 w-full md:w-1/2 overflow-hidden'>
                {resultImage ? (
                    <div className="w-full h-full flex flex-col items-center">
                        <h3 className="text-white mb-2">Background Removed:</h3>
                        <div className="w-full h-[250px] overflow-hidden">
                            <img 
                                src={resultImage} 
                                alt="Background Removed" 
                                className='w-full h-full object-contain rounded-md border border-[#2174FE]/10' 
                            />
                        </div>
                    </div>
                ) : file ? (
                    <div className="w-full h-[280px] overflow-hidden">
                        <img 
                            src={file} 
                            alt="Uploaded watch" 
                            className='w-full h-full object-contain rounded-md border border-[#2174FE]/10' 
                        />
                    </div>
                ) : (
                    <div className='flex items-center justify-center w-full h-[280px] text-gray-400'>
                        <CloudUpload className='w-full h-full' />
                        <p className="text-gray-400 text-sm absolute">Drop your image here</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HeroSection;
