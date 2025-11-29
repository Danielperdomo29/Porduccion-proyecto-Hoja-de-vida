const crypto = require('crypto');
const fetch = require('node-fetch');
const SecurityLogger = require('../../utils/securityLogger');

class OWASPDefender {
    constructor() {
        this.threatIntelligence = {
            abuseIPDB: {
                apiKey: process.env.ABUSEIPDB_API_KEY,
                enabled: !!process.env.ABUSEIPDB_API_KEY,
                cache: new Map(),
                cacheTTL: 3600000
            }
        };
        
        this.owaspProtections = new Map();
        this.securityEvents = [];
        this.initOWASPProtections();
    }

    initOWASPProtections() {
        // A01:2023 - Broken Access Control
        this.owaspProtections.set('A01', {
            name: 'Broken Access Control',
            description: 'Control de acceso roto',
            severity: 'HIGH',
            protections: ['JWT validation', 'Role-based access control', 'Path traversal protection']
        });

        // A02:2023 - Cryptographic Failures
        this.owaspProtections.set('A02', {
            name: 'Cryptographic Failures',
            description: 'Fallos criptográficos',
            severity: 'HIGH',
            protections: ['TLS enforcement', 'Data encryption', 'Secure session management']
        });

        // A03:2023 - Injection
        this.owaspProtections.set('A03', {
            name: 'Injection',
            description: 'Inyección de código',
            severity: 'CRITICAL',
            protections: ['SQL Injection prevention', 'XSS prevention', 'Command Injection prevention']
        });

        // A07:2023 - Identification and Authentication Failures
        this.owaspProtections.set('A07', {
            name: 'Authentication Failures',
            description: 'Fallos de autenticación',
            severity: 'HIGH',
            protections: ['Brute force protection', 'Session management', 'Strong password policies']
        });

        // A10:2023 - Server-Side Request Forgery (SSRF)
        this.owaspProtections.set('A10', {
            name: 'SSRF',
            description: 'Server-Side Request Forgery',
            severity: 'HIGH',
            protections: ['URL validation', 'Outbound request filtering', 'DNS rebinding protection']
        });
    }

