import Package from "@/models/package";
import connectDB from "./mongodb";
import nodemailer from 'nodemailer';

export const savePackage = async (packageData) => {
    try {
        await connectDB();
        const pack = await Package.findOne({ UserId: packageData.UserId }).sort({ createdAt: -1 }).limit(1);
        if (pack) {
            pack.name = packageData.name;
            pack.images += packageData.images;
            await pack.save();
            console.log('Package updated successfully:', pack);
            return;
        }
        const newPackage = new Package(packageData);
        await newPackage.save();
        console.log('Package saved successfully:', newPackage);
    } catch (error) {
        console.error('Error saving package:', error);
    }
};





export const sendEmail = async (email, name, price) => {
  try {
    // 1. Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Automatically sets host/port for Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2. Email content
    const mailOptions = {
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Thank you for purchasing ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Credit Purchase Confirmation</h2>
          <p>Hello,</p>
          <p>You've successfully purchased <strong>${name}</strong> for <strong>$${price}</strong>.</p>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Purchase Details</h3>
            <p><strong>Package:</strong> ${name}</p>
            <p><strong>Amount:</strong> $${price}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p>Need help? Contact our support team.</p>
          <p>Thanks,<br/>Your Company Team</p>
        </div>
      `,
    };

    // 3. Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};
