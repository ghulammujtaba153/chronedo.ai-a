'use client'
import { useUser } from '@/context/UserContext';
import { PlusCircleIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
    const [image, setImage] = useState('/watch.png'); // Default image
    const { user } = useUser();

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        password: ""
    });

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a .jpg or .png image.');
                return;
            }

            const imageURL = URL.createObjectURL(file);
            setImage(imageURL); // Display the uploaded image
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Cancel Button
    const handleCancel = () => {
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            password: ""
        });
    };

    return (
        <div className='flex flex-col w-full max-w-[800px] py-4 h-full'>
            <p className='text-white font-bold mb-4'>Personal Information</p>

            <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>

                {/* Profile Picture Section */}
                <div className='flex flex-col w-full md:w-[300px]'>
                    <label htmlFor='file' className='cursor-pointer'>
                        <img
                            src={image}
                            alt='profile'
                            className='w-full h-auto max-h-[300px] rounded-lg object-cover border border-[#0093E829]'
                        />
                    </label>

                    <input
                        type="file"
                        id='file'
                        className='hidden'
                        onChange={handleFileChange}
                        accept='.jpg, .jpeg, .png'
                    />

                    <p className='text-white text-sm mt-2 text-center'>Click image to upload</p>
                </div>

                {/* Form Section */}
                <div className='flex flex-col w-full h-full gap-4'>
                    <input
                        type='text'
                        name='name'
                        placeholder='Full Name'
                        value={formData.name}
                        onChange={handleChange}
                        className='w-full bg-[#217DFE05] outline-none border border-[#0093E829] rounded-md p-2'
                    />
                    <input
                        type='text'
                        name='email'
                        placeholder='Email'
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full bg-[#217DFE05] outline-none border border-[#0093E829] rounded-md p-2'
                    />
                    <input
                        type='password'
                        name='password'
                        placeholder='Password'
                        value={formData.password}
                        onChange={handleChange}
                        className='w-full bg-[#217DFE05] outline-none border border-[#0093E829] rounded-md p-2'
                    />

                    <div className='flex items-center gap-2'>
                        <button
                            className='bg-gradient-to-r from-[#21ABFD] to-[#0055DE] text-white font-bold rounded-full px-4 py-2 cursor-pointer'>
                            Save Changes
                        </button>
                        <button 
                            className='rounded-md p-2 cursor-pointer'
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <p className='text-white font-bold my-4'>Card Information</p>

            <div className='flex flex-col w-full h-full gap-4'>
                <div className='flex items-center justify-center border border-gray-50 rounded-xl w-[100px] h-[100px] cursor-pointer hover:bg-gray-600 transition'>
                    <PlusCircleIcon className='w-10 h-10 text-white' />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
