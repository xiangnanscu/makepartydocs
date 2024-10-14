import https from 'https';

const R2_TOKEN = process.env.R2_TOKEN;
const R2_ID = process.env.R2_ID;
const options = {
  hostname: `https://${R2_ID}.r2.cloudflarestorage.com`,
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.R2_TOKEN}`
  }
};

const req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();