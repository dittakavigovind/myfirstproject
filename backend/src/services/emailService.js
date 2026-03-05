const nodemailer = require('nodemailer');

// Initialize transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

exports.sendVerificationEmail = async (user, token) => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.log('[EMAIL SERVICE] Missing SMTP credentials. Skipping verification email.');
            return false;
        }

        const transporter = createTransporter();
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        const mailOptions = {
            from: `"Way2Astro" <${process.env.SMTP_EMAIL}>`,
            to: user.email,
            subject: 'Your 6-Digit Verification Code - Way2Astro',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                    <div style="background-color: #1e1b4b; padding: 30px; text-align: center;">
                        <h1 style="color: #fde047; margin: 0; font-size: 28px; letter-spacing: 1px;">Way2Astro</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #1e293b; line-height: 1.6; text-align: center;">
                        <h2 style="color: #1e1b4b; margin-top: 0;">Welcome, ${user.name}!</h2>
                        <p style="font-size: 16px;">Thank you for joining Way2Astro. Please use the following 6-digit code to verify your email address:</p>
                        <div style="margin: 40px 0;">
                            <span style="background-color: #f8fafc; color: #1e1b4b; padding: 15px 35px; border-radius: 10px; font-weight: 900; font-size: 32px; border: 2px dashed #cbd5e1; letter-spacing: 5px;">${token}</span>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                        <p style="font-size: 12px; color: #94a3b8;">If you did not request this code, please ignore this email.</p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                        &copy; ${new Date().getFullYear()} Way2Astro. All rights reserved.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SERVICE] Verification email sent to ${user.email}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL SERVICE] Error sending verification email:', error);
        return false;
    }
};

exports.sendBookingConfirmationEmail = async (booking) => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.log('[EMAIL SERVICE] Missing SMTP credentials. Skipping email confirmation.');
            return false;
        }

        const transporter = createTransporter();

        const devoteeName = booking.devoteeDetails?.devotees?.[0]?.name || 'Devotee';
        const userEmail = booking.devoteeDetails?.email || booking.user?.email;

        if (!userEmail) {
            console.log('[EMAIL SERVICE] No email found for booking:', booking.bookingId);
            return false;
        }

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: userEmail,
            subject: `Pooja Booking Confirmed - ${booking.bookingId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #4A90E2;">Booking Confirmation</h2>
                    <p>Dear ${devoteeName},</p>
                    <p>Your pooja booking has been successfully confirmed at <strong>${booking.temple?.name || 'the Temple'}</strong>.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p style="margin: 5px 0;"><strong>Seva:</strong> ${booking.sevaDetails?.name}</p>
                        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${booking.sevaDetails?.price}</p>
                        ${booking.performDate ? `<p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.performDate).toLocaleDateString()}</p>` : ''}
                    </div>
                    
                    <p>May the divine blessings be with you.</p>
                    <p>Thank you for choosing Way2Astro!</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SERVICE] Booking confirmation sent successfully to ${userEmail}. Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error('[EMAIL SERVICE] Error sending confirmation email:', error);
        return false;
    }
};
