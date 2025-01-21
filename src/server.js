require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Connect to databases
const connectMongoDB = require('./config/mongoConnection');
const { connectPostgreSQL } = require('./config/postgresConnection');

const AppError = require('./util/appError');
const globalErrorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./util/rateLimiter');
const env = require('./util/validateEnv');
const errorLogger = require('./middleware/errorLogger');

// Import the routes module
const auth = require('./routes/authentication');
const testOnly = require('./routes/test');

const app = express();

// Security middleware to set HTTP headers and prevent vulnerabilities   
app.use(helmet());

// Trust X-Forwarded-For header to get correct client IP and protocol
app.set('trust proxy', parseInt(env.NUMBER_OF_PROXIES) || 1);

// Rate limiting to protect from abuse and reduce server load
app.use(rateLimiter);

// Enable CORS with dynamic origin based on the environment (dev, test, or production)
app.use(
    cors({
        origin:
            env.NODE_ENV === 'dev' ? env.DEV_URL :
                env.NODE_ENV === 'test' ? env.TEST_URL :
                    env.PRODUCTION_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);


// Parse incoming JSON requests with a maximum body size of 5MB
app.use(express.json({ limit: '5mb' }));

// Parse URL-encoded requests with a 5MB body size limit and a max of 1000 parameters
app.use(express.urlencoded({ limit: '5mb', extended: false, parameterLimit: 1000 }));

// Parse cookies in requests
app.use(cookieParser());

// Log HTTP requests in 'dev' format for development
app.use(morgan('dev'));

// Health check
app.get('/', (_req, res) => {
    res.status(200).json({ message: 'OK' });
    res.end();
});

// API Endpoints
app.use('/test', testOnly)
app.use('/api/user/auth', auth);

// Error Handler
app.use(() => {
    throw new AppError({ statusCode: 404, message: 'Route not found!' });
});
// app.use(errorLogger)
app.use(globalErrorHandler);

// Start the server
Promise.all([connectMongoDB(), connectPostgreSQL()])
    .then(() => {
        const port = env.PORT || 8080;
        app.listen(port, () => {
            console.log(`Server listening on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to databases:', error);
        logger.error(`Database connection error: ${error.message}`);
        process.exit(1);
    });