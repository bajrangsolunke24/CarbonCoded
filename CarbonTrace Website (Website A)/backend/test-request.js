const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/gov/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  console.log("Status:", res.statusCode);
  res.on('data', d => process.stdout.write(d));
});
req.on('error', e => console.error("Error:", e));
req.write(JSON.stringify({email: "rajesh@gov.in", password: "admin"}));
req.end();
