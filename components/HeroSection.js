"use client";
import React, { useState } from "react";
import { ArrowUpCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const HeroSection = () => {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [uploadData, setUploadData] = useState(null);

  const handleReset = () => {
    setImage(null);
    setIsLoading(false);
    setIsError(false);
    setErrorMessage(null);
    setResultImage(null);
    setUploadData(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userType = localStorage.getItem("type") || "visitor"; // Default to 'visitor' if no type is found
    const maxLimit = userType === "visitor" ? 3 : 5; // 3 free images without registration, 5 per day with registration
    
    let currentCount = parseInt(localStorage.getItem("count")) || 0;
    let remainingCount = Math.max(0, maxLimit - currentCount);

    if (currentCount < maxLimit) {
      localStorage.setItem("count", currentCount + 1);
      remainingCount -= 1;

      setImage(URL.createObjectURL(file));
      await uploadToLightX(file); // Trigger the upload

      console.log("local storage count", localStorage.getItem("count"));
      console.log("remaining count", remainingCount);
    } else {
      console.log("error in handleFileChange");
      const errorMessage =
        userType === "visitor"
          ? `You have used all your 3 free images. Please register to get 5 images per day.`
          : `You have used all your 5 daily images. Please upgrade to PRO for unlimited images.`;

      setErrorMessage(errorMessage);
      console.log("local storage count", localStorage.getItem("count"));
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      await uploadToLightX(file); // Trigger the upload
    }
  };

  const uploadToLightX = async (file) => {
    setIsLoading(true);
    setIsError(false);

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
        await generateAIBackground(imageUrl); // Call the removeBackground function
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

  // const generateAIBackground = async (imageUrl) => {
  //   try {
  //     console.log("Making request to generate AI background...");

  //     // Prepare the payload
  //     const payload = {
  //       imageUrl: imageUrl,
  //       textPrompt: "Luxury Clean background with white waves",
  //     };

  //     // Add styleImageUrl
  //     if (process.env.NEXT_PUBLIC_LIGHTX_STYLE_IMAGE_URL) {
  //       payload.styleImageUrl = process.env.NEXT_PUBLIC_LIGHTX_STYLE_IMAGE_URL;
  //     }

  //     console.log("Request payload:", payload);



  //     // Make the API request
  //     const response = await fetch(
  //       "https://cors-anywhere.herokuapp.com/https://api.lightxeditor.com/external/api/v1/product-photoshoot",
  //       {
  //         method: "POST",

  //         headers: {
  //           "Content-Type": "application/json",
  //           "x-api-key": process.env.NEXT_PUBLIC_LIGHTX_API_KEY,
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     const data = await response.json();
  //     console.log("Response from AI background generation:", data);

  //     if (data.statusCode === 2000) {
  //       const { orderId } = data.body;
  //       await pollForResult(orderId); // Poll for the result
  //     } else {
  //       throw new Error("Failed to generate background.");
  //     }
  //   } catch (error) {
  //     console.error("Error generating background:", error);
  //     setIsError(true);
  //   }
  // };

  // const pollForResult = async (orderId) => {
  //   const pollInterval = 3000; // Poll every 3 seconds
  //   const maxAttempts = 5; // Maximum number of retries

  //   for (let attempt = 0; attempt < maxAttempts; attempt++) {
  //     try {
  //       // Make the API request to check the status
  //       const resultResponse = await fetch(
  //         "https://api.lightxeditor.com/external/api/v1/order-status",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             "x-api-key": process.env.NEXT_PUBLIC_LIGHTX_API_KEY,
  //           },
  //           body: JSON.stringify({ orderId }),
  //         }
  //       );

  //       // Parse the response
  //       const resultData = await resultResponse.json();
  //       console.log("Polling response:", resultData);

  //       // Check if the request was successful
  //       if (resultData.statusCode === 2000) {
  //         const { status, output } = resultData.body;

  //         // Handle the status
  //         if (status === "active") {
  //           setResultImage(output); // Set the result image URL
  //           return; // Exit the loop if the status is "active"
  //         } else if (status === "failed") {
  //           throw new Error("Background generation failed.");
  //         }
  //       } else {
  //         throw new Error(
  //           `Request failed with status code ${resultData.statusCode}`
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error fetching result:", error);

  //       // If this is the last attempt, set an error state
  //       if (attempt === maxAttempts - 1) {
  //         setIsError(true);
  //         setErrorMessage("Failed to generate background. Please try again.");
  //       }
  //     }

  //     // Wait for the poll interval before the next attempt
  //     await new Promise((resolve) => setTimeout(resolve, pollInterval));
  //   }
  // };





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
        <div className="w-[50%] h-full rounded-full bg-[#2176FE14] blur-[150px]"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center max-w-[1200px] mx-auto">
        {/* Content Section */}
        <div className="flex flex-col items-center justify-center gap-1 text-white relative">
          <h1 className="text-2xl sm:text-[35px] md:text-[65px]  font-medium">
            Transform Your Watch
          </h1>
          <h1 className="text-2xl sm:text-[35px] md:text-[65px] text-center font-medium">
            Photos with{" "}
            <span className="bg-gradient-to-r from-[#21ABFD] to-[#0055DE] bg-clip-text text-transparent font-bold">
              Chronedo.AI
            </span>
          </h1>
        </div>

        <p className="text-center mt-4 relative z-10 text-xl">
          Upload a watch photo & get a stunning <br /> background in seconds!
        </p>

        {/* Image Upload Area */}
        <div
          className="flex flex-col items-center justify-center mt-6 px-4 py-4 border-1 border-[#0093E87D] bg-[#0D0B13] rounded-[40px] w-full max-w-[400px] min-h-[170px] relative z-10"
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
          <div className="flex items-center gap-3">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 sm:text-lg text-sm text-white px-6 py-3 bg-gradient-to-r from-[#21ACFD] to-[#2174FE] rounded-full cursor-pointer transition-all hover:opacity-90"
            >
              Upload Image
              <ArrowUpCircleIcon className="w-5 h-5" />
            </label>
            
            {(image || resultImage || isError || errorMessage) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 sm:text-lg text-sm text-white px-4 py-3 bg-gradient-to-r from-[#21ACFD] to-[#2174FE] rounded-full cursor-pointer transition-all hover:opacity-90"
                aria-label="Reset"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className="text-gray-400 text-sm sm:text-base mt-4">
            or drop a file
          </p>

          {image && (
            <div className="mt-4 w-full flex justify-center">
              <img
                src={image}
                alt="Uploaded Preview"
                className="max-w-full max-h-60 rounded-md shadow-lg"
              />
            </div>
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
              <h3 className="text-white mb-2">Background Removed:</h3>
              <img
                src={resultImage}
                alt="Background Removed"
                className="max-w-full max-h-60 rounded-md shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
