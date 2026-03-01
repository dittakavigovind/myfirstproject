const axios = require('axios');

exports.sendBookingConfirmationWhatsapp = async (booking) => {
    try {
        const msg91AuthKey = process.env.MSG91_AUTH_KEY;
        const senderId = process.env.MSG91_SENDER_ID;
        // Default template name if not provided in .env
        const templateId = process.env.MSG91_BOOKING_TEMPLATE_ID || 'booking_confirmation';

        if (!msg91AuthKey || !senderId) {
            console.log('[WHATSAPP SERVICE] Missing MSG91 config. Skipping WhatsApp confirmation.');
            return false;
        }

        let phone = booking.devoteeDetails?.phoneNumber || booking.user?.phone;
        if (!phone) {
            console.log('[WHATSAPP SERVICE] No phone number found for booking:', booking.bookingId);
            return false;
        }

        // Clean phone number
        phone = phone.replace(/\+/g, '').replace(/\D/g, '').trim();
        // If it's a 10 digit Indian number, append 91
        if (phone.length === 10) {
            phone = '91' + phone;
        }

        const devoteeName = booking.devoteeDetails?.devotees?.[0]?.name || 'Devotee';
        const sevaName = booking.sevaDetails?.name || 'Seva';
        const templeName = booking.temple?.name || 'Temple';
        const amount = booking.sevaDetails?.price - (booking.discountAmount || 0);
        const performDate = booking.performDate ? new Date(booking.performDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Scheduled';

        // Meta Header limit is 60 chars. Total text = "Pooja/Seva Booking Confirmed - " (31 chars) + variable.
        // Truncate to 20 chars to be safe.
        const headerSevaName = sevaName.length > 20 ? sevaName.substring(0, 17) + '...' : sevaName;
        console.log(`[WHATSAPP-DEBUG] Header Var: "${headerSevaName}" (Length: ${headerSevaName.length}), Total Estimated: ${31 + headerSevaName.length}`);

        const whatsappPayload = {
            integrated_number: senderId,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                to: phone, // must be numeric without +
                type: "template",
                template: {
                    name: templateId,
                    language: {
                        code: "en",
                        policy: "deterministic"
                    },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                { type: "text", text: headerSevaName, parameter_name: "var_1" }        // var_1 (Header)
                            ]
                        },
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: devoteeName, parameter_name: "var_2" },
                                { type: "text", text: templeName, parameter_name: "var_3" },
                                { type: "text", text: booking.bookingId, parameter_name: "var_4" },
                                { type: "text", text: sevaName, parameter_name: "var_5" },
                                { type: "text", text: `₹${amount}`, parameter_name: "var_6" },
                                { type: "text", text: performDate, parameter_name: "var_7" }
                            ]
                        }
                    ]
                }
            }
        };

        const response = await axios.post(
            'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
            whatsappPayload,
            { headers: { authkey: msg91AuthKey, 'Content-Type': 'application/json' } }
        );

        console.log(`[WHATSAPP SERVICE] Booking confirmation sent successfully to ${phone}. Response:`, response.data);
        return true;

    } catch (error) {
        console.error('[WHATSAPP SERVICE] Error sending confirmation WhatsApp:', {
            error: error.response?.data || error.message,
            status: error.response?.status
        });
        return false;
    }
};
