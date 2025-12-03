/**
 * Script de prueba para el sistema de protección de rutas sensibles
 * 
 * Este script permite verificar que el middleware de forbidden routes
 * está funcionando correctamente.
 */

const testRoutes = [
    // Archivos de logs
    '/segurity.log',
    '/security.log',
    '/access.log',
    '/error.log',

    // Archivos de configuración
    '/.env',
    '/.env.local',
    '/config.json',

    // Archivos de backup
    '/backup.sql',
    '/database.sql',

    // Directorios sensibles
    '/logs/app.log',
    '/.git/config',
    '/node_modules/package.json',
];

console.log('🧪 Testing Forbidden Routes Protection\n');
console.log('Lista de rutas a probar:\n');

testRoutes.forEach((route, index) => {
    console.log(`${index + 1}. ${route}`);
});

console.log('\n✅ Para probar, accede a estas rutas en tu navegador:');
console.log('   https://danielper29.alwaysdata.net[RUTA]');
console.log('\n📋 Esperado: Error 403 Forbidden con IP pública visible\n');

module.exports = testRoutes;
