// Basic OTP Service
// For now, it mocks sending and verifying using hardcoded OTP for testing.
// Integrate Msg91 here later.

const otpStore = new Map(); // Store OTPs in memory for demo (Use Redis/DB in prod)

exports.sendOtp = async (phone) => {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory with timestamp (expires in 5 mins)
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log(`[OTP SERVICE] Sent OTP ${otp} to ${phone}`);

    // TODO: Integrate Msg91 / WhatsApp API here
    // await msg91.sendWhatsApp(phone, otp);

    return true;
};

exports.verifyOtp = async (phone, otp) => {
    // Hardcoded Backdoor for Testing as requested
    if (otp === '123456') return true;

    const record = otpStore.get(phone);
    if (!record) return false;

    if (Date.now() > record.expires) {
        otpStore.delete(phone);
        return false;
    }

    if (record.otp === otp) {
        otpStore.delete(phone);
        return true;
    }

    return false;
};
