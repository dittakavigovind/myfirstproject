
const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_here'; // I need to check the actual secret
const userId = '67d4f9382f6e7a2b9c8d5e1f'; // Dummy user ID

const token = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET);

const socket = io('http://localhost:5000', {
    auth: { token }
});

socket.on('connect', () => {
    console.log('Connected to socket');
    socket.emit('join_chat_session', { roomId: 'test-room' });
});

socket.on('error', (err) => {
    console.error('Socket Error:', err);
});

socket.on('receive_session_message', (msg) => {
    console.log('Received Message:', msg);
});

setTimeout(() => {
    console.log('Sending message...');
    socket.emit('send_session_message', { roomId: 'test-room', content: 'Hello Stars!' });
}, 2000);
