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
