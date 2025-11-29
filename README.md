# 💼 Portfolio Profesional - Sistema Avanzado de Gestión

<div align="center">

![Portfolio Banner](https://img.shields.io/badge/Estado-Producción-brightgreen?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Security](https://img.shields.io/badge/Seguridad-OWASP_Top_10-critical?style=for-the-badge)

**Sistema completo de portfolio con autenticación Google, gestión de comentarios con IA anti-spam y arquitectura de seguridad de nivel empresarial**

[🌐 Demo en Vivo](#) • [📖 Documentación](#características) • [🚀 Guía Rápida](#instalación)

</div>

---

## 🌟 Características Principales

### 🔐 Autenticación y Seguridad
- ✅ **Google OAuth 2.0** - Sistema de autenticación robusto integrado con Passport.js
- ✅ **Protección OWASP Top 10** - Defensa contra las vulnerabilidades más críticas
- ✅ **Rate Limiting Inteligente** - Prevención de ataques DDoS/DoS con límites por IP
- ✅ **Sistema Honeypot** - Detección automática de bots y actividad maliciosa
- ✅ **Helmet.js** - Headers de seguridad HTTP configurados profesionalmente
- ✅ **CORS Configurado** - Protección contra peticiones de orígenes no autorizados
- ✅ **Trust Proxy** - Compatible con proxies inversos para deployments en producción

### 💬 Sistema de Comentarios Avanzado
- 🤖 **Filtro Anti-Spam con IA** - Análisis de sentimiento y detección de lenguaje ofensivo
- 🛡️ **Normalización de Texto** - Detección de variaciones (leet speak, homoglyphs, etc.)
- ✅ **reCAPTCHA v2** - Protección contra bots al enviar comentarios
- 📊 **Moderación Automática** - Comentarios negativos bloqueados o enviados a revisión
- 🎨 **UI Moderna** - Interfaz elegante con avatares circulares y timestamps

### 🎨 Interfaz de Usuario Premium
- ⚡ **Matrix Background** - Fondo animado tipo Matrix con rendimiento optimizado
- 🎯 **Hero Slider** - Slider de imágenes con efecto de escritura dinámico
- 🔼 **Navbar Dinámico** - Barra de navegación que se oculta al hacer scroll
- 📱 **100% Responsive** - Diseño adaptable a todos los dispositivos
- 🌈 **Bootstrap 5** - Framework CSS moderno con personalización avanzada
- ✨ **AOS Animations** - Animaciones suaves al hacer scroll

### 📄 Páginas de Error Personalizadas
- 🔍 **404 Elegante** - Página no encontrada con sugerencias de navegación
- 🛡️ **403 Security** - Página de acceso denegado con detalles del incidente
- 🐝 **Honeypot Alert** - Página especial para trampas de seguridad
- ⚠️ **500 Server Error** - Manejo profesional de errores del servidor

---

## 🛠️ Stack Tecnológico

### Backend
```yaml
Runtime:        Node.js v22+
Framework:      Express.js
Base de Datos:  MongoDB Atlas
Autenticación:  Passport.js + Google OAuth 2.0
Sesiones:       express-session + connect-mongo
Seguridad:      helmet, cors, hpp, express-mongo-sanitize
Rate Limiting:  express-rate-limit
IA/ML:          string-similarity (análisis de texto)
Validación:     express-validator, validator.js
```

### Frontend
```yaml
Framework CSS:  Bootstrap 5.3
JavaScript:     Vanilla JS (modular, class-based)
Animaciones:    AOS (Animate On Scroll)
Iconos:         Font Awesome 6
reCAPTCHA:      Google reCAPTCHA v2
```

### DevOps & Seguridad
```yaml
Gestión Env:    dotenv
Compresión:     compression
Sanitización:   express-mongo-sanitize
Protección XSS: Helmet + CSP Headers
Honeypot:       Sistema personalizado
Logging:        Winston (logs de seguridad)
```

---

## 🚀 Instalación

### Prerrequisitos
- **Node.js** >= 22.0.0
- **MongoDB Atlas** cuenta (o instancia local)
- **Google Cloud Console** cuenta (para OAuth 2.0)
- **Git** instalado

### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2️⃣ Instalar Dependencias
```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env` y completa con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus datos reales:
```env
# MongoDB
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database

# Sesiones
SESSION_SECRET=genera_secreto_aleatorio_seguro_aqui

# Google OAuth 2.0
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Entorno
NODE_ENV=development
PORT=3000
```

### 4️⃣ Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 5️⃣ Ejecutar en Producción
```bash
npm start
```

---

## 🔐 Configuración de Seguridad

### Google OAuth 2.0
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita "Google+ API"
4. Crea credenciales OAuth 2.0:
   - **Tipo**: Aplicación web
   - **URIs de redireccionamiento autorizados**: 
     - `http://localhost:3000/api/auth/google/callback` (desarrollo)
     - `https://tu-dominio.com/api/auth/google/callback` (producción)
5. Copia **Client ID** y **Client Secret** a tu `.env`

### MongoDB Atlas
1. Crea un cluster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Configura acceso de red (IP Whitelist)
3. Crea un usuario de base de datos
4. Copia la connection string a `MONGO_URI` en `.env`

### reCAPTCHA (opcional pero recomendado)
1. Registra tu sitio en [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Usa **reCAPTCHA v2** (checkbox)
3. Actualiza la `sitekey` en `public/js/app.js` línea 854

---

## 📁 Estructura del Proyecto

```
├── 📂 config/              # Configuración de la aplicación
│   ├── db.js              # Conexión a MongoDB
│   ├── passport.js        # Estrategias de autenticación
│   └── securityConfig.js  # Configuración de seguridad
├── 📂 controllers/         # Lógica de negocio
│   ├── authController.js
│   ├── comentariosController.js
│   └── contactoController.js
├── 📂 middlewares/         # Middlewares personalizados
│   ├── security/          # Módulos de seguridad
│   │   ├── honeypot.js
│   │   └── obfuscation.js
│   └── securityHandlers.js
├── 📂 models/              # Modelos de MongoDB
│   ├── Comentario.js
│   └── Usuario.js
├── 📂 routes/              # Rutas de la API
│   ├── authRoutes.js
│   ├── comentariosRoutes.js
│   └── contactoRoutes.js
├── 📂 services/            # Servicios de negocio
│   └── security/
│       └── OWASPDefender.js
├── 📂 public/              # Archivos estáticos
│   ├── css/
│   │   └── estilos.css
│   ├── js/
│   │   └── app.js
│   └── Imagenes/
├── app.js                 # Configuración de Express
├── server.js              # Punto de entrada
├── package.json           # Dependencias
└── .env.example           # Template de variables de entorno
```

---

## 🧪 Scripts Disponibles

```bash
# Desarrollo (con nodemon y watch de CSS)
npm run dev

# Producción
npm start

# Build de CSS (Tailwind - si aplica)
npm run build:css
```

---

## 🌐 Deploy en Producción

### Preparación
1. **Variables de entorno**: Configura todas las variables en tu servicio de hosting
2. **NODE_ENV**: Establece en `production`
3. **GOOGLE_CALLBACK_URL**: Actualiza a tu dominio real
4. **SESSION_SECRET**: Usa un secreto fuerte y único

### Plataformas Recomendadas
- **AlwaysData** ✅
- **Heroku**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**
- **Google Cloud Run**

### Checklist de Producción
- [ ] Variables de entorno configuradas
- [ ] MongoDB IP whitelist actualizado
- [ ] Google OAuth callback URL actualizado
- [ ] HTTPS habilitado
- [ ] Trust proxy configurado (`app.set('trust proxy', 1)`)
- [ ] Logs de producción configurados
- [ ] Backups automáticos de MongoDB

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Daniel Perdomo Carvajal**

- 📧 Email: [danielperdomoconsultor@gmail.com](mailto:danielperdomoconsultor@gmail.com)
- 💼 LinkedIn: [Daniel enrique perdomo](https://www.linkedin.com/in/daniel-enrique-perdomo-carvajal-3a472a187/)
- 🌐 Portfolio: [https://danielperdomocarvajal.com](https://danielper29.alwaysdata.net/)

---

## 🙏 Agradecimientos

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Passport.js](http://www.passportjs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/)

---

<div align="center">

### ⭐ Si este proyecto te fue útil, dale una estrella!

**Hecho con amor y en Colombia**

</div>


