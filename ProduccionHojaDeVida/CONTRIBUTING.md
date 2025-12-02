# Contribuyendo al Proyecto

¡Gracias por tu interés en contribuir! Este documento proporciona pautas para contribuir al proyecto.

## 📋 Código de Conducta

Al participar en este proyecto, te comprometes a mantener un ambiente respetuoso y profesional.

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor abre un [Issue](https://github.com/tu-usuario/tu-repo/issues) con:

1. **Título descriptivo**
2. **Pasos para reproducir** el problema
3. **Comportamiento esperado** vs **comportamiento actual**
4. **Capturas de pantalla** (si aplica)
5. **Entorno**:
   - OS: Windows/Linux/Mac
   - Node version: `node --version`
   - npm version: `npm --version`

### Sugerir Mejoras

Para sugerir nuevas características:

1. Abre un Issue con el tag `enhancement`
2. Describe claramente el problema que resuelve
3. Propón una solución detallada
4. Espera feedback antes de empezar a codear

### Pull Requests

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-caracteristica
   ```
3. **Haz commits** siguiendo [Conventional Commits](#conventional-commits)
4. **Escribe tests** para tu código (si aplica)
5. **Actualiza documentación** si es necesario
6. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-caracteristica
   ```
7. **Abre un Pull Request** con descripción detallada

## 📝 Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial limpio:

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma faltante, etc (sin afectar código)
- `refactor`: Refactorización sin cambiar funcionalidad
- `perf`: Mejoras de rendimiento
- `test`: Agregar o corregir tests
- `chore`: Cambios en proceso de build, herramientas, etc
- `ci`: Cambios en CI/CD
- `build`: Cambios en sistema de build

### Ejemplos

```bash
feat(comments): add fuzzy matching for offensive words
fix(auth): resolve OAuth callback redirect issue
docs(readme): update installation instructions
refactor(rate-limit): centralize limiter configuration
```

## 🧪 Testing

Antes de hacer commit, asegúrate de que:

```bash
# Código funciona en desarrollo
npm run dev

# No hay errores de linting (si está configurado)
npm run lint

# Tests pasan (cuando estén implementados)
npm test
```

## 📁 Estructura del Código

### Agregar Nueva Ruta

1. Crea el archivo de ruta en `routes/`:
```javascript
// routes/miRuta.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Mi ruta' });
});

module.exports = router;
```

2. Registra en `app.js`:
```javascript
const miRuta = require('./routes/miRuta');
app.use('/api/mi-ruta', miRuta);
```

### Agregar Nuevo Middleware

1. Crea en `middlewares/`:
```javascript
// middlewares/miMiddleware.js
module.exports = (req, res, next) => {
  // Tu lógica aquí
  next();
};
```

2. Usa en rutas o `app.js`:
```javascript
const miMiddleware = require('./middlewares/miMiddleware');
app.use(miMiddleware);
```

### Agregar Nuevo Modelo

```javascript
// models/MiModelo.js
const mongoose = require('mongoose');

const miSchema = new mongoose.Schema({
  campo: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MiModelo', miSchema);
```

## 🎨 Estilo de Código

### JavaScript

- Usar `const` para variables que no se reasignan
- Usar `let` para variables que sí se reasignan
- Evitar `var`
- Indentación: 2 espacios (o 4 según configuración del proyecto)
- Punto y coma al final de statements
- Usar comillas simples `'` para strings
- Usar template literals para concatenación

```javascript
// ✅ Bien
const userName = 'Daniel';
const greeting = `Hola, ${userName}`;

// ❌ Mal
var userName = "Daniel";
const greeting = 'Hola, ' + userName;
```

### Nombres de Variables

- **camelCase** para variables y funciones: `miVariable`, `miFuncion()`
- **PascalCase** para clases: `MiClase`
- **UPPER_SNAKE_CASE** para constantes: `MAX_RETRY_ATTEMPTS`
- Nombres descriptivos (evitar `x`, `temp`, `data`)

```javascript
// ✅ Bien
const userEmail = 'user@example.com';
const MAX_LOGIN_ATTEMPTS = 5;
class UserController { }

// ❌ Mal
const x = 'user@example.com';
const MaxLoginAttempts = 5;
class usercontroller { }
```

### Comentarios

Usa comentarios para explicar **por qué**, no **qué**:

```javascript
// ✅ Bien
// Usamos fuzzy matching porque los usuarios intentan evadir con variaciones
const similarity = compareTwoStrings(text, forbiddenWord);

// ❌ Mal
// Compara dos strings
const similarity = compareTwoStrings(text, forbiddenWord);
```

## 🔒 Seguridad

### Nunca commitees:

- ❌ Credenciales (API keys, passwords)
- ❌ Archivos `.env`
- ❌ Tokens de acceso
- ❌ Datos de usuarios reales

### Siempre:

- ✅ Usa `.env` para secretos
- ✅ Agrega archivos sensibles a `.gitignore`
- ✅ Valida inputs del usuario
- ✅ Sanitiza datos antes de guardar en DB
- ✅ Usa HTTPS en producción

## 📚 Documentación

### Comentarios JSDoc

Para funciones complejas, usa JSDoc:

```javascript
/**
 * Detecta palabras ofensivas usando fuzzy matching
 * @param {string} text - Texto a analizar
 * @param {string[]} forbiddenWords - Lista de palabras prohibidas
 * @param {number} threshold - Umbral de similitud (0-1)
 * @returns {Object|null} Detección con match y score, o null
 */
function detectOffensiveWord(text, forbiddenWords, threshold) {
  // ...
}
```

### README Updates

Si agregas una característica importante:

1. Actualiza `README.md` con:
   - Descripción de la característica
   - Ejemplo de uso
   - Configuración necesaria
2. Actualiza `CHANGELOG.md`
3. Actualiza `DEPLOYMENT.md` si afecta despliegue

## 🏷️ Versioning

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (1.0.0 → 1.1.0): Nueva funcionalidad compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes compatibles

## ✅ Checklist Pre-PR

Antes de abrir un Pull Request:

- [ ] Código funciona correctamente
- [ ] No hay console.logs de debug
- [ ] Comentarios actualizados
- [ ] README actualizado (si aplica)
- [ ] CHANGELOG actualizado
- [ ] Commits siguen Conventional Commits
- [ ] Branch está actualizada con `main`
- [ ] Descripción del PR es clara

## 🤝 Revisión de Código

Tu PR será revisado considerando:

1. **Funcionalidad**: ¿Cumple con el objetivo?
2. **Calidad**: ¿Sigue las mejores prácticas?
3. **Seguridad**: ¿Hay vulnerabilidades?
4. **Rendimiento**: ¿Es eficiente?
5. **Mantenibilidad**: ¿Es fácil de entender y modificar?

## 💬 Comunicación

- **Issues**: Para bugs y sugerencias
- **Discussions**: Para preguntas generales
- **Pull Requests**: Solo para código

## 🎯 Prioridades

### Alta Prioridad

- Bugs de seguridad
- Errores críticos que bloquean usuarios
- Vulnerabilidades reportadas

### Media Prioridad

- Nuevas características solicitadas
- Mejoras de rendimiento
- Refactorización de código

### Baja Prioridad

- Mejoras cosméticas
- Actualizaciones de dependencias
- Optimizaciones menores

## 📞 Soporte

Si necesitas ayuda:

1. Revisa la documentación existente
2. Busca en Issues cerrados
3. Abre un nuevo Issue con tag `question`

## 🙏 Agradecimientos

Cada contribución es valiosa, desde reportar bugs hasta escribir código. ¡Gracias por hacer este proyecto mejor!

---

**¿Tienes dudas?** No dudes en preguntar en los Issues o Discussions.

¡Feliz coding! 🚀
