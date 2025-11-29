const fs = require('fs').promises;
const path = require('path');

/**
 * Sistema de logging avanzado para incidentes de seguridad
 */
class SecurityLogger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs/security');
        this.maxLogSize = 10 * 1024 * 1024; // 10MB
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
            
            // Crear archivo de log inicial si no existe
            const logFile = path.join(this.logDir, 'security.log');
            try {
                await fs.access(logFile);
            } catch {
                await fs.writeFile(logFile, '');
            }
        } catch (error) {
            console.error('❌ Error inicializando SecurityLogger:', error);
        }
    }

    /**
     * Registra un incidente de seguridad
     */
    async logIncident(level, type, details) {
        const timestamp = new Date().toISOString();
        const incidentId = require('crypto').randomBytes(8).toString('hex');
        
        const logEntry = {
            incidentId,
            timestamp,
            level: level.toUpperCase(),
            type,
            details: {
                ...details,
                environment: process.env.NODE_ENV || 'development'
            }
        };

        // Log a consola
        this.consoleLog(level, logEntry);

        // Log a archivo
        await this.fileLog(logEntry);

        // Log a sistema externo si está configurado
        await this.externalLog(logEntry);

        return incidentId;
    }

    /**
     * Log a consola con colores
     */
    consoleLog(level, logEntry) {
        const colors = {
            CRITICAL: '\x1b[31m', // Rojo
            HIGH: '\x1b[35m',     // Magenta
            MEDIUM: '\x1b[33m',   // Amarillo
            LOW: '\x1b[36m',      // Cian
            INFO: '\x1b[32m'      // Verde
        };

        const reset = '\x1b[0m';
        const color = colors[level] || '\x1b[37m';

        console.log(
            `${color}[${level}]${reset} ${logEntry.timestamp} - ${logEntry.type}\n` +
            `${color}Incident ID:${reset} ${logEntry.incidentId}\n` +
            `${color}Details:${reset}`, logEntry.details, '\n'
        );
    }

    /**
     * Log a archivo
     */
    async fileLog(logEntry) {
        try {
            const logFile = path.join(this.logDir, 'security.log');
            const logLine = JSON.stringify(logEntry) + '\n';

            // Verificar tamaño del archivo
            const stats = await fs.stat(logFile).catch(() => ({ size: 0 }));
            
            if (stats.size > this.maxLogSize) {
                await this.rotateLogs();
            }

            await fs.appendFile(logFile, logLine);
        } catch (error) {
            console.error('❌ Error escribiendo en log de seguridad:', error);
        }
    }

    /**
     * Rota los logs cuando alcanzan el tamaño máximo
     */
    async rotateLogs() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const oldFile = path.join(this.logDir, 'security.log');
            const newFile = path.join(this.logDir, `security-${timestamp}.log`);

            await fs.rename(oldFile, newFile);
            
            // Comprimir archivo viejo (opcional)
            await this.compressLogFile(newFile);
            
            // Mantener solo los últimos 10 archivos de log
            await this.cleanOldLogs();
        } catch (error) {
            console.error('❌ Error rotando logs:', error);
        }
    }

    /**
     * Comprime archivo de log (placeholder para implementación real)
     */
    async compressLogFile(filePath) {
        // Aquí podrías integrar compresión con zlib o similar
        console.log(`📦 Comprimiendo log: ${filePath}`);
    }

    /**
     * Limpia logs antiguos
     */
    async cleanOldLogs() {
        try {
            const files = await fs.readdir(this.logDir);
            const logFiles = files
                .filter(f => f.startsWith('security-') && f.endsWith('.log'))
                .map(f => ({
                    name: f,
                    path: path.join(this.logDir, f),
                    time: fs.statSync(path.join(this.logDir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);

            // Mantener solo los últimos 10 archivos
            if (logFiles.length > 10) {
                for (let i = 10; i < logFiles.length; i++) {
                    await fs.unlink(logFiles[i].path);
                }
            }
        } catch (error) {
            console.error('❌ Error limpiando logs antiguos:', error);
        }
    }

    /**
     * Log a sistema externo (SIEM, etc.)
     */
    async externalLog(logEntry) {
        // Integración con sistemas externos como SIEM, Splunk, etc.
        if (process.env.SECURITY_WEBHOOK_URL) {
            try {
                const fetch = require('node-fetch');
                await fetch(process.env.SECURITY_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logEntry)
                });
            } catch (error) {
                console.warn('⚠️ No se pudo enviar log a sistema externo:', error);
            }
        }
    }

    /**
     * Obtiene estadísticas de seguridad
     */
    async getSecurityStats() {
        try {
            const logFile = path.join(this.logDir, 'security.log');
            const data = await fs.readFile(logFile, 'utf8');
            const lines = data.trim().split('\n').filter(line => line);
            
            const incidents = lines.map(line => JSON.parse(line));
            
            const stats = {
                total: incidents.length,
                byLevel: {},
                byType: {},
                last24Hours: incidents.filter(inc => 
                    new Date(inc.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length,
                topIPs: this.getTopIPs(incidents)
            };

            incidents.forEach(inc => {
                stats.byLevel[inc.level] = (stats.byLevel[inc.level] || 0) + 1;
                stats.byType[inc.type] = (stats.byType[inc.type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return {};
        }
    }

    /**
     * Obtiene las IPs más frecuentes en incidentes
     */
    getTopIPs(incidents, limit = 10) {
        const ipCounts = {};
        
        incidents.forEach(inc => {
            const ip = inc.details.ip;
            if (ip && ip !== 'unknown') {
                ipCounts[ip] = (ipCounts[ip] || 0) + 1;
            }
        });

        return Object.entries(ipCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .reduce((obj, [ip, count]) => {
                obj[ip] = count;
                return obj;
            }, {});
    }
}

module.exports = new SecurityLogger();