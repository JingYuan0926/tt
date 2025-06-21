import { Resend } from 'resend';
import otpStore from '../../lib/otpStore.js';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { gmail } = req.body;

    // Validate input
    if (!gmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gmail address is required' 
      });
    }

    // Validate Gmail format
    if (!gmail.endsWith('@gmail.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid Gmail address' 
      });
    }

    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Email service not configured' 
      });
    }

    // Clean up expired OTPs
    otpStore.cleanupExpired();

    // Generate new OTP
    const otp = otpStore.generateOTP();
    
    // Store OTP with timestamp
    otpStore.setOTP(gmail, otp);

    // Send OTP via Resend
    const { data, error } = await resend.emails.send({
      from: 'OTP Service <onboarding@resend.dev>', // Replace with your verified domain
      to: [gmail],
      subject: 'Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Your OTP Verification Code</h2>
          
          <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #495057; font-weight: bold;">${otp}</h1>
          </div>
          
          <p style="color: #666; text-align: center; margin: 20px 0;">
            Enter this 6-digit code to complete your sign-in process.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong><br>
              • This code will expire in 10 minutes<br>
              • Do not share this code with anyone<br>
              • If you didn't request this, please ignore this email
            </p>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `Your OTP verification code is: ${otp}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.`
    });

    // Handle Resend API errors
    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    // Success response
    console.log(`OTP sent successfully to ${gmail}. Email ID: ${data.id}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
} 