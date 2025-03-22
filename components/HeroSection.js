"use client";
import React, { useState } from "react";
import { ArrowUpCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const prompts = [
  {
    name: "Minimalistic White",
    prompt:
      "Set against a minimalistic light background, giving it a clean and professional aesthetic with white art curved objects (like artificial waves) in the background",
  },
  {
    name: "Marble Luxury",
    prompt: "marble",
  },
  {
    name: "Prestige",
    prompt:
      "Set against a luxury background. The scene exudes luxury with subtle black, gold or platinum accents, soft diffused lighting, and a hint of reflective surfaces, enhancing the sophisticated atmosphere.",
  },
  {
    name: "Future Studio",
    prompt: "Set against a sleek, futuristic technical photoroom background.",
  },
  {
    name: "Colorful Art",
    prompt:
      "A completely random and unexpected scene, combining diverse artistic elements in a unique and imaginative way. The composition features a mix of abstract, surreal, futuristic, and organic forms, with an unpredictable color palette and dynamic lighting.",
  },
  {
    name: "Splash",
    prompt: "water pool splash / watch in the pool.",
  },
  {
    name: "Random",
    prompt:
      "coffee beans and wood, luxury lifestyle, blurry rainy day, blurry night, blurry luxury, winter luxury snow background, summer luxury beach blurry background, spring luxury flowers blurry background, artistic luxury flowers background, 1001 night, magic",
  },
  {
    name: "Custom Style",
    prompt: "",
  },
];

const HeroSection = () => {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [uploadData, setUploadData] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [randomPrompt, setRandomPrompt] = useState("");

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    if (prompt.name === "Random") {
      setRandomPrompt(prompt.prompt);
      setCustomPrompt("");
    } else if (prompt.name === "Custom Style") {
      setRandomPrompt("");
      setCustomPrompt("");
    }
    setCustomPrompt("");
  };

  const handleRandomPromptChange = (e) => {
    setSelectedPrompt(e.target.value);
    setRandomPrompt(e.target.value);
    setCustomPrompt("");
  };

  const handleCustomPromptChange = (e) => {
    setCustomPrompt(e.target.value);
    // setSelectedPrompt(e.target.value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userType = localStorage.getItem("type") || "visitor"; // Default to 'visitor' if no type is found
    const maxLimit = userType === "visitor" ? 3 : 5;

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Retrieve the stored date and count from localStorage
    const storedDate = localStorage.getItem("date");
    let currentCount = parseInt(localStorage.getItem("count")) || 0;

    if (storedDate !== currentDate) {
      currentCount = 0; // Reset count for the new day

      localStorage.setItem("date", currentDate); // Update the stored date
    }

    if (currentCount < maxLimit) {
      localStorage.setItem("count", currentCount + 1);

      setImage(URL.createObjectURL(file));
      setFile(file);
      // await uploadToLightX(file); // Trigger the upload

      console.log("local storage count", localStorage.getItem("count"));
    } else {
      console.log("error in handleFileChange");
      const errorMessage =
        userType === "visitor"
          ? "You have reached the maximum limit of 3 images. Please login to continue."
          : "You have reached the maximum limit of 5 images. Please upgrade to PRO to continue.";

      setErrorMessage(errorMessage);
      console.log("local storage count", localStorage.getItem("count"));
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFile(file);
      setImage(URL.createObjectURL(file));
      // await uploadToLightX(file); // Trigger the upload
    }
  };

  const uploadToLightX = async (file) => {
    setIsError(false);
    setErrorMessage("");
    setResultImage(null);
    if (!randomPrompt && !customPrompt && !selectedPrompt) {
      console.log("no prompt selected");
      setIsError(true);
      setErrorMessage("Please select a prompt");
      return;
    }
    if (customPrompt) {
      console.log("custom prompt is not empty");
      setSelectedPrompt({ name: "Custom Style", prompt: customPrompt });
      console.log("Selected prompt set to custom prompt:", customPrompt);
    }

    const isTermsAccepted = document.querySelector(
      'input[type="checkbox"]'
    ).checked;
    if (!isTermsAccepted) {
      setErrorMessage(
        "Please agree to the terms and conditions before uploading."
      );
      return; // Exit the function if the checkbox is not checked
    }

    setIsLoading(true);

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
        await generateAIBackground(imageUrl); 
      } else {
        throw new Error("Failed to generate upload URL.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsError(true);
      setErrorMessage("Failed to upload image. Please try again.");
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
        body: JSON.stringify({
          imageUrl,
          prompt: customPrompt || selectedPrompt?.prompt || randomPrompt,
        }),
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
      setIsError(true);
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

    setIsError(true); // Show error if max attempts exceeded
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "result.png";
    link.click();
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center px-4 pb-[100px] pt-[200px]">
      {/* Blur Effect */}
      <div className="absolute top-0 left-0 w-full h-full z-20 flex justify-end items-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="w-[50%] h-full rounded-full bg-[#2176FE14] blur-[150px]"
        ></motion.div>
      </div>

      <div className="relative flex flex-col items-center justify-center max-w-[1200px] mx-auto">
        {/* Content Section */}
        <div className="flex flex-col items-center justify-center gap-1 text-white relative">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-[35px] md:text-[65px] font-semibold"
          >
            Transform Your Watch
          </motion.h1>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl sm:text-[35px] md:text-[65px] text-center font-semibold"
          >
            Photos with{" "}
            <span className="bg-gradient-to-r from-[#21ABFD] to-[#0055DE] bg-clip-text text-transparent font-bold">
              Chronedo.AI
            </span>
          </motion.h1>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-4 relative z-10"
        >
          Upload a watch photo & get a stunning <br /> background in seconds!
        </motion.p>

        {/* Image Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.7, 
            delay: 0.6,
            type: "spring", 
            stiffness: 120 
          }}
          className="flex flex-col items-center justify-center mt-4 px-4 py-4 border-2 border-[#0093E8] bg-[#0D0B13] rounded-[40px] w-full max-w-[400px] min-h-[170px] relative z-10"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <motion.label
            htmlFor="file-upload"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 sm:text-lg text-sm text-white px-6 py-3 bg-gradient-to-r from-[#21ACFD] to-[#2174FE] rounded-full cursor-pointer transition-all hover:opacity-90"
          >
            Upload Image
            <motion.div
              animate={{ 
                y: [0, -4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <ArrowUpCircleIcon className="w-5 h-5" />
            </motion.div>
          </motion.label>

          <p className="text-gray-400 text-sm sm:text-base mt-4">
            or drop a file
          </p>

          {image && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-4 w-full flex justify-center"
            >
              <img
                src={image}
                alt="Uploaded Preview"
                className="max-w-full max-h-60 rounded-md shadow-lg"
              />
            </motion.div>
          )}

          {uploadData && (
            <div className="mt-4 w-full flex justify-center">
              <img
                src={uploadData.body.imageUrl}
                alt="Uploaded Preview"
                className="max-w-full max-h-60 rounded-md shadow-lg"
              />
            </div>
          )}

          {/* Result Section */}
          {isLoading && <p className="text-blue-500 mt-4">Processing...</p>}
          {isError && (
            <p className="text-red-500 mt-4">
              Error processing image. Try again.
            </p>
          )}
          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

          {resultImage && (
            <div className="mt-4 w-full flex flex-col items-center">
              <h3 className="text-white mb-2">AI Image Result</h3>
              <img
                src={resultImage}
                alt="Background Removed"
                className="max-w-full max-h-60 rounded-md shadow-lg"
              />
              <button
                onClick={handleDownload}
                className="px-4 py-2 mt-4 bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white rounded-full"
              >
                Download
              </button>
            </div>
          )}
        </motion.div>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full max-w-md mx-auto"
          >
            {/* Terms and Conditions Checkbox - Enhanced */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-6 flex items-center justify-center gap-3 bg-[#217DFE08] border border-[#0093E840] rounded-xl px-4 py-3 w-full"
            >
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <input 
                  type="checkbox" 
                  id="terms-checkbox" 
                  className="appearance-none w-5 h-5 border-2 border-[#0093E8] rounded-md bg-[#0D0B1380] checked:bg-gradient-to-r checked:from-[#21ACFD] checked:to-[#2174FE] checked:border-transparent focus:outline-none cursor-pointer"
                />
                {/* Checkmark icon that appears when checked */}
                <svg 
                  className="absolute top-0 left-0 w-5 h-5 pointer-events-none text-white opacity-0 peer-checked:opacity-100"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 12 10 16 18 8"></polyline>
                </svg>
              </motion.div>
              <motion.label 
                htmlFor="terms-checkbox"
                className="text-sm sm:text-base text-gray-300 cursor-pointer"
                whileHover={{ color: "#fff" }}
              >
                I agree with the <span className="text-[#21ACFD] hover:underline">terms and conditions</span>
              </motion.label>
            </motion.div>

            {/* prompt tabs */}
            <div className="flex justify-center flex-wrap gap-2 mt-6 w-full">
              {prompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.1 * index 
                  }}
                  className={`px-4 py-2 mx-2 rounded-md cursor-pointer hover:bg-gradient-to-r from-[#21ABFD] to-[#0055DE] hover:text-white ${
                    selectedPrompt === prompt
                      ? "bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  {prompt.name}
                </motion.button>
              ))}
            </div>

            {/* Conditional Rendering */}
            {selectedPrompt && selectedPrompt.name === "Random" && (
              <div className="mt-4 w-full max-w-md">
                <select
                  value={randomPrompt}
                  onChange={handleRandomPromptChange}
                  className="w-full p-2 border border-[#0093E8] bg-[#0D0B13] text-white rounded-md focus:ring-2 focus:ring-[#21ACFD]"
                >
                  {selectedPrompt.prompt.split(", ").map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedPrompt && selectedPrompt.name === "Custom Style" && (
              <div className="mt-4 w-full max-w-md">
                <textarea
                  value={customPrompt}
                  onChange={handleCustomPromptChange}
                  className="w-full p-3 border border-[#0093E8] bg-[#0D0B13] text-white rounded-md focus:ring-2 focus:ring-[#21ACFD] placeholder-gray-500"
                  placeholder="Enter your custom prompt"
                  rows={3}
                />
              </div>
            )}

            {/* Enhanced Apply Style Button */}
            <motion.button
              onClick={() => uploadToLightX(file)}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white px-12 py-4 rounded-full mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(33, 171, 253, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#21ABFD] to-[#0055DE] opacity-0 group-hover:opacity-100"
                animate={{
                  background: [
                    "linear-gradient(90deg, #21ABFD 0%, #0055DE 100%)",
                    "linear-gradient(90deg, #0055DE 0%, #21ABFD 100%)",
                    "linear-gradient(90deg, #21ABFD 0%, #0055DE 100%)",
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              {/* Text and loading spinner */}
              <span className="relative z-10 font-medium flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Apply Style"
                )}
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
