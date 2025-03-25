"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import axios from 'axios';

export default function OTPVerification({ formData }) {
  const router = useRouter();
  const email = formData.email;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useUser();

  const handleVerify = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // First verify OTP
      const verifyResponse = await axios.post('/api/auth/email-verification', {
        email,
        otp
      });

      if (verifyResponse.status === 200) {
        // Then register the user
        const registerResponse = await axios.post('/api/auth/register', formData);
        
        if (registerResponse.status === 201) {
          // Then login the user
          const loginResponse = await axios.post('/api/auth/login', {
            email: formData.email,
            password: formData.password
          });

          if (loginResponse.status === 200) {
            login(loginResponse.data.token);
            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 2000);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/send-otp', {
        email
      });

      if (response.status === 200) {
        setSuccess('New OTP sent successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0D0B13]/90 backdrop-blur-sm p-8 rounded-xl border border-[#0093E8] w-full max-w-md">
      <h1 className="text-2xl font-bold text-center text-white mb-4">Verify OTP</h1>
      <p className="text-gray-400 text-center mb-6">
        We've sent a 6-digit code to {email}
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OTP Code
          </label>
          <input
            type="text"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 text-white bg-[#0D0B13] border border-gray-700 rounded-md focus:ring-2 focus:ring-[#21ACFD]"
            placeholder="Enter 6-digit OTP"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        {success && <p className="text-green-500 text-center text-sm">{success}</p>}
      </div>
    </div>
  );
}