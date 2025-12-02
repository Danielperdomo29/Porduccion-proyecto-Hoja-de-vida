const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 * Sistema avanzado de manejo de errores y seguridad
 * Integrado con OWASP Defender existente
 */

class SecurityResponseManager {
    constructor() {
        this.incidentCount = 0;
        this.blockedIPs = new Map();
    }

    /**
     * Script para detección de IP pública en el cliente
     */
    getIpDetectionScript() {
        return `
        <script>
            async function getPublicIP() {
                const ipElements = document.querySelectorAll('.public-ip-display');
                if (ipElements.length === 0) return;

                try {
                    const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
                    const data = await response.text();
                    const ipMatch = data.match(/ip=(.+)/);
                    
                    if (ipMatch && ipMatch[1]) {
                        ipElements.forEach(el => el.textContent = ipMatch[1] + ' (Pública)');
                        return;
                    }
                } catch (e) {
                    console.log('Error fetching IP from Cloudflare');
                }

                try {
                    const response = await fetch('https://api.ipify.org?format=json');
                    const data = await response.json();
                    if (data.ip) {
                        ipElements.forEach(el => el.textContent = data.ip + ' (Pública)');
                    }
                } catch (e) {
                    console.log('Could not fetch public IP');
                }
            }
            // Ejecutar al cargar
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', getPublicIP);
            } else {
                getPublicIP();
            }
        </script>
        `;
    }

