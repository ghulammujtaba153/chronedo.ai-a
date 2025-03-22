import React from "react";

const SuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-green-500">Payment Failed!</h1>
      <p className="text-gray-400 mt-4">Try again.</p>
    </div>
  );
};

export default SuccessPage;