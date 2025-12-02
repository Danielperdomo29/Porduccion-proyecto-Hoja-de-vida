const rateLimit = require("express-rate-limit");
const SecurityLogger = require('../utils/securityLogger');

const isDev = process.env.NODE_ENV !== "production";

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Demasiadas cuentas creadas desde esta IP, intenta nuevamente después de una hora",
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 150,
    message: {
        error: "Demasiadas solicitudes desde esta IP",
        retryAfter: "15 minutos"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: "Demasiados intentos de autenticación",
        retryAfter: "15 minutos"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        if (isDev) {
            const allowedDevOrigins = [
                "http://localhost:3000",
                "https://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:8100",
                "https://localhost:8100"
            ];
            if (allowedDevOrigins.includes(origin)) {
                return callback(null, true);
            }
        }

        const allowedProdOrigins = [
            "https://danielper29.alwaysdata.net",
            "https://www.danielper29.alwaysdata.net",
            "http://danielper29.alwaysdata.net",
            "http://www.danielper29.alwaysdata.net"
        ];

        if (allowedProdOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️  Intento de acceso CORS bloqueado: ${origin}`);

            // Log en el nuevo sistema
            SecurityLogger.logIncident('MEDIUM', 'CORS_VIOLATION', {
                origin
            });

            callback(new Error('No permitido por CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept'
    ],
    maxAge: 86400
};

const getHelmetConfig = (nonce) => ({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://www.google.com",
                "https://www.gstatic.com",
                "https://www.recaptcha.net",
                "https://recaptcha.net",
                "https://apis.google.com",
                "https://cdnjs.cloudflare.com",
                `'nonce-${nonce}'`,
                "'unsafe-inline'",
                "'unsafe-eval'"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net",
                "https://fonts.googleapis.com",
                "https://www.google.com",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "data:",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            connectSrc: [
                "'self'",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://danielper29.alwaysdata.net",
                "https://accounts.google.com",
                "https://www.google.com",
                "https://www.recaptcha.net",
                "https://recaptcha.net",
                "wss://danielper29.alwaysdata.net",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://www.cloudflare.com",
                "https://api.ipify.org"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https:",
                "http:",
                "https://i.imgur.com",
                "https://lh3.googleusercontent.com",
                "https://img.youtube.com",
                "https://d33wubrfki0l68.cloudfront.net",
                "https://drive.google.com",
                "https://www.google.com",
                "https://www.gstatic.com"
            ],
            frameSrc: [
                "'self'",
                "https://www.google.com",
                "https://www.recaptcha.net"
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:"],
            childSrc: ["'self'", "blob:"],
            formAction: [
                "'self'",
                "https://accounts.google.com"
            ],
            baseUri: ["'self'"],
            manifestSrc: ["'self'"],
            reportUri: '/api/csp-violation-report'
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" }
});

module.exports = {
    createAccountLimiter,
    generalLimiter,
    authLimiter,
    corsOptions,
    getHelmetConfig
};
