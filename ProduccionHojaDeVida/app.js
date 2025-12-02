const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const crypto = require("crypto");

// Importar middlewares de seguridad
const advancedObfuscation = require('./middlewares/security/obfuscation');
const honeyPotSystem = require('./middlewares/security/honeypot');
const OWASPDefender = require('./services/security/OWASPDefender');
const { errorHandler, maliciousUrlCatcher, notFoundHandler } = require('./middlewares/securityHandlers');
const { getHelmetConfig, corsOptions } = require('./config/securityConfig');
const RateLimitManager = require('./middlewares/rateLimitHandlers');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const comentariosRoutes = require('./routes/comentariosRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const contactoController = require('./controllers/contactoController');
const authController = require('./controllers/authController');

const isDev = process.env.NODE_ENV !== "production";
const app = express();

// Trust Proxy for secure cookies behind reverse proxies
app.set('trust proxy', 1);

// Compression
app.use(compression());

// Obfuscation
app.use(advancedObfuscation);

// Honeypot
app.use(honeyPotSystem);

// Security handlers
app.use(maliciousUrlCatcher);

// Rate limiting
app.use(RateLimitManager.intelligentRateLimit());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors(corsOptions));

// Nonce generation
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

// Helmet
app.use(helmet(getHelmetConfig()));

// MongoDB sanitization
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`⚠️ Sanitized key: ${key} in request from ${req.ip}`);
    }
}));

// HPP
app.use(hpp({
    whitelist: ['filter', 'sort', 'page', 'limit']
}));

// Custom security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// CSP violation report endpoint
app.post('/api/csp-violation-report', express.json({ type: 'application/csp-report' }), (req, res) => {
    console.warn('🚨 CSP Violation:', req.body);
    res.status(204).end();
});

// Sessions
const sessionConfig = {
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'default_secret_dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: !isDev,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
};

if (process.env.MONGO_URI) {
    sessionConfig.store = MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions",
        ttl: 24 * 60 * 60,
        autoRemove: 'native'
    });
} else {
    console.warn("⚠️ MONGO_URI not found. Using memory store for sessions.");
}

if (isDev) {
    sessionConfig.cookie.secure = false;
    sessionConfig.cookie.sameSite = 'lax';
    sessionConfig.proxy = true;
}

app.use(session(sessionConfig));

// Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// View engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Inject nonce in HTML
app.use((req, res, next) => {
    const originalRender = res.render;
    res.render = function (view, options, callback) {
        options = options || {};
        options.nonce = res.locals.nonce;
        originalRender.call(this, view, options, callback);
    };
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/contacto', contactoRoutes);
app.post('/enviar-correo', contactoController.enviarMensaje);




app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error pages routes
app.get('/error-429', (req, res) => {
    // Obtener IP con mejor detección
    let userIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.ip;

    // Limpiar formato IPv6 localhost y variantes
    if (!userIp || userIp === '::1' || userIp === '::ffff:127.0.0.1' || userIp === '127.0.0.1') {
        userIp = '127.0.0.1 (Localhost)';
    } else if (userIp && userIp.startsWith('::ffff:')) {
        // Convertir IPv6-mapped IPv4 a formato IPv4 normal
        userIp = userIp.replace('::ffff:', '');
    }

    const retryAfter = req.query.retryAfter || '15 minutos';
    res.status(429).render('error-429', {
        nonce: res.locals.nonce,
        userIp: userIp,
        retryAfter: retryAfter
    });
});

// Static files
app.use(express.static("public", {
    maxAge: isDev ? 0 : '1d',
    etag: true,
    lastModified: true
}));

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
