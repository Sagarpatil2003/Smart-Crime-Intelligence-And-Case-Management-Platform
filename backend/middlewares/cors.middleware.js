// backend/middlewares/cors.middleware.js or server.js
const cors = require('cors');

const allowedOrigins = [
  "http://localhost:5173",
  "https://gregarious-basbousa-0747ea.netlify.app", // Clean Netlify dynamic domain
  "https://smart-crime-intelligence-and-case-man.netlify.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server or postman calls without origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS Access Blocked: Origin Unauthorized by Security Policies'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // CRUCIAL: Must explicitly declare your custom fallback token header here
 allowedHeaders: [
  "Content-Type",
  "Authorization",
  "X-Refresh-Token",
  "x-refresh-token"
],
  exposedHeaders: ["Set-Cookie"] 
};

module.exports = cors(corsOptions);