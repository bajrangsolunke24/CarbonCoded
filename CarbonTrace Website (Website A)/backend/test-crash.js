const express = require('express');
const govRoutes = require('./routes/gov');
const app = express();
app.use(express.json());
app.use('/api/gov', govRoutes);
app.listen(5002, () => console.log('Test server on 5002'));
