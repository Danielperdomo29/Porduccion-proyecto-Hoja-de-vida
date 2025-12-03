const SecurityLogger = require('../../utils/securityLogger');
const { SecurityResponseManager } = require('../../middlewares/securityHandlers');

/**
 * Middleware para proteger rutas sensibles con error 403 Forbidden
 * Muestra la IP pública del usuario que intenta acceder
 * 
 * @description Sistema de protección para rutas sensibles que no deberían
 * ser accesibles públicamente. Registra incidencias y muestra información
 * detallada del intento de acceso.
 */
const forbiddenRoutesProtection = (req, res, next) => {
    const securityManager = new SecurityResponseManager();

    // Lista de rutas sensibles que deben estar protegidas
    const forbiddenPaths = [
        // Archivos de logs y seguridad
        '/segurity.log',
        '/security.log',
        '/access.log',
        '/error.log',
        '/application.log',
        '/app.log',
        '/debug.log',
        '/system.log',
        '/audit.log',
        '/security-incidents.log',

        // Archivos de configuración sensibles
        '/.env',
        '/.env.local',
        '/.env.production',
        '/.env.development',
        '/config.json',
        '/config.yml',
        '/config.yaml',
        '/secrets.json',
        '/credentials.json',

        // Archivos del sistema
        '/server.log',
        '/server-errors.log',
        '/npm-debug.log',
        '/yarn-error.log',
        '/package-lock.json',
        '/composer.lock',

        // Directorios sensibles
        '/logs/',
        '/log/',
        '/.git/',
        '/.svn/',
        '/node_modules/',
        '/vendor/',

        // Archivos de backup
        '/backup.sql',
        '/database.sql',
        '/dump.sql',
        '/.sql',
        '/backup.zip',
        '/backup.tar.gz',

        // Archivos de base de datos
        '/db.sqlite',
        '/database.db',
        '/data.db',

        // Rutas administrativas
        '/server-status',
        '/server-info',
        '/phpinfo.php',
        '/info.php',

        // Archivos de deployment
        '/deploy.sh',
        '/deploy.log',
        '/deployment.log',
        '/.deployment',

        // Otros archivos sensibles
        '/private/',
        '/internal/',
        '/confidential/',
        '/.well-known/security.txt',

        // === NUEVAS RUTAS AGREGADAS ===

        // Archivos de documentación (revelan estructura interna y vulnerable)
        '/.md',
        '/README.md',
        '/CHANGELOG.md',
        '/CONTRIBUTING.md',
        '/LICENSE.md',
        '/TODO.md',
        '/DEPLOYMENT.md',
        '/SECURITY.md',
        '/ARCHITECTURE.md',
        '/API.md',
        '/DEVELOPMENT.md',
        '/INSTALL.md',
        '/USAGE.md',

        // Archivos de dependencias (revelan versiones y vulnerabilidades)
        '/package.json',
        '/composer.json',
        '/yarn.lock',
        '/pnpm-lock.yaml',
        '/Gemfile',
        '/Gemfile.lock',
        '/Pipfile',
        '/Pipfile.lock',
        '/requirements.txt',
        '/poetry.lock',
        '/go.mod',
        '/go.sum',
        '/cargo.toml',
        '/cargo.lock',

        // Archivos de configuración de frameworks
        '/.env.test',
        '/appsettings.json',
        '/web.config',
        '/app.config',

        // Archivos de npm/yarn
        '/.npmrc',
        '/.yarnrc',
        '/yarn-debug.log',

        // Directorios de IDEs y editores (contienen configuración del proyecto)
        '/.vscode/',
        '/.idea/',
        '/.vs/',
        '/.project',
        '/.settings/',
        '/.eclipse/',
        '/.netbeans/',

        // Directorios de build y cache
        '/coverage/',
        '/.next/',
        '/dist/',
        '/build/',
        '/out/',
        '/.nuxt/',
        '/.cache/',
        '/.parcel-cache/',

        // Backups adicionales
        '/backup.tar',
        '/.bak',
        '/.backup',
        '/db.backup',
        '/*.bak',

        // Bases de datos adicionales
        '/db.sqlite3',
        '/.db',
        '/*.sqlite',
        '/*.sqlite3',

        // Archivos de CI/CD y deployment
        '/Dockerfile',
        '/docker-compose.yml',
        '/docker-compose.yaml',
        '/.dockerignore',
        '/.gitlab-ci.yml',
        '/.travis.yml',
        '/Jenkinsfile',
        '/.circleci/',
        '/.github/',
        '/azure-pipelines.yml',

        // Archivos de testing (revelan estructura y endpoints)
        '/jest.config.js',
        '/jest.config.ts',
        '/vitest.config.js',
        '/playwright.config.js',
        '/cypress.json',
        '/.nyc_output/',
        '/test/',
        '/tests/',
        '/__tests__/',

        // Configuraciones de JavaScript/TypeScript
        '/tsconfig.json',
        '/jsconfig.json',
        '/webpack.config.js',
        '/vite.config.js',
        '/vite.config.ts',
        '/rollup.config.js',
        '/.babelrc',
        '/.babelrc.json',
        '/.eslintrc',
        '/.eslintrc.json',
        '/.prettierrc',
        '/.prettierrc.json',
        '/nodemon.json',

        // Source maps (revelan código fuente completo)
        '/.map',
        '/*.js.map',
        '/*.css.map',
        '/*.ts.map',
        '/source-maps/',
        '/sourcemaps/',

        // Certificados y keys
        '/.pem',
        '/.key',
        '/.crt',
        '/.cer',
        '/.p12',
        '/.pfx',
        '/private.key',
        '/public.key',
        '/ssl/',
        '/certs/',
        '/certificates/',

        // Archivos temporales
        '/.tmp',
        '/.temp',
        '/tmp/',
        '/temp/',
        '/uploads/tmp/',

        // Backups de editores
        '/.swp',
        '/.swo',
        '/*~',
        '/#*#',
        '/*.orig',

        // Archivos del sistema
        '/.DS_Store',
        '/Thumbs.db',
        '/desktop.ini',

        // Git/SVN adicionales
        '/.gitignore',
        '/.gitattributes',
        '/.gitmodules',
        '/.svn/',
        '/.hg/',
        '/CVS/',

        // Archivos de análisis y coverage
        '/coverage.json',
        '/lcov.info',
        '/.nyc_output/',

        // Archivos específicos de Node.js
        '/nodemon.json',
        '/pm2.config.js',
        '/ecosystem.config.js',

        // Archivos de base de datos adicionales
        '/*.mdb',
        '/*.accdb',
        '/migrations/',
        '/seeds/',

        // Archivos de logs adicionales
        '/*.log',
        '/logs/*.log',
        '/storage/logs/',

        // HTAccess y configuración de servidor
        '/.htaccess',
        '/.htpasswd',
        '/httpd.conf',
        '/nginx.conf',

        // Archivos de sesión
        '/sessions/',
        '/.sessions/',
        '/sess_*',

        // Sitemaps y robots (opcional, depende de la estrategia)
        // '/robots.txt',
        // '/sitemap.xml',

        // WordPress específico (si aplica)
        '/wp-config.php',
        '/wp-config-sample.php',

        // Archivos de Analytics y tracking
        '/google*.html',
        '/BingSiteAuth.xml',

        // Archivos de respaldo automático
        '/*_backup',
        '/*-backup',
        '/*.backup'
    ];

    const path = req.path.toLowerCase();
    const originalPath = req.path;

    // Verificar si la ruta coincide con alguna ruta prohibida
    const isForbidden = forbiddenPaths.some(forbiddenPath => {
        const normalizedForbiddenPath = forbiddenPath.toLowerCase();

        // Coincidencia exacta
        if (path === normalizedForbiddenPath) {
            return true;
        }

        // Coincidencia de rutas que terminan en /
        if (normalizedForbiddenPath.endsWith('/') && path.startsWith(normalizedForbiddenPath)) {
            return true;
        }

        // Coincidencia de extensiones
        if (normalizedForbiddenPath.startsWith('.') && path.endsWith(normalizedForbiddenPath)) {
            return true;
        }

        return false;
    });

    if (isForbidden) {
        // Obtener IP real del usuario
        let userIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.ip;

        // Limpiar formato IPv6
        if (!userIp || userIp === '::1' || userIp === '::ffff:127.0.0.1' || userIp === '127.0.0.1') {
            userIp = '127.0.0.1 (Localhost)';
        } else if (userIp && userIp.startsWith('::ffff:')) {
            userIp = userIp.replace('::ffff:', '');
        }

        // Log en consola
        console.warn('🚫 RUTA PROHIBIDA (403):', {
            ip: userIp,
            path: originalPath,
            method: req.method,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
            referer: req.get('Referer') || 'Direct Access',
            origin: req.get('Origin') || 'No Origin'
        });

        // Log en el sistema de seguridad
        SecurityLogger.logIncident('HIGH', 'FORBIDDEN_ROUTE_ACCESS', {
            ip: userIp,
            path: originalPath,
            method: req.method,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            origin: req.get('Origin'),
            timestamp: new Date().toISOString(),
            severity: 'HIGH',
            category: 'FORBIDDEN_ACCESS',
            description: `Intento de acceso a ruta sensible protegida: ${originalPath}`
        });

        // Generar página de error 403 con IP pública
        const securityPage = securityManager.generateSecurityPage('forbidden_route', {
            ip: userIp,
            path: originalPath,
            userAgent: req.get('User-Agent'),
            method: req.method,
            reason: 'Acceso a recurso prohibido',
            message: 'Este recurso está protegido por razones de seguridad.',
            timestamp: new Date().toISOString()
        }, res);

        // Headers adicionales de seguridad
        res.setHeader('X-Security-Incident', 'Forbidden-Route-Access');
        res.setHeader('X-Blocked-Path', originalPath);
        res.setHeader('X-Block-Reason', 'Sensitive-Resource');

        return res.status(403).send(securityPage);
    }

    next();
};

module.exports = forbiddenRoutesProtection;
