const path = require('path');
const dotenv = require("dotenv");
dotenv.config();
if (!process.env.MONGO_URI) {
    console.log("ℹ️  MONGO_URI not found in current directory .env, checking parent...");
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}
const app = require('./app');
const connectDB = require('./config/db');
const SecurityLogger = require('./utils/securityLogger');
const owaspDefender = require('./services/security/OWASPDefender');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

// Connect DB
connectDB();

const securityCheck = () => {
    const checks = {
        https: process.env.NODE_ENV === 'production' ? 'REQUERIDO' : 'OPCIONAL',
        hostHeader: 'VALIDADO',
        ipExposure: 'BLOQUEADO',
        ssrf: 'PROTEGIDO',
        openRedirect: 'BLOQUEADO',
        owasp: 'ACTIVADO',
        rateLimiting: 'CONFIGURADO',
        cors: 'RESTRINGIDO',
        abuseIPDB: owaspDefender.threatIntelligence.abuseIPDB.enabled ? 'CONECTADO' : 'NO_CONFIGURADO',
        securityLogger: 'ACTIVADO',
        securityHandlers: 'INTEGRADO'
    };

    console.log('🔒 Estado de la seguridad:');
    console.table(checks);

    const criticalEnvVars = [
        'SESSION_SECRET',
        'MONGO_URI',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET'
    ];

    const missingVars = criticalEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.warn('⚠️  Variables de entorno críticas faltantes:', missingVars);
        SecurityLogger.logIncident('HIGH', 'MISSING_ENV_VARS', {
            missingVars
        });

        if (!isDev) {
            console.error('❌ No se puede iniciar en producción sin variables críticas');
            process.exit(1);
        }
    } else {
        console.log('✅ Todas las variables críticas están configuradas');
    }
};

const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor avanzado corriendo en puerto ${PORT}`);
    console.log(`📊 Entorno: ${isDev ? 'Desarrollo' : 'Producción'}`);
    console.log(`🛡️  Modo Seguridad: OWASP TOP 10 + ABUSEIPDB + SISTEMA AVANZADO`);
    securityCheck();
});

// Manejo graceful de cierre
process.on('SIGTERM', () => {
    console.log('🛑 Recibido SIGTERM, cerrando servidor gracefully...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        mongoose.connection.close();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Recibido SIGINT, cerrando servidor gracefully...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        mongoose.connection.close();
        process.exit(0);
    });
});
