# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0] - 2025-12-02

### 🎉 Added (Agregado)

#### Sistema de Filtrado Avanzado de Comentarios
- **Filtrado Multicapa**: 
  - Detección de palabras prohibidas con coincidencia exacta
  - Análisis fuzzy (similitud de strings) para detectar variaciones
  - Reconocimiento de metáforas sexuales contextuales
  - Identificación de frases ofensivas mediante expresiones regulares
- **Normalización Anti-Evasión**:
  - Conversión de leet speak (3 → e, 4 → a, etc.)
  - Reemplazo de homoglyphs (caracteres visualmente similares)
  - Eliminación de acentos y espacios extra
  - Colapso de caracteres repetidos
- **Archivos de Configuración**:
  - `config/palabrasProhibidas.json`: Lista extensa de palabras ofensivas
  - `config/patronesOfensivos.json`: Patrones contextuales y metáforas
  - `FILTRO_COMENTARIOS.md`: Documentación completa del sistema

#### Páginas de Error Personalizadas
- **Error 429 (Too Many Requests)**:
  - Vista EJS con diseño glassmorphism
  - Muestra IP pública del usuario (o "Desarrollo Local" en localhost)
  - Tiempo de espera dinámico según tipo de límite
  - Colores amarillo/dorado acorde al diseño principal
  - Soporte completo de CSP con nonces dinámicos
  - Botón funcional de vuelta al inicio
- **Detección Inteligente de IP**:
  - Lee headers de proxy (`x-forwarded-for`, `x-real-ip`)
  - Convierte IPv6-mapped a IPv4 limpio
  - Muestra mensaje amigable para localhost

#### Sistema de Rate Limiting Mejorado
- **RateLimitManager** centralizado con:
  - Detección inteligente de rutas
  - Limiters pre-creados en cache
  - Rate limits específicos por tipo de endpoint:
    - Auth: 10 req/15 min
    - Registro: 5 req/1 hora
    - Comentarios: 20 req/1 hora
    - Contacto: 5 req/1 hora
    - API general: 150 req/15 min
  - Redirección automática a página de error para navegadores
  - Respuesta JSON para peticiones de API

#### Seguridad CSP
- **Content Security Policy** con nonces dinámicos
- Soporte para inline scripts y estilos con nonce
- Plantillas EJS con acceso a `res.locals.nonce`
- Compatibilidad con reCAPTCHA y Google Fonts

#### Documentación
- `README.md` completamente actualizado
- `DEPLOYMENT.md` con guía paso a paso
- `CHANGELOG.md` (este archivo)
- Badges de tecnologías y licencia
- Estructura del proyecto documentada

### 🔧 Changed (Cambiado)

- **Rate Limiters**: Migrados de `config/securityConfig.js` a `middlewares/rateLimitHandlers.js`
- **App.js**: Ahora usa `RateLimitManager.intelligentRateLimit()` en lugar de limiters individuales
- **Detección de rutas**: Mejorada para cubrir todas las rutas de autenticación (`/api/auth/*`)
- **Mensajes de error**: Simplificados y sin emojis para mayor profesionalismo
- **Umbrales de fuzzy matching**:
  - Rechazo automático: 92% de similitud
  - Revisión manual: 82% de similitud

### 🐛 Fixed (Corregido)

- **CSP Violation**: Resuelto al usar plantillas EJS con nonces en lugar de HTML estático
- **Error 500** en página 429: Corregido al crear vista EJS correctamente
- **IP mostrada como `::1`**: Ahora muestra "Desarrollo Local (localhost)"
- **Botón de error 429**: Ya no viola CSP, funciona correctamente
- **Colores de página 429**: Actualizados a amarillo/dorado (#fee500, #ffd700)
- **Metáforas ofensivas**: Ahora se detectan y bloquean correctamente antes de guardar el comentario
- **Lógica de bloqueo**: Metáforas y frases ofensivas tienen prioridad sobre umbrales fuzzy

### 🔒 Security (Seguridad)

- **XSS Protection**: Detección y sanitización mejorada
- **NoSQL Injection**: Protección con mongoSanitize
- **Rate Limiting**: Límites más estrictos en rutas sensibles
- **Logging de Seguridad**: Todos los incidentes se registran en `logs/security/security.log`
- **Honeypot System**: Detecta y registra actividad de bots
- **OWASP Defender**: Integrado para protección contra amenazas comunes

## [1.5.0] - 2025-11-27

### Added
- Sistema de comentarios básico con MongoDB
- Autenticación Google OAuth 2.0
- Formulario de contacto con Nodemailer
- reCAPTCHA v2 integrado
- Rate limiting básico
- Páginas de error 404 y 500

### Changed
- Migración de archivos estáticos a estructura modular
- Configuración de seguridad con Helmet.js

## [1.0.0] - 2025-11-01

### Added
- Configuración inicial del proyecto
- Express.js server setup
- MongoDB connection
- Passport.js configuration
- Basic authentication routes
- Static file serving
- EJS view engine setup

---

## Tipos de Cambios

- **Added**: Nuevas características
- **Changed**: Cambios en funcionalidad existente
- **Deprecated**: Funcionalidad que pronto se eliminará
- **Removed**: Funcionalidad eliminada
- **Fixed**: Corrección de bugs
- **Security**: Mejoras de seguridad

## Convenciones de Commits

Este proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (sin afectar código)
- `refactor:` Refactorización de código
- `perf:` Mejoras de rendimiento
- `test:` Agregar o corregir tests
- `chore:` Cambios en build process o herramientas

## Links

- [Repository](https://github.com/tu-usuario/tu-repo)
- [Issues](https://github.com/tu-usuario/tu-repo/issues)
- [Pull Requests](https://github.com/tu-usuario/tu-repo/pulls)
