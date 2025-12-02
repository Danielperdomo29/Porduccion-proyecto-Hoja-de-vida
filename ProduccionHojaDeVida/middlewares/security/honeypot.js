const SecurityLogger = require('../../utils/securityLogger');
const { SecurityResponseManager } = require('../../middlewares/securityHandlers');

const honeyPotSystem = (req, res, next) => {
    const honeyPotPaths = [
        '/admin', '/wp-admin', '/phpmyadmin', '/mysql', '/dbadmin',
        '/administrator', '/backup', '/.git', '/.env', '/config',
        '/shell', '/cgi-bin', '/.well-known', '/hidden', '/secret',
        '/cpanel', '/webadmin', '/phpadmin', '/database',
        '/backups', '/logs', '/tmp', '/temp', '/upload',
        '/uploads', '/install', '/setup', '/debug',
        '/api/test', '/api/debug', '/test', '/demo',
        '/_admin', '/_phpmyadmin', '/phpMyAdmin', '/pma',
        '/myadmin', '/sql', '/db', '/databaseadmin',
        '/webdav', '/ftp', '/.ssh', '/.htaccess',
        '/.htpasswd', '/wp-login.php', '/xmlrpc.php'
    ];

    const path = req.path.toLowerCase();

    if (honeyPotPaths.some(honeyPath => path.includes(honeyPath.toLowerCase()))) {
        const securityManager = new SecurityResponseManager();

        console.warn('HONEYPOT ACTIVADO:', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });

        // Log en el nuevo sistema
        SecurityLogger.logIncident('MEDIUM', 'HONEYPOT_TRIGGERED', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
        });

        // Usar el SecurityResponseManager para generar página HTML específica
        const securityPage = securityManager.generateSecurityPage('access_denied', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent'),
            method: req.method,
            honeypot: true,
            reason: 'Ruta protegida por sistema honeypot',
            message: 'Este incidente ha sido monitoreado y registrado por nuestro sistema de seguridad.'
        }, res);

        return res.status(404).send(securityPage);
    }

    next();
};

module.exports = honeyPotSystem;
