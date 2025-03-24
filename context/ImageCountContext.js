"use client"
// contexts/ImageCountContext.js
import { createContext, useState, useContext } from "react";

const ImageCountContext = createContext();

export const ImageCountProvider = ({ children }) => {
  const [imageCount, setImageCount] = useState(0);

  return (
    <ImageCountContext.Provider value={{ imageCount, setImageCount }}>
      {children}
    </ImageCountContext.Provider>
  );
};

export const useImageCount = () => useContext(ImageCountContext);