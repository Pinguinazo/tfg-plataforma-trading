const express = require('express');
const app = express();
const PORT = 3001;

app.get('/api/status', (req, res) => {
    res.json({ status: 'Primer Hola mundo en Node.js' });
});

app.listen(PORT, () => {
    console.log(`Estamos usando el puerto ${PORT}`);
});