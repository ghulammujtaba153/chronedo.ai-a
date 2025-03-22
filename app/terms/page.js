"use client";

import HeroSection from '@/components/terms/HeroSection';
import MainLayout from '@/layouts/mainLayout';
import React from 'react';

const Page = () => {
  return (
    <MainLayout>
    <div className="flex flex-col w-full">
      <HeroSection/>

      {/* Terms of Use Section */}
      <section className="max-w-[1200px] px-4 mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4">Terms of Use</h2>
        <div className="space-y-4">
          <p>
            By using this website, you agree to the following terms and conditions:
          </p>
          <ul className="list-disc pl-6">
            <li>
              <strong>AI Processing:</strong> All images uploaded to this platform are processed using
              artificial intelligence (AI) technologies. By uploading images, you consent to this processing.
            </li>
            <li>
              <strong>Copyright:</strong> You retain ownership of the images you upload. However, by using this
              service, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and display
              your images solely for the purpose of providing the service.
            </li>
            <li>
              <strong>Storage Duration:</strong> Uploaded images are stored on our servers for a maximum of 30 days.
              After this period, they will be permanently deleted unless you explicitly request otherwise.
            </li>
            <li>
              <strong>Prohibited Content:</strong> You may not upload any content that violates intellectual property
              rights, contains illegal material, or is otherwise inappropriate. We reserve the right to remove such
              content without notice.
            </li>
          </ul>
        </div>
      </section>


      {/* Contact Information */}
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          If you have any questions about our Terms of Use or Privacy Policy, please contact us at:
        </p>
        <a href="mailto:support@example.com" className="text-blue-500 font-semibold">
          support@example.com
        </a>
      </div>
    </div>
    </MainLayout>
  );
};

export default Page;