require('dotenv').config();
const express = require('express');
const http = require('http'); 
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db.config');
const connectRedis = require('./config/redis.config');
const globalErrorHandler = require('./middlewares/globalErrorHandler.middleware');
const limiter = require("./middlewares/rateLimit.middleware");
const corsMiddleware = require('./middlewares/cors.middleware'); // Decoupled export link

const authRouter = require('./routes/auth.route');
const caseRouter = require('./routes/case.routes');
const evidenceRouter = require('./routes/evidence.route');
const mapRouter = require('./routes/map.routes');
const officerRouter = require("./routes/officer.routes");
const adminRouter = require("./routes/admin.route");
const legalRoutes = require("./routes/legal.routes");
const { initSocket } = require("./sockets/socket.server");

require('./workers/alertWorker');
require('./workers/case.worker');
require('./workers/cron.worker');

const app = express();

// 2. Set proxy trust immediately on the instance (Crucial for secure cross-origin cookie recognition)
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = initSocket(server);
connectDB();

// 3. Middlewares Pipeline Execution
app.use(corsMiddleware); // FIXED: Removed invocation parenthetical tags () to prevent crash 🧪
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(limiter);

// 4. Routes Mounting
app.use('/auth', authRouter);
app.use('/case', caseRouter);
app.use('/evidence', evidenceRouter);
app.use('/map', mapRouter);
app.use('/officer', officerRouter);
app.use('/admin', adminRouter);
app.use('/legal', legalRoutes);

app.use(globalErrorHandler);
app.use((req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));

module.exports = app;