    /**
     * Página específica para honeypot
     */
    generateHoneypotPage(incidentId, details) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Restringido - Sistema de Seguridad</title>
    <style>
        ${this.getSecurityCSS()}
        .honeypot-info {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: left;
        }
        .bee-icon {
            font-size: 4rem;
            animation: buzz 2s ease-in-out infinite;
        }
        @keyframes buzz {
            0%, 100% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(5deg) scale(1.1); }
            75% { transform: rotate(-5deg) scale(1.1); }
        }
        .security-tips {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }
        .path-display {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.8rem;
            border-radius: 8px;
            border-left: 4px solid #ffcc00;
            margin: 1rem 0;
            word-break: break-all;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="security-container">
        <div class="bee-icon">🐝</div>
        <h1>ACCESO RESTRINGIDO</h1>
        <p class="subtitle">Sistema Honeypot Activado - Protección Avanzada</p>
        
        <div class="honeypot-info">
            <h3>🔍 ACTIVIDAD SOSPECHOSA DETECTADA</h3>
            <p>Se ha bloqueado el acceso a una ruta protegida por nuestro sistema de seguridad:</p>
            
            <div class="path-display">
                <strong>Ruta bloqueada:</strong><br>
                ${details.path}
            </div>
            
            <div class="incident-details">
                <div class="detail-item">
                    <strong>ID del Incidente:</strong>
                    <span class="incident-id">${incidentId}</span>
                </div>
                <div class="detail-item">
                    <strong>Timestamp:</strong>
                    <span class="incident-time">${new Date().toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <strong>Tipo de Protección:</strong>
                    <span class="incident-type">Sistema Honeypot</span>
                </div>
                <div class="detail-item">
                    <strong>Dirección IP:</strong>
                    <span class="public-ip-display">${details.ip}</span>
                </div>
            </div>
        </div>

        <div class="security-info">
            <h4>¿Qué es un Sistema Honeypot?</h4>
            <p>Es una medida de seguridad avanzada que simula recursos del sistema para detectar y monitorear intentos de acceso no autorizados. Esta actividad ha sido registrada para análisis de seguridad.</p>
            
            <div class="security-tips">
                <h5>Actividad Registrada:</h5>
                <ul>
                    <li>Intento de acceso a ruta protegida</li>
                    <li>Dirección IP monitoreada</li>
                    <li>Patrón de comportamiento analizado</li>
                    <li>Incidente registrado en logs de seguridad</li>
                </ul>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn btn-primary" onclick="window.location.href='/'">
                Ir al Inicio Seguro
            </button>
            <button class="btn btn-secondary" onclick="window.history.back()">
                Volver Atrás
            </button>
            <button class="btn btn-tertiary" onclick="window.close()">
                Cerrar Pestaña
            </button>
        </div>

        <div class="security-footer">
            <p>Sistema Honeypot Activado &middot; Monitoreo: ${incidentId} &middot; ${new Date().getFullYear()}</p>
        </div>
    </div>

    <script>
        // Prevenir acciones maliciosas
        if (window.history.replaceState) {
            window.history.replaceState(null, null, window.location.origin + '/');
        }
        
        // Log seguro en consola
        console.warn('🔒 Honeypot Protection: ${incidentId} - Access attempt to protected resource: ${details.path}');
        
        // Medidas de seguridad adicionales
        setTimeout(() => {
            console.log('🛡️  Sistema de seguridad activo - Todas las actividades son monitoreadas');
        }, 2000);
        
        // Bloquear funciones peligrosas
        const originalFetch = window.fetch;
        // Permitir fetch solo para detección de IP (excepción controlada)
        window.fetch = function(url, ...args) {
            if (url && (url.includes('cloudflare.com') || url.includes('ipify.org'))) {
                return originalFetch(url, ...args);
            }
            console.warn('🔒 Fetch bloqueado por seguridad del honeypot');
            return Promise.reject(new Error('Fetch bloqueado por seguridad'));
        };
    </script>
    ${this.getIpDetectionScript()}
</body>
</html>
    `;
    }

    /**
     * Genera página HTML personalizada para errores de seguridad
     */
    generateSecurityPage(incidentType, details, res) {
        const incidentId = crypto.randomBytes(8).toString('hex');
        const timestamp = new Date().toISOString();

        // Log del incidente
        console.warn(`🚨 ${incidentType.toUpperCase()} DETECTADO:`, {
            incidentId,
            timestamp,
            ip: details.ip,
            path: details.path,
            userAgent: details.userAgent,
            ...details
        });

        const securityPages = {
            injection_attempt: this.generateInjectionPage(incidentId, details),
            malicious_url: this.generateMaliciousUrlPage(incidentId, details),
            access_denied: this.generateAccessDeniedPage(incidentId, details),
            not_found: this.generateNotFoundPage(incidentId, details),
            rate_limit: this.generateRateLimitPage(incidentId, details),
            honeypot_triggered: this.generateHoneypotPage(incidentId, details)
        };

        // Detectar si es un honeypot y usar la página específica
        if (details.honeypot) {
            incidentType = 'honeypot_triggered';
        }

        const pageTemplate = securityPages[incidentType] || this.generateGenericSecurityPage(incidentId, details);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Security-Incident-ID', incidentId);
        res.setHeader('X-Security-Level', 'High');

        // Header adicional para honeypot
        if (details.honeypot) {
            res.setHeader('X-Honeypot-Triggered', 'true');
            res.setHeader('X-Security-Type', 'Honeypot');
        }

        return pageTemplate;
    }

    /**
     * Página para intentos de inyección
     */
    generateInjectionPage(incidentId, details) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Actividad Sospechosa Detectada - Sistema de Seguridad</title>
    <style>
        ${this.getSecurityCSS()}
    </style>
</head>
<body>
    <div class="security-container">
        <div class="warning-icon">🛡️</div>
        <h1>PROTECCIÓN ACTIVADA</h1>
        <p class="subtitle">Sistema de Seguridad OWASP - Intento de Inyección Bloqueado</p>
        
        <div class="incident-card">
            <h3>INCIDENTE DE SEGURIDAD REGISTRADO</h3>
            <p>Se ha detectado y bloqueado automáticamente un intento de inyección maliciosa.</p>
            
            <div class="incident-details">
                <div class="detail-item">
                    <strong>ID del Incidente:</strong>
                    <span class="incident-id">${incidentId}</span>
                </div>
                <div class="detail-item">
                    <strong>Tipo:</strong>
                    <span class="incident-type">Inyección de Código</span>
                </div>
                <div class="detail-item">
                    <strong>Timestamp:</strong>
                    <span class="incident-time">${new Date().toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <strong>Dirección IP:</strong>
                    <span class="public-ip-display">${details.ip}</span>
                </div>
                ${details.pattern ? `
                <div class="detail-item">
                    <strong>Patrón Detectado:</strong>
                    <code class="pattern">${details.pattern.substring(0, 50)}...</code>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="security-info">
            <h4>¿Por qué ocurre esto?</h4>
            <p>Nuestro sistema de seguridad ha identificado patrones maliciosos en la solicitud que coinciden con intentos de inyección de código.</p>
            
            <h4>Acciones Recomendadas:</h4>
            <ul>
                <li>Verifica que estás accediendo desde una fuente confiable</li>
                <li>No intentes eludir las medidas de seguridad</li>
                <li>Contacta al administrador si crees que esto es un error</li>
            </ul>
        </div>

        <div class="action-buttons">
            <button class="btn btn-primary" onclick="window.location.href='/'">
                <i class="fas fa-home"></i> Volver al Inicio Seguro
            </button>
            <button class="btn btn-secondary" onclick="window.history.back()">
                <i class="fas fa-arrow-left"></i> Regresar
            </button>
            <button class="btn btn-tertiary" onclick="window.close()">
                <i class="fas fa-times"></i> Cerrar
            </button>
        </div>

        <div class="security-footer">
            <p>Sistema protegido por OWASP Top 10 Security &middot; Incidente: ${incidentId}</p>
        </div>
    </div>

    <script>
        // Prevenir cualquier acción maliciosa
        if (window.history.replaceState) {
            window.history.replaceState(null, null, '/');
        }
        
        // Log seguro del incidente
        console.warn('🔒 Security Incident: ${incidentId} - Injection attempt blocked');
        
        // Deshabilitar funciones peligrosas
        ['eval', 'setTimeout', 'setInterval', 'Function'].forEach(func => {
            window[func] = function() { 
                console.warn('Función bloqueada por seguridad'); 
                return null;
            };
        });
    </script>
    ${this.getIpDetectionScript()}
</body>
</html>
        `;
    }

    /**
     * Página para URLs maliciosas
     */
    generateMaliciousUrlPage(incidentId, details) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>URL Bloqueada - Sistema de Seguridad</title>
    <style>
        ${this.getSecurityCSS()}
        .url-warning { 
            background: rgba(255, 68, 68, 0.1); 
            border: 1px solid #ff4444; 
            padding: 1rem; 
            border-radius: 8px; 
            margin: 1rem 0; 
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="security-container">
        <div class="warning-icon">🚫</div>
        <h1>URL BLOQUEADA POR SEGURIDAD</h1>
        <p class="subtitle">Protección contra enlaces maliciosos activada</p>
        
        <div class="incident-card">
            <h3>URL IDENTIFICADA COMO POTENCIALMENTE PELIGROSA</h3>
            
            <div class="url-warning">
                <strong>URL detectada:</strong><br>
                <code>${details.url?.substring(0, 200) || 'No disponible'}</code>
            </div>
            
            <div class="incident-details">
                <div class="detail-item">
                    <strong>ID del Incidente:</strong>
                    <span class="incident-id">${incidentId}</span>
                </div>
                <div class="detail-item">
                    <strong>Razón:</strong>
                    <span class="incident-type">Patrón malicioso en URL</span>
                </div>
                <div class="detail-item">
                    <strong>Timestamp:</strong>
                    <span class="incident-time">${new Date().toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <strong>Dirección IP:</strong>
                    <span class="public-ip-display">${details.ip}</span>
                </div>
            </div>
        </div>

        <div class="security-info">
            <h4>Medidas de Protección:</h4>
            <p>Esta URL contiene patrones que coinciden con técnicas de ataque conocidas. Por tu seguridad, el acceso ha sido bloqueado.</p>
            
            <div class="protection-tips">
                <h5>Consejos de Seguridad:</h5>
                <ul>
                    <li>No hagas clic en enlaces sospechosos</li>
                    <li>Verifica la fuente de los enlaces</li>
                    <li>Mantén tu navegador actualizado</li>
                    <li>Usa un antivirus actualizado</li>
                </ul>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn btn-primary" onclick="window.location.href='/'">
                <i class="fas fa-shield-alt"></i> Página Principal Segura
            </button>
            <button class="btn btn-secondary" onclick="if(confirm('¿Estás seguro de querer salir?')) window.close()">
                <i class="fas fa-power-off"></i> Salir
            </button>
        </div>
    </div>

    <script>
        // Limpiar historial de navegación
        if (window.history.replaceState) {
            window.history.replaceState(null, null, '/');
        }
        
        // Bloquear cualquier redirección
        window.location.replace = function() { 
            console.warn('Redirección bloqueada por seguridad'); 
            return false;
        };
        
        console.warn('🔒 Security Incident: ${incidentId} - Malicious URL blocked');
    </script>
    ${this.getIpDetectionScript()}
</body>
</html>
        `;
    }

    /**
     * Página 404 personalizada
     */
    generateNotFoundPage(incidentId, details) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página No Encontrada - Portfolio Profesional</title>
    <style>
        ${this.getSecurityCSS()}
        .search-suggestions {
            margin: 2rem 0;
            text-align: left;
        }
        .suggestion-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 0.75rem;
            margin: 0.5rem 0;
            border-radius: 8px;
            border-left: 3px solid var(--primary-color);
        }
    </style>
