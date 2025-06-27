const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/sendMessage', (req, res) => {
    const { sender, receiver, message } = req.body;
    console.log(`From ${sender} to ${receiver}: ${message}`);
    res.status(200).json({ status: 'Message received!' });
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
