const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const SecurityLogger = require('../utils/securityLogger');

/**
 * Sistema avanzado de rate limiting con categorías - CORREGIDO
 */
class RateLimitManager {
    constructor() {
        this.limiterConfigs = new Map();
        this.limiters = new Map(); // Cache para almacenar limiters pre-creados
        this.initDefaultLimiters();
    }

    initDefaultLimiters() {
        // Configuración de entorno
        const isDev = process.env.NODE_ENV !== 'production';

        // Limiter general para API - PRE-CREADO
        const apiLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: isDev ? 1000 : 150,
            message: this.rateLimitMessage('general'),
            handler: this.rateLimitHandler.bind(this, 'api'),
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.limiters.set('api', apiLimiter);

        // Limiter para autenticación - PRE-CREADO
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 10,
            message: this.rateLimitMessage('auth'),
            handler: this.rateLimitHandler.bind(this, 'auth'),
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.limiters.set('auth', authLimiter);

        // Limiter para comentarios - PRE-CREADO
        const commentsLimiter = rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 20,
            message: this.rateLimitMessage('comments'),
            handler: this.rateLimitHandler.bind(this, 'comments'),
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.limiters.set('comments', commentsLimiter);

        // Limiter para formularios de contacto - PRE-CREADO
        const contactLimiter = rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 5,
            message: this.rateLimitMessage('contact'),
            handler: this.rateLimitHandler.bind(this, 'contact'),
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.limiters.set('contact', contactLimiter);

        // Limiter estricto para seguridad - PRE-CREADO
        const securityLimiter = rateLimit({
            windowMs: 5 * 60 * 1000,
            max: 50,
            message: this.rateLimitMessage('security'),
            handler: this.rateLimitHandler.bind(this, 'security'),
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.limiters.set('security', securityLimiter);

        // Limiter para creación de cuentas - PRE-CREADO
        const createAccountLimiter = rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 5,
            message: this.rateLimitMessage('account_creation'),
            handler: this.rateLimitHandler.bind(this, 'account_creation'),
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.limiters.set('account_creation', createAccountLimiter);

        console.log('✅ Rate limiters pre-creados durante inicialización');
    }

    /**
     * Mensajes personalizados para cada tipo de rate limit
     */
    rateLimitMessage(type) {
        const messages = {
            general: {
                error: "Límite de solicitudes excedido",
                message: "Demasiadas solicitudes desde esta IP",
                retryAfter: "15 minutos"
            },
            auth: {
                error: "Límite de autenticación excedido",
                message: "Demasiados intentos de autenticación",
                retryAfter: "15 minutos"
            },
            comments: {
                error: "Límite de comentarios excedido",
                message: "Demasiados comentarios en poco tiempo",
                retryAfter: "1 hora"
            },
            contact: {
                error: "Límite de contacto excedido",
                message: "Demasiados mensajes de contacto",
                retryAfter: "1 hora"
            },
            security: {
                error: "Actividad sospechosa detectada",
                message: "Demasiadas solicitudes de seguridad",
                retryAfter: "5 minutos"
            },
            account_creation: {
                error: "Límite de creación de cuentas excedido",
                message: "Demasiadas cuentas creadas desde esta IP",
                retryAfter: "1 hora"
            }
        };

        return messages[type] || messages.general;
    }

    /**
     * Manejador personalizado para rate limits
     */
    rateLimitHandler(type, req, res) {
        const SecurityResponseManager = require('./securityHandlers').SecurityResponseManager;
        const securityManager = new SecurityResponseManager();

        // Log del incidente
        SecurityLogger.logIncident('MEDIUM', 'RATE_LIMIT_EXCEEDED', {
            ip: req.ip,
            type,
            path: req.path,
            userAgent: req.get('User-Agent'),
            method: req.method
        });

        res.setHeader('Retry-After', Math.ceil(this.getRetryAfterSeconds(type)));

        // Si es navegador O es una ruta de autenticación (que implica redirección de navegador)
        // redirigir a la página de error dedicada
        if (req.accepts('html') || req.path.includes('/auth/google')) {
            const retryAfter = this.getRetryAfterText(type);
            return res.redirect(`/error-429?retryAfter=${encodeURIComponent(retryAfter)}`);
        }

        // Generar página de error personalizada (fallback para API/JSON)
        const securityPage = securityManager.generateSecurityPage('rate_limit', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent'),
            limitType: type,
            retryAfter: this.getRetryAfterText(type)
        }, res);

        res.status(429).send(securityPage);
    }

    /**
     * Obtiene texto de retry-after para mensajes
     */
    getRetryAfterText(type) {
        const retryTimes = {
            'api': '15 minutos',
            'auth': '15 minutos',
            'comments': '1 hora',
            'contact': '1 hora',
            'security': '5 minutos',
            'account_creation': '1 hora'
        };
        return retryTimes[type] || '15 minutos';
    }

    /**
     * Obtiene segundos de retry-after
     */
    getRetryAfterSeconds(type) {
        const retrySeconds = {
            'api': 15 * 60,
            'auth': 15 * 60,
            'comments': 60 * 60,
            'contact': 60 * 60,
            'security': 5 * 60,
            'account_creation': 60 * 60
        };
        return retrySeconds[type] || 900;
    }

    /**
     * Obtiene un limiter por tipo - AHORA USA CACHE
     */
    getLimiter(type) {
        const limiter = this.limiters.get(type);
        if (!limiter) {
            console.warn(`⚠️  Limiter no encontrado: ${type}, usando limiter por defecto`);
            return this.limiters.get('api'); // Fallback al limiter general
        }
        return limiter;
    }

    /**
     * Crea un limiter personalizado DURANTE INICIALIZACIÓN
     */
    createCustomLimiter(name, config) {
        // Solo permitir creación durante inicialización
        if (this.limiters.has(name)) {
            console.warn(`⚠️  Limiter ${name} ya existe, ignorando creación duplicada`);
            return this.limiters.get(name);
        }

        const fullConfig = {
            ...config,
            handler: this.rateLimitHandler.bind(this, name),
            standardHeaders: true,
            legacyHeaders: false,
        };

        const limiter = rateLimit(fullConfig);
        this.limiters.set(name, limiter);

        console.log(`✅ Custom limiter creado: ${name}`);
        return limiter;
    }

    /**
     * Middleware para aplicar rate limiting inteligente - CORREGIDO
     */
    intelligentRateLimit() {
        // Devolver el middleware que usa limiters pre-creados
        return (req, res, next) => {
            const path = req.path;
            let limiterType = 'api';

            // Determinar tipo de limiter basado en la ruta
            if (path.includes('/api/auth/register')) {
                limiterType = 'account_creation';
            } else if (path.includes('/api/auth/')) {
                // Cualquier otra ruta de auth (login, google, etc)
                limiterType = 'auth';
            } else if (path.includes('/api/comentarios')) {
                limiterType = 'comments';
            } else if (path.includes('/contacto') || path.includes('/enviar-correo')) {
                limiterType = 'contact';
            } else if (path.includes('/api/security') || path.includes('/admin')) {
                limiterType = 'security';
            } else if (path.includes('/api/')) {
                limiterType = 'api';
            } else {
                // Para rutas no-API, no aplicar rate limiting o aplicar uno muy generoso
                return next();
            }

            try {
                const limiter = this.getLimiter(limiterType);
                limiter(req, res, next);
            } catch (error) {
                console.error(`❌ Error aplicando rate limiting (${limiterType}):`, error);
                // En caso de error, continuar sin rate limiting
                next();
            }
        };
    }

    /**
     * Obtiene estadísticas de rate limiting
     */
    getRateLimitStats() {
        const stats = {};

        const configs = {
            'api': { windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV !== 'production' ? 1000 : 150 },
            'auth': { windowMs: 15 * 60 * 1000, max: 10 },
            'comments': { windowMs: 60 * 60 * 1000, max: 20 },
            'contact': { windowMs: 60 * 60 * 1000, max: 5 },
            'security': { windowMs: 5 * 60 * 1000, max: 50 },
            'account_creation': { windowMs: 60 * 60 * 1000, max: 5 }
        };

        for (const [type, config] of Object.entries(configs)) {
            stats[type] = {
                windowMs: config.windowMs,
                max: config.max,
                windowMinutes: Math.floor(config.windowMs / 60000),
                status: this.limiters.has(type) ? 'ACTIVO' : 'INACTIVO'
            };
        }

        return stats;
    }
}

module.exports = new RateLimitManager();