</head>
<body>
    <div class="security-container">
        <div class="warning-icon">🔍</div>
        <h1>PÁGINA NO ENCONTRADA</h1>
        <p class="subtitle">Error 404 - El recurso solicitado no existe</p>
        
        <div class="incident-card" style="border-color: #6c63ff;">
            <h3>¿Te has perdido?</h3>
            <p>La página que estás buscando no existe o ha sido movida.</p>
            
            <div class="incident-details">
                <div class="detail-item">
                    <strong>Recurso solicitado:</strong>
                    <code>${details.path || 'No disponible'}</code>
                </div>
                <div class="detail-item">
                    <strong>Timestamp:</strong>
                    <span class="incident-time">${new Date().toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <strong>Dirección IP:</strong>
                    <span class="public-ip-display">${details.ip}</span>
                </div>
            </div>
        </div>

        <div class="search-suggestions">
            <h4>Te sugerimos visitar:</h4>
            
            <div class="suggestion-item">
                <strong>🏠 Página Principal</strong><br>
                <small>Volver al inicio del portfolio</small>
                <button onclick="window.location.href='/'" class="btn-link">Ir al Inicio</button>
            </div>
            
            <div class="suggestion-item">
                <strong>💼 Proyectos Destacados</strong><br>
                <small>Explora mis trabajos más recientes</small>
                <button onclick="window.location.href='/#proyectos'" class="btn-link">Ver Proyectos</button>
            </div>
            
            <div class="suggestion-item">
                <strong>📧 Contacto</strong><br>
                <small>Ponte en contacto conmigo</small>
                <button onclick="window.location.href='/#contacto'" class="btn-link">Contactar</button>
            </div>
            
            <div class="suggestion-item">
                <strong>👨‍💻 Sobre Mí</strong><br>
                <small>Conoce más sobre mi experiencia</small>
                <button onclick="window.location.href='/#perfil'" class="btn-link">Ver Perfil</button>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn btn-primary" onclick="window.location.href='/'">
                <i class="fas fa-home"></i> Ir al Inicio
            </button>
            <button class="btn btn-secondary" onclick="window.history.back()">
                <i class="fas fa-arrow-left"></i> Página Anterior
            </button>
        </div>

        <div class="security-footer">
            <p>Si crees que esto es un error, <a href="/#contacto" style="color: #ffcc00;">contacta al administrador</a></p>
        </div>
    </div>

    <script>
        // Analytics seguro para 404
        console.log('🔍 404 - Página no encontrada: ${details.path}');
        
        // Sugerir búsqueda
        setTimeout(() => {
            if (window.location.pathname.length > 1) {
                const searchTerm = window.location.pathname.split('/').pop();
                console.log('💡 Sugerencia: Buscar término:', searchTerm);
            }
        }, 1000);
    </script>
    ${this.getIpDetectionScript()}
</body>
</html>
        `;
    }

    /**
     * CSS común para todas las páginas de seguridad
     */
    getSecurityCSS() {
        return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            line-height: 1.6;
        }
        .security-container {
            background: linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
            border: 2px solid #ffcc00;
            border-radius: 20px;
            padding: 3rem;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(255, 204, 0, 0.3);
            text-align: center;
            backdrop-filter: blur(20px);
            animation: securityPulse 3s ease-in-out infinite;
        }
        @keyframes securityPulse {
            0%, 100% { box-shadow: 0 20px 60px rgba(255, 204, 0, 0.3); }
            50% { box-shadow: 0 20px 80px rgba(255, 204, 0, 0.6); }
        }
        .warning-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        h1 { 
            color: #ffcc00; 
            font-size: 2.5rem; 
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #ffcc00 0%, #ffaa00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle { 
            color: #e9ecef; 
            font-size: 1.4rem; 
            margin-bottom: 2rem;
            font-weight: 300;
        }
        .incident-card {
            background: rgba(255, 204, 0, 0.1);
            border: 1px solid rgba(255, 204, 0, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
        }
        .incident-details {
            margin-top: 1rem;
        }
        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .incident-id {
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: #ffcc00;
            word-break: break-all;
        }
        .action-buttons {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .btn-primary {
            background: linear-gradient(135deg, #ffcc00 0%, #ffaa00 100%);
            color: #000;
        }
        .btn-secondary {
            background: transparent;
            color: #ffcc00;
            border: 2px solid #ffcc00;
        }
        .btn-tertiary {
            background: rgba(255, 255, 255, 0.1);
            color: #adb5bd;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 25px rgba(255, 204, 0, 0.4); 
        }
        .btn-link {
            background: none;
            border: none;
            color: #ffcc00;
            text-decoration: underline;
            cursor: pointer;
            margin-top: 0.5rem;
        }
        .security-info {
            text-align: left;
            margin: 2rem 0;
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: 12px;
        }
        .security-footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #adb5bd;
            font-size: 0.9rem;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #ff6b6b;
        }
        @media (max-width: 768px) {
            .security-container { padding: 2rem 1.5rem; }
            h1 { font-size: 2rem; }
            .subtitle { font-size: 1.2rem; }
            .action-buttons { flex-direction: column; }
            .btn { width: 100%; justify-content: center; }
            .detail-item { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
        `;
    }

    generateAccessDeniedPage(incidentId, details) {
        // Si es un honeypot, usar la página específica
        if (details.honeypot) {
            return this.generateHoneypotPage(incidentId, details);
        }

        // Si no es honeypot, usar la página de acceso denegado normal
        return this.generateGenericSecurityPage(incidentId, {
            ...details,
            title: "ACCESO DENEGADO",
            subtitle: "No tienes permisos para acceder a este recurso",
            message: "El acceso a este recurso ha sido restringido por políticas de seguridad."
        });
    }

    generateRateLimitPage(incidentId, details) {
        // Implementación similar para límite de tasa
        return this.generateGenericSecurityPage(incidentId, {
            ...details,
            title: "LÍMITE DE SOLICITUDES EXCEDIDO",
            subtitle: "Demasiadas solicitudes desde tu dirección IP",
            message: "Por favor, espera unos minutos antes de intentar nuevamente."
        });
    }

    generateGenericSecurityPage(incidentId, details) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${details.title || 'Incidente de Seguridad'}</title>
    <style>${this.getSecurityCSS()}</style>
