# Sistema de Protección de Rutas Sensibles (403 Forbidden)

## 📋 Descripción

Sistema de seguridad avanzado que protege rutas sensibles del servidor, mostrando la **IP pública del usuario** y **registrando incidencias de seguridad** cuando se intenta acceder a recursos prohibidos.

## 🎯 Características Principales

### 1. **Protección de Rutas Sensibles**
- ✅ Bloqueo automático de rutas sensibles con error **403 Forbidden**
- ✅ Detección y registro de la **IP pública real** del usuario
- ✅ Logging completo en el sistema de seguridad
- ✅ Interfaz visual profesional con información del incidente

### 2. **Detección de IP Pública**
- Script del lado del cliente que detecta la IP pública
- Fallback a múltiples servicios (Cloudflare, ipify.org)
- Manejo de IPs locales y IPv6
- Actualización dinámica en la interfaz

### 3. **Registro de Incidencias**
Para cada intento de acceso a ruta prohibida se registra:
- 🔍 ID único del incidente
- 🌐 Dirección IP pública del usuario
- 📍 Ruta exacta solicitada
- 🕒 Timestamp preciso
- 🖥️ User-Agent (navegador y sistema operativo)
- 🔗 Referer y Origin
- 📝 Método HTTP utilizado

## 🗂️ Rutas Protegidas

### **Archivos de Logs**
```
/segurity.log
/security.log
/access.log
/error.log
/application.log
/app.log
/debug.log
/system.log
/audit.log
/security-incidents.log
```

### **Archivos de Configuración**
```
/.env
/.env.local
/.env.production
/.env.development
/config.json
/config.yml
/config.yaml
/secrets.json
/credentials.json
```

### **Archivos del Sistema**
```
/server.log
/server-errors.log
/npm-debug.log
/yarn-error.log
/package-lock.json
/composer.lock
```

### **Directorios Sensibles**
```
/logs/
/log/
/.git/
/.svn/
/node_modules/
/vendor/
```

### **Archivos de Backup**
```
/backup.sql
/database.sql
/dump.sql
/*.sql
/backup.zip
/backup.tar.gz
```

### **Archivos de Base de Datos**
```
/db.sqlite
/database.db
/data.db
```

### **Rutas Administrativas**
```
/server-status
/server-info
/phpinfo.php
/info.php
```

### **Archivos de Deployment**
```
/deploy.sh
/deploy.log
/deployment.log
/.deployment
```

### **Otros Archivos Sensibles**
```
/private/
/internal/
/confidential/
/.well-known/security.txt
```

## 🏗️ Arquitectura

### Flujo de Seguridad
```
Usuario → Request
    ↓
Obfuscation Middleware
    ↓
Honeypot Middleware
    ↓
Forbidden Routes Protection ← NUEVO
    ↓
Malicious URL Catcher
    ↓
Rate Limiting
    ↓
Application
```

### Componentes

#### 1. **forbiddenRoutes.js**
- Middleware principal
- Lista configurable de rutas prohibidas
- Detección con coincidencia exacta, prefijos y extensiones
- Logging avanzado de incidencias

#### 2. **securityHandlers.js**
- Método `generateForbiddenRoutePage()`
- Página HTML personalizada para 403
- Script de detección de IP pública
- Medidas de seguridad adicionales en el cliente

#### 3. **SecurityLogger**
- Registro estructurado de incidencias
- Nivel de severidad: HIGH
- Categoría: FORBIDDEN_ROUTE_ACCESS

## 🔐 Buenas Prácticas Implementadas

### 1. **Defensa en Profundidad (Defense in Depth)**
- Múltiples capas de seguridad
- Protección redundante
- Logging completo en cada capa

### 2. **Least Privilege (Mínimo Privilegio)**
- Bloqueo por defecto de rutas sensibles
- Acceso explícito solo a recursos públicos

### 3. **Security by Obscurity (Complementario)**
- No revelar estructura interna
- Mensajes de error informativos pero no reveladores

### 4. **Logging y Auditoría**
- Registro completo de todos los intentos
- Timestamps precisos
- Información completa del usuario

### 5. **Fail Secure (Fallo Seguro)**
- Si hay duda, bloquear
- Errores se manejan de forma segura

### 6. **Separación de Responsabilidades**
- Middleware dedicado para cada tipo de protección
- Código modular y mantenible

## 📊 Ejemplo de Incidente Registrado

```javascript
{
  severity: 'HIGH',
  category: 'FORBIDDEN_ROUTE_ACCESS',
  ip: '203.0.113.42',
  path: '/segurity.log',
  method: 'GET',
  userAgent: 'Mozilla/5.0...',
  referer: 'https://example.com',
  origin: 'https://example.com',
  timestamp: '2025-12-02T14:23:17.000Z',
  description: 'Intento de acceso a ruta sensible protegida: /segurity.log'
}
```

## 🎨 Interfaz de Usuario (403)

### Elementos Visuales
- 🔒 Icono de candado animado
- 🚫 Badge de incidente de seguridad
- 📋 Detalles completos del incidente
- 💡 Información educativa sobre recursos protegidos
- 🔘 Botones de acción (Inicio, Atrás, Cerrar)

