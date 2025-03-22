"use client";
import HeroSection from '@/components/privacy/HeroSection';
import MainLayout from '@/layouts/mainLayout';
import React from 'react';

const TermsAndPrivacy = () => {
  return (
    <MainLayout>
    <div className="flex flex-col w-full">
      <HeroSection/>

      {/* Privacy Policy Section */}
      <section className='max-w-[1200px] px-4 mx-auto mt-10'>
        <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
        <div className="space-y-4">
          <p>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your
            personal information:
          </p>
          <ul className="list-disc pl-6">
            <li>
              <strong>Email Collection:</strong> We collect your email address when you sign up for an account. This
              information is used solely for account management, communication, and service-related notifications.
            </li>
            <li>
              <strong>Image Storage:</strong> Images uploaded to our platform are stored securely on our servers. We
              do not share your images with third parties unless required by law or with your explicit consent.
            </li>
            <li>
              <strong>GDPR Compliance:</strong> We comply with the General Data Protection Regulation (GDPR). You
              have the right to access, correct, or delete your personal data at any time. To exercise these rights,
              please contact us at <a href="mailto:privacy@example.com" className="text-blue-500">privacy@example.com</a>.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies to enhance your experience on our website. You can disable
              cookies in your browser settings, but this may affect the functionality of the site.
            </li>
            <li>
              <strong>Third-Party Services:</strong> We may use third-party services (e.g., analytics, payment
              processors) that collect information about your use of our platform. These services are governed by
              their own privacy policies.
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

export default TermsAndPrivacy;