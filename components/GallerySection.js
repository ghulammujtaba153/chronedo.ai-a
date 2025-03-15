import React from "react";

const Gallery = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-[1200px] py-15 px-4 mx-auto">
      <div className="flex flex-col gap-2 w-full items-center justify-center bg-[#217DFE08] shadow-[0_-2px_10px_-1px_rgba(0,147,232,1)] rounded-lg py-4">
        
        <div className="flex flex-col items-center px-2 justify-center gap-2">
          <h1 className="text-white text-4xl font-semibold">Gallery</h1>
          <p className="text-gray-400 text-lg">
            Check out some of the amazing photos we've created for our users.
          </p>
          
        </div>

        <div className="grid md:grid-cols-4 grid-cols-2 sm:grid-cols-3 mt-4 gap-4">
          <img
            src="/watch1.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <img
            src="/watch2.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <img
            src="/watch3.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />

          <img
            src="/watch4.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <img
            src="/watch5.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <img
            src="/watch6.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <img
            src="/watch7.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <img
            src="/watch.png"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Gallery;
