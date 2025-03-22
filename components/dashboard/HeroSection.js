import React, { useState } from "react";
import { CloudUpload, DownloadIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import { useImage } from "@/context/ImageContext"; // Import useImage

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
];

const HeroSection = () => {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const { user } = useUser();
  const { resultImage, setResultImage } = useImage(); // Use resultImage and setResultImage from ImageContext
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [randomSubmenuOpen, setRandomSubmenuOpen] = useState(false);

  const handlePromptClick = (prompt) => {
    if (prompt.name === "Random") {
      setRandomSubmenuOpen(!randomSubmenuOpen);
    } else {
      setSelectedPrompt({ name: prompt.name, prompt: prompt.prompt });
      setIsOpen(false); // Close dropdown after selection
    }
    console.log(prompt);
  };

  const handleRandomOptionClick = (option) => {
    setSelectedPrompt({ name: option, prompt: option }); // Set the selected random option
    setIsOpen(false); // Close dropdown after selection
  };

  const handleCustomPromptChange = (e) => {
    setCustomPrompt(e.target.value);
  };

  const handleApplyCustomPrompt = () => {
    if (customPrompt.trim()) {
      setSelectedPrompt({ name: customPrompt, prompt: customPrompt }); // Set the custom prompt
      setIsOpen(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    setError(null);

    if (!selectedFile) return;
    if (selectedPrompt === null) {
      setError("Please select a prompt.");
      return;
    }
    setFile(selectedFile);

    setImage(URL.createObjectURL(selectedFile));

    const userType = localStorage.getItem("type") || "visitor";
    const maxLimit = userType === "visitor" ? 3 : 5;

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Retrieve the stored date and count from localStorage
    const storedDate = localStorage.getItem("date");
    let currentCount = parseInt(localStorage.getItem("count")) || 0;

    console.log("local storage count", localStorage.getItem("count"));

    console.log(storedDate);
    console.log(currentDate);


    // Reset the count if the date has changed
    if (storedDate !== currentDate) {
      currentCount = 0; // Reset count for the new day
      localStorage.setItem("date", currentDate); // Update the stored date
    }

    if (currentCount < maxLimit) {
      localStorage.setItem("count", currentCount + 1);
      await uploadToLightX(selectedFile);
      handleTest(selectedFile);
      console.log("local storage count", localStorage.getItem("count"));
    } else {
      const errorMessage =
        userType === "visitor"
          ? "You have reached the maximum limit of 3 images. Please login to continue."
          : "You have reached the maximum limit of 5 images. Please upgrade to PRO to continue.";
      setError(errorMessage);
      console.log("local storage count", localStorage.getItem("count"));
    }
  };

  const handleTest = (file) => {
    console.log("test");
    console.log("files", file);
    console.log("prompts", selectedPrompt.prompt);
  };

  const uploadToLightX = async (file) => {
    setIsLoading(true);
    setIsError(false);

    try {
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

        const putResponse = await fetch(uploadImage, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!putResponse.ok) {
          throw new Error(
            `Failed to upload image. Status: ${putResponse.status}`
          );
        }

        console.log("Image uploaded successfully:", putResponse.status);
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

      if (!selectedPrompt.prompt) {
        setError("Please select a prompt.");
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl, prompt: selectedPrompt.prompt }),
      });

      const data = await response.json();
      console.log("Response from AI background generation:", data);

      if (response.ok) {
        const { orderId } = data;
        await pollForResult(orderId);
      } else {
        throw new Error(data.message || "Failed to generate background.");
      }
    } catch (error) {
      console.error("Error generating background:", error);
      setIsError(true);
    }
  };

  const pollForResult = async (orderId) => {
    const pollInterval = 3000;
    const maxAttempts = 5;

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
          console.log("Setting resultImage:", data.output); // Debugging
          setResultImage(data.output); // Update resultImage in ImageContext
          handleDBImage(data.output);
          return;
        } else if (data.status === "failed") {
          throw new Error("Background generation failed.");
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    setIsError(true);
    setError("Background generation took too long. Please try again.");
  };

  const handleDBImage = async (output) => {
    try {
      console.log(user);
      setSavingImage(true);
      const res = await axios.post("/api/image", {
        userId: user.userId,
        imageUrl: output,
      });
      console.log("Image saved:", res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setSavingImage(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) {
      console.error("No image to download.");
      return;
    }
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "downloaded_image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between bg-[#217DFE0F] p-6 gap-4 rounded-xl border border-[#0093E87D]">
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

        {/* dop down */}
        <div className="relative max-w-[300px]">
          {/* Dropdown Button */}
          <button
            className="w-full p-2 rounded-md border cursor-pointer border-[#2174FE]/10 text-left flex items-center justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>
              {selectedPrompt ? selectedPrompt.name : "Select an option"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute mt-1 w-full bg-[#0c2f60] text-white border border-[#21ABFD] rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {/* Regular Prompts */}
              {prompts.map((prompt, index) => (
                <div key={index}>
                  <div
                    className="p-2 hover:bg-[#21ABFD] cursor-pointer"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt.name}
                  </div>

                  {/* Random Submenu */}
                  {prompt.name === "Random" && randomSubmenuOpen && (
                    <div className="pl-4">
                      {prompt.prompt.split(", ").map((option, idx) => (
                        <div
                          key={idx}
                          className="p-2 hover:bg-[#21ABFD] cursor-pointer"
                          onClick={() => handleRandomOptionClick(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Custom Prompt Input Field */}
              <div className="p-2 border-t border-gray-200">
                <input
                  type="text"
                  placeholder="Enter custom prompt"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#21ABFD]"
                  value={customPrompt}
                  onChange={handleCustomPromptChange}
                />
                <button
                  className="w-full mt-2 p-2 cursor-pointer bg-[#2174FE] text-white rounded-md hover:bg-[#1a5bbf]"
                  onClick={handleApplyCustomPrompt}
                >
                  Apply Custom Prompt
                </button>
              </div>
            </div>
          )}
        </div>

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

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {isLoading && (
          <p className="text-blue-500 text-sm">Processing image...</p>
        )}
        {savingImage && (
          <p className="text-blue-500 text-sm"> Saving image...</p>
        )}
      </div>

      {/* Right Section */}
      <div className="flex flex-col max-h-[300px] h-auto px-10 w-full md:w-1/2 overflow-hidden">
        {resultImage ? (
          <div className="flex flex-col items-center  h-full">
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
            <CloudUpload className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
