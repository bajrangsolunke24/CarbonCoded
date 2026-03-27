const express = require('express');
const app = express();
app.use((req, res, next) => { console.log('middleware1', req.path); next(); });
app.get('/api/health', (req, res) => res.json({status: 'ok'}));
app.listen(5003, () => console.log('Test on 5003'));