### Información Mostrada
1. **ID del Incidente** - Identificador único
2. **Tipo** - "Acceso a Recurso Prohibido (403 Forbidden)"
3. **Timestamp** - Fecha y hora del incidente
4. **Dirección IP** - IP pública del usuario
5. **Método HTTP** - GET, POST, etc.
6. **Ruta Bloqueada** - Path exacto solicitado

## 🔧 Configuración

### Agregar Nuevas Rutas Prohibidas

Editar `forbiddenRoutes.js`:

```javascript
const forbiddenPaths = [
    // Agregar nuevas rutas aquí
    '/nueva-ruta',
    '/otro-archivo.log',
    // ...
];
```

### Tipos de Coincidencia

1. **Exacta**: `/segurity.log` → Bloquea solo esa ruta exacta
2. **Prefijo**: `/logs/` → Bloquea todo lo que empiece con `/logs/`
3. **Extensión**: `.log` → Bloquea todos los archivos `.log`

## 🧪 Testing

### Probar la Protección

```bash
# Prueba 1: Acceso a archivo de log
curl -I https://danielper29.alwaysdata.net/segurity.log
# Esperado: HTTP/1.1 403 Forbidden

# Prueba 2: Acceso a archivo .env
curl -I https://danielper29.alwaysdata.net/.env
# Esperado: HTTP/1.1 403 Forbidden

# Prueba 3: Acceso a directorio de logs
curl -I https://danielper29.alwaysdata.net/logs/app.log
# Esperado: HTTP/1.1 403 Forbidden
```

### Verificar Logging

```javascript
// Ver logs en consola del servidor
console.log('🚫 RUTA PROHIBIDA (403):', { ... });

// Ver logs en sistema de seguridad
SecurityLogger.logIncident('HIGH', 'FORBIDDEN_ROUTE_ACCESS', { ... });
```

## 📈 Monitoreo y Análisis

### Métricas Importantes
- Número de intentos de acceso a rutas prohibidas
- IPs más frecuentes
- Rutas más solicitadas
- Patrones de ataque

### Alertas Recomendadas
- ⚠️ Múltiples intentos desde la misma IP
- 🚨 Intentos a múltiples rutas sensibles
- 📊 Picos inusuales de tráfico a rutas prohibidas

## 🔄 Diferencias con Honeypot

| Característica | Honeypot | Forbidden Routes |
|----------------|----------|------------------|
| **Código HTTP** | 404 Not Found | 403 Forbidden |
| **Propósito** | Detectar bots y atacantes | Proteger recursos sensibles |
| **Rutas** | Rutas administrativas comunes | Archivos y directorios reales |
| **Severidad** | MEDIUM | HIGH |
| **Respuesta** | Simula recurso inexistente | Informa de acceso prohibido |

## 🛡️ Seguridad del Cliente

### Medidas Implementadas
```javascript
// 1. Limpiar historial de navegación
window.history.replaceState(null, null, '/');

// 2. Bloqueo de funciones peligrosas
['eval', 'setTimeout', 'setInterval', 'Function']
  .forEach(func => window[func] = blocked);

// 3. Excepción solo para detección de IP
if (func === 'setTimeout' && includesGetPublicIP) {
  return original(...args);
}
```

## 📝 Mantenimiento

### Actualizar Lista de Rutas
1. Revisar logs de intentos de acceso
2. Identificar nuevos patrones de ataque
3. Agregar rutas a la lista en `forbiddenRoutes.js`
4. Reiniciar servidor
5. Probar nueva configuración

### Revisión Periódica
- ✅ Revisar logs semanalmente
- ✅ Actualizar lista de rutas mensualmente
- ✅ Analizar métricas de seguridad
- ✅ Ajustar políticas según necesidad

## 🔗 Referencias

### Estándares de Seguridad
- OWASP Top 10
- CWE-548: Information Exposure Through Directory Listing
- CWE-552: Files or Directories Accessible to External Parties

### Recursos Adicionales
- [OWASP Secure Coding Practices](https://owasp.org)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## ✅ Checklist de Implementación

- [x] Creado middleware `forbiddenRoutes.js`
- [x] Agregado método `generateForbiddenRoutePage()` en `securityHandlers.js`
- [x] Integrado middleware en `app.js`
- [x] Configuradas rutas sensibles
- [x] Implementada detección de IP pública
- [x] Configurado logging de incidencias
- [x] Documentación completa
- [ ] Testing en producción
- [ ] Monitoreo y alertas configuradas
- [ ] Revisión de seguridad completada

## 🎯 Próximos Pasos

1. **Monitoreo Activo**: Configurar alertas en tiempo real
2. **Geolocalización**: Agregar ubicación geográfica de las IPs
3. **Rate Limiting específico**: Bloquear IPs con múltiples intentos
4. **Dashboard**: Panel de visualización de incidencias
5. **ML Detection**: Detección automática de patrones de ataque

---

**Fecha de Implementación**: 2025-12-02  
**Versión**: 1.0.0  
**Autor**: Sistema de Seguridad  
**Estado**: ✅ Activo