    async checkAbuseIPDB(ip) {
        if (!this.threatIntelligence.abuseIPDB.enabled) {
            return null;
        }

        // Verificar cache primero
        const cached = this.threatIntelligence.abuseIPDB.cache.get(ip);
        if (cached && (Date.now() - cached.timestamp) < this.threatIntelligence.abuseIPDB.cacheTTL) {
            return cached.data;
        }

        try {
            const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
                method: 'GET',
                headers: {
                    'Key': this.threatIntelligence.abuseIPDB.apiKey,
                    'Accept': 'application/json',
                    'User-Agent': 'Security-Server/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`AbuseIPDB API error: ${response.status}`);
            }

            const data = await response.json();
            
            const result = {
                ip: ip,
                isPublic: data.data.isPublic,
                ipVersion: data.data.ipVersion,
                isWhitelisted: data.data.isWhitelisted,
                abuseConfidenceScore: data.data.abuseConfidenceScore,
                countryCode: data.data.countryCode,
                usageType: data.data.usageType,
                isp: data.data.isp,
                domain: data.data.domain,
                totalReports: data.data.totalReports,
                numDistinctUsers: data.data.numDistinctUsers,
                lastReportedAt: data.data.lastReportedAt
            };

            // Guardar en cache
            this.threatIntelligence.abuseIPDB.cache.set(ip, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            console.warn('⚠️ Error consultando AbuseIPDB:', error.message);
            return null;
        }
    }

    async reportToAbuseIPDB(ip, categories, comment) {
        if (!this.threatIntelligence.abuseIPDB.enabled) {
            return false;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('ip', ip);
            formData.append('categories', categories.join(','));
            formData.append('comment', comment);

            const response = await fetch('https://api.abuseipdb.com/api/v2/report', {
                method: 'POST',
                headers: {
                    'Key': this.threatIntelligence.abuseIPDB.apiKey,
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            return response.ok;
        } catch (error) {
            console.warn('⚠️ Error reportando a AbuseIPDB:', error.message);
            return false;
        }
    }

    // A01:2023 - Broken Access Control
    a01AccessControl() {
        return (req, res, next) => {
            // Prevenir path traversal
            const pathTraversalPatterns = [
                /\.\.\//g,
                /\.\.\\/g,
                /\/etc\//g,
                /\/passwd/g,
                /\/shadow/g
            ];

            const requestPath = req.path + JSON.stringify(req.query);
            
            for (const pattern of pathTraversalPatterns) {
                if (pattern.test(requestPath)) {
                    this.logSecurityEvent('A01', 'PATH_TRAVERSAL_ATTEMPT', {
                        ip: this.getClientIP(req),
                        path: req.path,
                        pattern: pattern.toString(),
                        blocked: true
                    });
                    
                    // Usar el nuevo sistema de logging
                    SecurityLogger.logIncident('HIGH', 'PATH_TRAVERSAL_ATTEMPT', {
                        ip: this.getClientIP(req),
                        path: req.path,
                        pattern: pattern.toString(),
                        userAgent: req.get('User-Agent')
                    });
                    
                    return res.status(403).json({
                        error: 'Acceso no permitido',
                        incidentId: crypto.randomBytes(8).toString('hex')
                    });
                }
            }

            next();
        };
    }

    // A03:2023 - Injection
    a03InjectionProtection() {
        return (req, res, next) => {
            const injectionPatterns = {
                SQL_INJECTION: [
                    /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)(\s+)(\w+)(\s+)/i,
                    /('|"|;|--|#|\/\*|\*\/|\\\/)/,
                    /(\b)(OR|AND)(\s+)(\d+)(\s*)(=|\!=|<|>)/i
                ],
                XSS: [
                    /<script[^>]*>[\s\S]*?<\/script>/gi,
                    /javascript:\s*[^"']*/gi,
                    /on\w+\s*=\s*["'][^"']*["']/gi,
                    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi
                ],
                COMMAND_INJECTION: [
                    /(\b)(rm\s+-rf|del\s+\/q|wget|curl|nc|netcat|bash|sh|cmd)(\b)/i,
                    /(\||\&|\;|\`|\$\(|\n|\r)/
                ]
            };

            const checkInjection = (data, context) => {
                if (typeof data !== 'string') return false;

                for (const [type, patterns] of Object.entries(injectionPatterns)) {
                    for (const pattern of patterns) {
                        pattern.lastIndex = 0;
                        if (pattern.test(data)) {
                            this.logSecurityEvent('A03', `${type}_DETECTED`, {
                                ip: this.getClientIP(req),
                                type,
                                context,
                                pattern: pattern.toString(),
                                data: data.substring(0, 100),
                                blocked: true
                            });

                            // Usar el nuevo sistema de logging
                            SecurityLogger.logIncident('CRITICAL', `${type}_DETECTED`, {
                                ip: this.getClientIP(req),
                                type,
                                context,
                                pattern: pattern.toString(),
                                data: data.substring(0, 100),
                                userAgent: req.get('User-Agent')
                            });

                            return true;
                        }
                    }
                }
                return false;
            };

            // Verificar todos los inputs
            const checkObject = (obj, path = '') => {
                for (const [key, value] of Object.entries(obj)) {
                    const fullPath = path ? `${path}.${key}` : key;
                    
                    if (typeof value === 'string') {
                        if (checkInjection(value, fullPath)) {
                            return true;
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        if (checkObject(value, fullPath)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            if (checkObject(req.query, 'query') || 
                (req.body && checkObject(req.body, 'body'))) {
                return res.status(403).json({
                    error: 'Solicitud bloqueada - Patrón de inyección detectado',
                    incidentId: crypto.randomBytes(8).toString('hex')
                });
            }

            next();
        };
    }

    // A10:2023 - Server-Side Request Forgery (SSRF)
    a10SSRFProtection() {
        return (req, res, next) => {
            const ssrfPatterns = [
                /(localhost|127\.0\.0\.1|0\.0\.0\.0)/i,
                /(169\.254\.\d+\.\d+)/,
                /(10\.\d+\.\d+\.\d+)/,
                /(192\.168\.\d+\.\d+)/,
                /(172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)/,
                /(metadata\.google\.internal|169\.254\.169\.254)/,
                /(file:\/\/|ftp:\/\/|gopher:\/\/)/
            ];

            const checkSSRF = (obj, context) => {
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === 'string') {
                        for (const pattern of ssrfPatterns) {
                            if (pattern.test(value)) {
                                this.logSecurityEvent('A10', 'SSRF_ATTEMPT', {
                                    ip: this.getClientIP(req),
                                    context: `${context}.${key}`,
                                    value: value.substring(0, 100),
                                    pattern: pattern.toString(),
                                    blocked: true
                                });

                                // Usar el nuevo sistema de logging
                                SecurityLogger.logIncident('HIGH', 'SSRF_ATTEMPT', {
                                    ip: this.getClientIP(req),
                                    context: `${context}.${key}`,
                                    value: value.substring(0, 100),
                                    pattern: pattern.toString(),
                                    userAgent: req.get('User-Agent')
                                });

                                return true;
                            }
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        if (checkSSRF(value, `${context}.${key}`)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            if (checkSSRF(req.query, 'query') || 
                (req.body && checkSSRF(req.body, 'body'))) {
                return res.status(403).json({
                    error: 'Solicitud bloqueada - Patrón SSRF detectado',
                    incidentId: crypto.randomBytes(8).toString('hex')
                });
            }

            next();
        };
    }

    // Threat Intelligence Avanzada
    advancedThreatIntelligence() {
        return async (req, res, next) => {
            const clientIP = this.getClientIP(req);

            try {
                // Consultar AbuseIPDB solo para IPs sospechosas
                const recentEvents = this.securityEvents.filter(event => 
                    event.timestamp > Date.now() - 3600000 && // Última hora
                    event.details.ip === clientIP
                );

                if (recentEvents.length > 5) { // Si hay más de 5 eventos recientes
                    const abuseData = await this.checkAbuseIPDB(clientIP);
                    
                    if (abuseData && abuseData.abuseConfidenceScore > 50) {
                        this.logSecurityEvent('THREAT_INTEL', 'HIGH_RISK_IP_BLOCKED', {
                            ip: clientIP,
                            abuseConfidenceScore: abuseData.abuseConfidenceScore,
                            totalReports: abuseData.totalReports,
                            blocked: true
                        });

                        // Usar el nuevo sistema de logging
                        SecurityLogger.logIncident('HIGH', 'HIGH_RISK_IP_BLOCKED', {
                            ip: clientIP,
                            abuseConfidenceScore: abuseData.abuseConfidenceScore,
                            totalReports: abuseData.totalReports,
                            userAgent: req.get('User-Agent')
                        });

                        return res.status(403).json({
                            error: 'Acceso bloqueado - IP identificada como maliciosa',
                            incidentId: crypto.randomBytes(8).toString('hex'),
                            threatIntel: {
                                source: 'AbuseIPDB',
                                confidence: abuseData.abuseConfidenceScore,
                                reports: abuseData.totalReports
                            }
                        });
                    }
                }

            } catch (error) {
                console.warn('⚠️ Error en threat intelligence:', error.message);
            }

            next();
        };
    }

    getClientIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.connection.socket?.remoteAddress || 'unknown';
    }

    logSecurityEvent(owaspCategory, eventType, details) {
        const securityEvent = {
            eventId: crypto.randomBytes(8).toString('hex'),
            timestamp: new Date().toISOString(),
            owaspCategory,
            eventType,
            details
        };

        // Mantener solo los últimos 1000 eventos
        this.securityEvents.push(securityEvent);
        if (this.securityEvents.length > 1000) {
            this.securityEvents = this.securityEvents.slice(-1000);
        }

        console.warn('🚨 OWASP Security Event:', securityEvent);
    }

    getOWASPProtections() {
        return [
            this.a01AccessControl(),
            this.a03InjectionProtection(),
            this.a10SSRFProtection(),
            this.advancedThreatIntelligence()
        ];
    }

    getSecurityReport() {
        return {
            owaspCoverage: Array.from(this.owaspProtections.values()),
            threatIntelligence: {
                abuseIPDB: this.threatIntelligence.abuseIPDB.enabled
            },
            totalEvents: this.securityEvents.length,
            recentEvents: this.securityEvents.slice(-10)
        };
    }
}

module.exports = new OWASPDefender();