</head>
<body>
    <div class="security-container">
        <div class="warning-icon">⚠️</div>
        <h1>${details.title || 'INCIDENTE DE SEGURIDAD'}</h1>
        <p class="subtitle">${details.subtitle || 'Sistema de protección activado'}</p>
        
        <div class="incident-card">
            <h3>DETALLES DEL INCIDENTE</h3>
            <p>${details.message || 'Se ha detectado una actividad inusual y se ha aplicado protección automática.'}</p>
            
            <div class="incident-details">
                <div class="detail-item">
                    <strong>ID del Incidente:</strong>
                    <span class="incident-id">${incidentId}</span>
                </div>
                <div class="detail-item">
                    <strong>Timestamp:</strong>
                    <span class="incident-time">${new Date().toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <strong>Dirección IP:</strong>
                    <span class="public-ip-display">${details.ip}</span>
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn btn-primary" onclick="window.location.href='/'">
                <i class="fas fa-home"></i> Página Principal
            </button>
            <button class="btn btn-secondary" onclick="window.history.back()">
                <i class="fas fa-arrow-left"></i> Regresar
            </button>
        </div>
    </div>
    ${this.getIpDetectionScript()}
</body>
</html>
        `;
    }
}

/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
    const securityManager = new SecurityResponseManager();

    console.error('🔥 Error no manejado:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        ip: req.ip,
        method: req.method
    });

    // Determinar tipo de error
    let errorType = 'generic';
    let statusCode = err.status || 500;

    if (err.message.includes('injection') || err.message.includes('malicious')) {
        errorType = 'injection_attempt';
        statusCode = 403;
    } else if (statusCode === 404) {
        errorType = 'not_found';
    } else if (statusCode === 403) {
        errorType = 'access_denied';
    } else if (statusCode === 429) {
        errorType = 'rate_limit';
    }

    const errorDetails = {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        method: req.method,
        error: err.message,
        ...(err.details || {})
    };

    const securityPage = securityManager.generateSecurityPage(errorType, errorDetails, res);

    res.status(statusCode).send(securityPage);
};

/**
 * Middleware para capturar URLs maliciosas
 */
const maliciousUrlCatcher = (req, res, next) => {
    const securityManager = new SecurityResponseManager();
    const path = req.path.toLowerCase();
    const fullUrl = req.originalUrl.toLowerCase();

    const maliciousPatterns = [
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^>]*>/gi,
        /<object\b[^>]*>/gi,
        /<embed\b[^>]*>/gi,
        /<img\b[^>]*\bonerror\s*=/gi,
        /<img\b[^>]*\bonsrc\s*=/gi,
        /(\b)(alert|prompt|confirm)\s*\(/gi,
        /\.\.\//g,
        /\/etc\//g,
        /\/var\//g,
        /\.env/g,
        /\.git/g,
        /wp-admin/g,
        /wp-login/g,
        /phpmyadmin/g,
        /eval\(/g,
        /exec\(/g,
        /union\s+select/g
    ];

    const isMalicious = maliciousPatterns.some(pattern => pattern.test(fullUrl));

    if (isMalicious) {
        const securityPage = securityManager.generateSecurityPage('malicious_url', {
            ip: req.ip,
            path: req.path,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            pattern: 'Malicious URL Pattern Detected'
        }, res);

        return res.status(403).send(securityPage);
    }

    next();
};

/**
 * Middleware para manejar 404
 */
const notFoundHandler = (req, res, next) => {
    const securityManager = new SecurityResponseManager();

    // Si acepta HTML, enviar página bonita
    if (req.accepts('html')) {
        const securityPage = securityManager.generateSecurityPage('not_found', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
        }, res);
        return res.status(404).send(securityPage);
    }

    // Si es API, enviar JSON
    res.status(404).json({
        error: 'Not Found',
        message: 'El recurso solicitado no existe',
        path: req.path
    });
};

module.exports = {
    SecurityResponseManager,
    errorHandler,
    maliciousUrlCatcher,
    notFoundHandler
};