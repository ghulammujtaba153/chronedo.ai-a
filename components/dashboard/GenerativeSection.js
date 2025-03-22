"use client";
import { useUser } from '@/context/UserContext';
import { useImage } from '@/context/ImageContext';
import { DownloadIcon, PlusCircleIcon, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from 'react-responsive-carousel'; // Import Carousel component

const CustomPrevArrow = (onClickHandler, hasPrev, label) => (
    <button
        onClick={onClickHandler}
        disabled={!hasPrev}
        className="absolute cursor-pointer top-1/2 left-2 transform -translate-y-1/2 bg-gray-800/50 hover:bg-gray-800/75 text-white p-2 rounded-full z-10"
        aria-label={label}
    >
        {/* Left arrow icon */}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
            />
        </svg>
    </button>
);

const CustomNextArrow = (onClickHandler, hasNext, label) => (
    <button
        onClick={onClickHandler}
        disabled={!hasNext}
        className="absolute cursor-pointer top-1/2 right-2 transform -translate-y-1/2 bg-gray-800/50 hover:bg-gray-800/75 text-white p-2 rounded-full z-10"
        aria-label={label}
    >
        {/* Right arrow icon */}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
            />
        </svg>
    </button>
);

const ShimmerEffect = () => {
    return (
        <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4">
                <div className="h-48 bg-gray-700 rounded-xl"></div>
            </div>
        </div>
    );
};

const GenerativeSection = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [userImages, setUserImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const { user } = useUser();
    const { resultImage } = useImage();

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = selectedImage;
        link.download = 'downloaded_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const fetchImages = async () => {
            if (!user?.userId) return; // Ensure user and userId are available

            try {
                const res = await axios.get(`/api/image/${user.userId}`);
                console.log(res.data);
                setUserImages(res.data.images); // Update the state with fetched images
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setIsLoading(false); // Set loading to false after fetching
            }
        };

        fetchImages();
    }, [user]);

    useEffect(() => {
        if (resultImage) {
            setUserImages((prevImages) => [resultImage, ...prevImages]);
        }
    }, [resultImage]);

    return (
        <div className='flex flex-col w-full h-full gap-4'>
            <p className='text-white font-bold'>
                Pickup where you left off in Generative Section
            </p>

            <div className='flex flex-col md:flex-row items-center w-full h-full gap-4'>
                <div className='flex items-center justify-center border border-gray-50 rounded-xl w-[200px] h-[200px] cursor-pointer hover:bg-gray-600 transition'>
                    <PlusCircleIcon className='max-w-10 max-h-10 text-white' />
                </div>

                {/* Carousel for Images */}
                <div className="w-full max-w-[800px] mx-auto">
                    <Carousel
                        showArrows={true}
                        showThumbs={false}
                        infiniteLoop={true}
                        showStatus={false}
                        showIndicators={false}
                        autoPlay={false}
                        dynamicHeight={false}
                        emulateTouch={true}
                        centerMode={true}
                        centerSlidePercentage={33.33}
                        renderArrowPrev={CustomPrevArrow}
                        renderArrowNext={CustomNextArrow}
                    >
                        {isLoading ? (
                            // Show shimmer effect while loading
                            Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className='flex flex-col rounded-xl max-w-[200px] max-h-[200px] overflow-hidden cursor-pointer hover:bg-gray-800 transition relative'
                                >
                                    <ShimmerEffect />
                                </div>
                            ))
                        ) : (
                            // Show actual images once loaded
                            userImages.map((item, index) => (
                                <div
                                    key={index}
                                    className='flex flex-col border border-gray-50 rounded-xl max-w-[200px] max-h-[200px] overflow-hidden cursor-pointer hover:bg-gray-800 transition relative'
                                    onClick={() => handleImageClick(item)}
                                >
                                    <img
                                        src={item}
                                        alt={`Image ${index + 1}`}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                            ))
                        )}
                    </Carousel>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className='fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50'>
                    <div className='relative p-4 bg-gray-900 rounded-lg'>
                        <img
                            src={selectedImage}
                            alt="Enlarged view"
                            className='max-w-full max-h-[80vh] rounded-xl shadow-lg'
                        />
                        <div className='flex p-2 items-center justify-center mt-4'>
                            <div className='flex items-center border border-[#0093E87D] rounded-xl p-4 gap-4'>
                                <p className='text-white'>Create Different</p>
                                <button
                                    onClick={handleDownload}
                                    className='text-white cursor-pointer bg-gradient-to-r from-[#21ABFD] to-[#0055DE] px-4 py-2 rounded-full flex items-center gap-2'
                                >
                                    Download
                                    <DownloadIcon className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleCloseModal}
                            className='absolute cursor-pointer top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black'
                            aria-label="Close image preview"
                        >
                            <XCircle className='w-8 h-8' />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerativeSection;