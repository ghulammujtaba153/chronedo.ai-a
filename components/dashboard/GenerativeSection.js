import { DownloadIcon, PlusCircleIcon, XCircle } from 'lucide-react';
import React, { useState } from 'react';

const card = [
    {
        id: 1,
        title: 'Generate a stunning background',
        image: '/watch.png',
        description: 'Generate a stunning background',
        link: '/dashboard/generative/background',
    },
];

const GenerativeSection = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };


    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = selectedImage; // Use the selected image URL
        link.download = 'downloaded_image.png'; // Set the file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up after download
    };
    

    return (
        <div className='flex flex-col w-full h-full gap-4'>
            <p className='text-white font-bold'>
                Pickup where you left off in Generative Section
            </p>

            <div className='flex flex-col md:flex-row items-center w-full h-full gap-4'>
                <div className='flex items-center justify-center border border-gray-50 rounded-xl w-[200px] h-[200px] cursor-pointer hover:bg-gray-600 transition'>
                    <PlusCircleIcon className='max-w-10 max-h-10 text-white' />
                </div>

                {/* Cards */}
                {card.map((item) => (
                    <div
                        key={item.id}
                        className='flex flex-col border border-gray-50 rounded-xl max-w-[200px] max-h-[200px] overflow-hidden cursor-pointer hover:bg-gray-800 transition relative'
                        onClick={() => handleImageClick(item.image)}
                    >
                        <img
                            src={item.image}
                            alt={item.title}
                            className='w-full h-full object-cover'
                        />
                    </div>
                ))}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className='fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50'>
                    <div className='relative p-4'>
                        <img
                            src={selectedImage}
                            alt="Enlarged view"
                            className='max-w-full max-h-[90vh] rounded-xl shadow-lg'
                        />
                        <div className='flex p-2 items-center justify-center'>
                            <div className='flex items-center border border-[#0093E87D] rounded-xl p-4 gap-4'>
                                <p className='text-white'>Create Different</p>
                                <button onClick={handleDownload} className='text-white cursor-pointer bg-gradient-to-r from-[#21ABFD] to-[#0055DE] px-4 py-2 rounded-full flex items-center gap-2'>Download
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
