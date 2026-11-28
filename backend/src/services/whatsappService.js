const axios = require('axios');

function normalizeIndianWhatsappPhone(rawPhone) {
    if (!rawPhone || typeof rawPhone !== 'string') return null;
    let phone = rawPhone.replace(/\+/g, '').replace(/\D/g, '').trim();
    if (!phone || phone.startsWith('deleted_')) return null;
    if (phone.length === 10) {
        phone = `91${phone}`;
    }
    return phone;
}

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

        const phone = normalizeIndianWhatsappPhone(booking.devoteeDetails?.phoneNumber || booking.user?.phone);
        if (!phone) {
            console.log('[WHATSAPP SERVICE] No phone number found for booking:', booking.bookingId);
            return false;
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

exports.sendProfileSetupWhatsapp = async (user, targetPath = '/') => {
    try {
        const msg91AuthKey = process.env.MSG91_AUTH_KEY;
        const senderId = process.env.MSG91_SENDER_ID;
        const templateId = process.env.MSG91_PROFILE_SETUP_TEMPLATE_ID;

        if (!msg91AuthKey || !senderId || !templateId) {
            console.log('[WHATSAPP SERVICE] Missing MSG91 profile setup config (MSG91_PROFILE_SETUP_TEMPLATE_ID). Skipping.');
            return false;
        }

        const phone = normalizeIndianWhatsappPhone(user?.phone || user?.mobileNumber);
        if (!phone) {
            console.log('[WHATSAPP SERVICE] No valid phone number found for user:', user?._id);
            return false;
        }

        const userName = (user?.name && user.name !== 'User' ? user.name.trim() : 'Seeker').slice(0, 60);
        const safePath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
        const buttonSuffix = safePath === '/' ? 'open' : `open?to=${encodeURIComponent(safePath)}`;

        const nameParamKey = process.env.MSG91_PROFILE_SETUP_NAME_PARAM ?? 'text';
        const bodyParam =
            nameParamKey && nameParamKey !== 'positional'
                ? { type: "text", text: userName, parameter_name: nameParamKey }
                : { type: "text", text: userName };

        const components = [
            {
                type: "body",
                parameters: [bodyParam]
            }
        ];

        // Enable when the MSG91 template uses a dynamic URL button like https://way2astro.com/{{1}}
        if (process.env.MSG91_PROFILE_SETUP_BUTTON_DYNAMIC === 'true') {
            components.push({
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                    { type: "text", text: buttonSuffix }
                ]
            });
        }

        const whatsappPayload = {
            integrated_number: senderId,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                to: phone,
                type: "template",
                template: {
                    name: templateId,
                    language: {
                        code: "en",
                        policy: "deterministic"
                    },
                    components
                }
            }
        };

        const response = await axios.post(
            'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
            whatsappPayload,
            { headers: { authkey: msg91AuthKey, 'Content-Type': 'application/json' } }
        );

        console.log(`[WHATSAPP SERVICE] Profile setup WhatsApp sent to ${phone}. Response:`, response.data);
        return true;
    } catch (error) {
        console.error('[WHATSAPP SERVICE] Error sending profile setup WhatsApp:', {
            error: error.response?.data || error.message,
            status: error.response?.status
        });
        return false;
    }
};
