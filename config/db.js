const mongoose = require("mongoose");
const SecurityLogger = require('../utils/securityLogger');

const isDev = process.env.NODE_ENV !== "production";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is missing. Database connection skipped.");
        return;
    }

    try {
        console.log("🔗 Intentando conectar a MongoDB...");

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        };

        mongoose.connection.on('error', err => {
            console.error('❌ Error de MongoDB:', err.message);
            SecurityLogger.logIncident('HIGH', 'MONGODB_ERROR', {
                error: err.message
            });
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB desconectado');
            SecurityLogger.logIncident('MEDIUM', 'MONGODB_DISCONNECTED', {});
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconectado');
        });

        await mongoose.connect(process.env.MONGO_URI, options);
        console.log("✅ Conectado a MongoDB Atlas correctamente");

    } catch (error) {
        console.error("❌ Error crítico de conexión a MongoDB:", error.message);
        SecurityLogger.logIncident('CRITICAL', 'MONGODB_CONNECTION_FAILED', {
            error: error.message
        });

        if (!isDev) {
            console.log("🔄 Intentando reconexión en 10 segundos...");
            setTimeout(connectDB, 10000);
        }
    }
};

module.exports = connectDB;
