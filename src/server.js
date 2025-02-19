require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Connect to databases
const connectMongoDB = require('./config/mongoConnection');
const { connectPostgreSQL } = require('./config/postgresConnection');

const AppError = require('./utils/appError');
const authMiddleware = require('./middleware/authMiddleware');
const globalErrorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./utils/rateLimiter');
const env = require('./utils/validateEnv');
const errorLogger = require('./middleware/errorLogger');

// Routes module
const auth = require('./routes/authentication');
const testOnly = require('./routes/testRoutes');
const controlPanelRoutes = require('./routes/controlPanelRoutes');    
const productRoutes = require('./routes/productRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const app = express();

app.use(helmet());
app.set('trust proxy', parseInt(env.NUMBER_OF_PROXIES) || 1);
app.use(rateLimiter);

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

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: false, parameterLimit: 1000 }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health check
app.get('/', (_req, res) => {
    res.status(200).json({ message: 'OK' });
    res.end();
});

// API Endpoints
// app.use('/test', testOnly)
app.use('/api/auth', auth);
app.use(authMiddleware);
app.use('/api/controlPanel', controlPanelRoutes);
app.use('/api/product', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/subscription', subscriptionRoutes);
// app.use('/api/patient', patientController);

// Error Handler
app.use(() => {
    throw new AppError({ statusCode: 404, message: 'Route not found!' });
});
app.use(errorLogger)  //Enable or Disable error logging********    
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