const cors = require('cors');

const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-crime-intelligence-and-case-m.vercel.app" // Your main production domain
];

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow mobile apps, postman, or server-to-server testing (no origin)
    if (!origin) return callback(null, true);
    
    // 2. Check if it matches localhost or your main production domain
    const isExplicitlyAllowed = allowedOrigins.indexOf(origin) !== -1;
    
    // 3. Dynamically allow any branch/preview deployment URL from your Vercel project
    const isVercelPreview = origin.startsWith('https://smart-crime-intelligence-and-case-') && origin.endsWith('.vercel.app');

    if (isExplicitlyAllowed || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('CORS Access Blocked: Origin Unauthorized by Security Policies'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Refresh-Token",
    "x-refresh-token"
  ],
  exposedHeaders: ["Set-Cookie"] 
};

module.exports = cors(corsOptions);