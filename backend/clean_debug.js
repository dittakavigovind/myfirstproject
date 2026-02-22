const axios = require('axios');

async function check() {
    try {
        const res = await axios.get('http://localhost:5000/api/debug/user/9948505111');
        const u = res.data.user;
        console.log('ID:', u._id);
        console.log('Name:', u.name);
        console.log('Gender:', u.gender);
        console.log('Birth Details Date:', u.birthDetails?.date);
        console.log('Needs Setup (Frontend Logic):', (!u.name || u.name === 'User' || !u.gender || !u.birthDetails || !u.birthDetails.date));
    } catch (err) {
        console.error(err.message);
    }
}

check();
