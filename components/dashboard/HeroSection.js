import React, { useState, useEffect } from "react";
import { CloudUpload, DownloadIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import { useImage } from "@/context/ImageContext";
import Notification from "../Notification";
import { useImageCount } from "@/context/ImageCountContext";
import { usePackage } from "@/context/PackageContext";
import { motion } from "framer-motion";

const prompts = [
  {
    name: "Minimalistic White",
    prompt: "Set against a minimalistic light background, giving it a clean and professional aesthetic with white art curved objects (like artificial waves) in the background",
  },
  {
    name: "Marble Luxury",
    prompt: "marble",
  },
  {
    name: "Prestige",
    prompt: "Set against a luxury background. The scene exudes luxury with subtle black, gold or platinum accents, soft diffused lighting, and a hint of reflective surfaces, enhancing the sophisticated atmosphere.",
  },
  {
    name: "Future Studio",
    prompt: "Set against a sleek, futuristic technical photoroom background.",
  },
  {
    name: "Colorful Art",
    prompt: "A completely random and unexpected scene, combining diverse artistic elements in a unique and imaginative way. The composition features a mix of abstract, surreal, futuristic, and organic forms, with an unpredictable color palette and dynamic lighting.",
  },
  {
    name: "Splash",
    prompt: "water pool splash / watch in the pool.",
  },
  {
    name: "Random",
    prompt: "coffee beans and wood, luxury lifestyle, blurry rainy day, blurry night, blurry luxury, winter luxury snow background, summer luxury beach blurry background, spring luxury flowers blurry background, artistic luxury flowers background, 1001 night, magic",
  },
  {
    name: "Custom",
    prompt: "",
  }
];

const HeroSection = () => {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const { user } = useUser();
  const { resultImage, setResultImage } = useImage(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [randomPrompt, setRandomPrompt] = useState("");
  const { imageCount, setImageCount } = useImageCount();
  const { savePackage } = usePackage();

  const handlePromptClick = (prompt) => {
    if (prompt.name === "Random") {
      // Automatically select a random option
      const options = prompt.prompt.split(", ");
      const randomIndex = Math.floor(Math.random() * options.length);
      setRandomPrompt(options[randomIndex]);
      setSelectedPrompt({
        name: `Random: ${options[randomIndex]}`,
        prompt: options[randomIndex]
      });
    } else {
      setSelectedPrompt(prompt);
      setRandomPrompt("");
    }
  };

  const handleCustomPromptChange = (e) => {
    setCustomPrompt(e.target.value);
  };

  const handleFileChange = async (e) => {
    setImage(null);
    setFile(null);
    setResultImage(null);
    setSelectedPrompt(null);
    setCustomPrompt("");
    setRandomPrompt("");
    const selectedFile = e.target.files[0];

    setError(null);

    if (!selectedFile) return;

    const userId = user?.userId || user._id;
    const availableCount = imageCount;

    if (availableCount <= 0) {
      setError("You've reached your image limit.");
      return;
    }

    setImage(URL.createObjectURL(selectedFile));
    setFile(selectedFile);
  };


  const uploadToLightX = async (file) => {
    setIsError(false);
    setError("");
    setResultImage(null);
    if (!randomPrompt && !customPrompt && !selectedPrompt) {
      console.log("no prompt selected");
      setIsError(true);
      setError("Please select a prompt");
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
      setError(
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
          let currentCount = parseInt(localStorage.getItem("count")) || 0;
          localStorage.setItem("count", currentCount - 1);
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
        // let currentCount = parseInt(localStorage.getItem("count")) || 0;
        // localStorage.setItem("count", currentCount - 1);
        // throw new Error(data.message || "Failed to generate background.");
        setError("Failed to generate background. Please try again.");
        return;
      }
    } catch (error) {
      console.error("Error generating background:", error);
      localStorage.setItem("count", currentCount - 1);
      setError("Failed to generate background. Please try again.");
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
          if(user){
              const updateRes = await axios.post("/api/packages/update-count", {
                userId: user.userId || user._id,
                count: -1,
              });
              setImageCount(imageCount- 1);
            
            handleDBImage(data.output);
          }
          
          return;
        } else if (data.status === "failed") {
          throw new Error("Background generation failed.");
        }
      } catch (error) {
        console.error("Error fetching result:", error);
        setError("Error fetching result:", error);
        return;
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

  const handleDBImage = async (output) => {
    try {
      console.log(user);
      setSavingImage(true);
      const res = await axios.post("/api/image", {
        userId: user?.userId || user?._id,
        imageUrl: output,
      });
      console.log("Image saved:", res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setSavingImage(false);
    }
  };



  return (
    <div className="flex flex-col md:flex-row justify-between bg-[#217DFE0F] p-6 gap-4 rounded-xl border border-[#0093E87D]">
      {error && (
        <Notification
          isOpen={true}
          onClose={() => setError("")}
          title="Error"
          message={error}
          type="error"
        />
      )}
      
      {/* Left Section */}
      <div className="flex flex-col w-full md:w-1/2 space-y-4 leading-wide">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white">
          Transform Your Watch <br /> Photos with
          <span className="bg-gradient-to-r from-[#21ABFD] to-[#0055DE] bg-clip-text text-transparent font-bold">
            Chronedo.AI
          </span>
        </h1>
        <p className="text-gray-500">
          Upload a watch photo & get a stunning <br /> background in seconds!
        </p>

        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              aria-label="Upload a watch photo"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white px-4 py-2 rounded-full flex items-center gap-2"
            >
              Upload
              <UploadIcon className="w-4 h-4" />
            </label>
          </div>
          <Link href="/login">Upgrade Pro</Link>
        </div>

        {/* Prompt Tabs - Only shown after image upload */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <h3 className="text-white mb-2">Select a style:</h3>
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                    selectedPrompt?.name.startsWith(prompt.name)
                      ? "bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  {prompt.name}
                </motion.button>
              ))}
            </div>

            {/* Custom Prompt Input (shown when Custom is selected) */}
            {selectedPrompt?.name === "Custom" && (
              <div className="mt-4">
                <textarea
                  value={customPrompt}
                  onChange={handleCustomPromptChange}
                  className="w-full p-3 border border-[#0093E8] bg-[#0D0B13] text-white rounded-md focus:ring-2 focus:ring-[#21ACFD]"
                  placeholder="Describe your custom background..."
                  rows={3}
                />
                <button
                  onClick={() => {
                    if (customPrompt.trim()) {
                      setSelectedPrompt({
                        name: "Custom",
                        prompt: customPrompt
                      });
                    }
                  }}
                  className="mt-2 bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white px-4 py-2 rounded-md"
                >
                  Apply Custom Prompt
                </button>
              </div>
            )}

            {/* Selected Prompt Display */}
            {/* {selectedPrompt && (
              <div className="mt-4 p-3 bg-gray-800 rounded-md">
                <p className="text-white">
                  <span className="text-gray-400">Selected style:</span> {selectedPrompt.name}
                </p>
                {selectedPrompt.name.startsWith("Random: ") && (
                  <p className="text-gray-300 text-sm mt-1">
                    Randomly selected: {selectedPrompt.prompt}
                  </p>
                )}
              </div>
            )} */}

            {/* Terms Checkbox and Apply Button */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 border bg-[#0B1018] border-[#0093E840] rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  className="w-4 h-4 border-2 border-[#0093E8] rounded-md bg-transparent checked:bg-[#0093E8] checked:border-[#0093E8] focus:outline-none cursor-pointer"
                />
                <label htmlFor="terms-checkbox" className="text-sm text-gray-300 cursor-pointer">
                  I agree with the <Link href="/privacy" className="text-[#21ACFD] hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <motion.button
                onClick={() => uploadToLightX(file)}
                disabled={isLoading || !selectedPrompt}
                className="bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white px-12 py-3 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Apply Style"
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Status Messages */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {isLoading && (
          <p className="text-blue-500 text-sm">
            Processing… your image will be ready in a few seconds.
          </p>
        )}
        {savingImage && <p className="text-blue-500 text-sm">Saving image...</p>}
      </div>

      {/* Right Section - Image Preview */}
      <div className="flex flex-col max-h-[300px] h-auto px-10 w-full md:w-1/2 overflow-hidden">
        {resultImage ? (
          <div className="flex flex-col items-center h-full">
            <img
              src={resultImage}
              alt="Generated background"
              className="w-full h-full object-contain border border-[#2174FE]/10"
            />
            <button
              onClick={handleDownload}
              className="mt-4 text-white cursor-pointer bg-gradient-to-r from-[#21ABFD] to-[#0055DE] px-4 py-2 rounded-full flex items-center gap-2"
            >
              Download
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
        ) : file ? (
          <img
            src={image}
            alt="Uploaded watch"
            className="w-full h-full object-contain rounded-md border border-[#2174FE]/10"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <img src="/watch2.png" alt="" className="w-full h-full rounded-xl object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;