# 🚀 Guía de Despliegue en Producción

Esta guía te ayudará a desplegar tu aplicación en AlwaysData u otros proveedores de hosting.

## 📋 Checklist Pre-Despliegue

- [ ] Todas las variables de entorno configuradas en `.env`
- [ ] MongoDB Atlas configurado y accesible
- [ ] Google OAuth credentials de producción configuradas
- [ ] reCAPTCHA configurado para dominio de producción
- [ ] IP del servidor agregada a MongoDB whitelist
- [ ] CSS compilado (`npm run build:css`)
- [ ] Logs de desarrollo eliminados del código
- [ ] `.gitignore` actualizado

## 🌐 Opción 1: Despliegue en AlwaysData

### Paso 1: Preparar el Repositorio Git

```bash
# Inicializar Git si no lo has hecho
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "feat: Initial commit - Production ready"

# Crear rama de producción
git checkout -b production

# Subir a GitHub
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin production
```

### Paso 2: Configurar AlwaysData

1. **Accede a tu panel de AlwaysData**
2. **Crea una aplicación Node.js**:
   - Sitios web → Agregar un sitio
   - Tipo: Node.js
   - Versión: 22.x o superior

3. **Configurar Git Deploy**:
   ```bash
   # En tu servidor AlwaysData (SSH)
   cd ~/www
   git clone https://github.com/tu-usuario/tu-repo.git .
   ```

4. **Instalar dependencias**:
   ```bash
   npm install --production
   ```

5. **Configurar variables de entorno**:
   - En panel AlwaysData: Environment → Variables
   - O crear archivo `.env` manualmente (NO commitear)

### Paso 3: Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un cluster (si no lo tienes)
3. **Network Access**: Agrega la IP de tu servidor AlwaysData
4. **Database Access**: Crea usuario con permisos de lectura/escritura
5. Copia la cadena de conexión:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

### Paso 4: Configurar Reverse Proxy (si usas nginx)

Archivo de configuración nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Paso 5: Configurar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo ecosystem.config.js
```

`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'portfolio-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
```

Iniciar con PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Paso 6: Configurar SSL (HTTPS)

#### Opción A: Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

#### Opción B: CloudFlare (Recomendado)

1. Agrega tu dominio a CloudFlare
2. Cambia los nameservers en tu registrador
3. En CloudFlare: SSL/TLS → Full (strict)
4. Habilita "Always Use HTTPS"
5. Habilita "Automatic HTTPS Rewrites"

## 🔧 Opción 2: Despliegue Automatizado con GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build CSS
      run: npm run build:css
      
    - name: Deploy to Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd ~/www
          git pull origin production
          npm install --production
          pm2 restart portfolio-backend
```

**Configurar Secrets** en GitHub:
- `SSH_HOST`: IP de tu servidor
- `SSH_USER`: Usuario SSH
- `SSH_PRIVATE_KEY`: Tu clave privada SSH

## 🔐 Variables de Entorno de Producción

Asegúrate de configurar estas variables en tu servidor:

```env
# PRODUCCIÓN
NODE_ENV=production
PORT=3000

# MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/production?retryWrites=true&w=majority

# Session (Generar nuevo secret)
SESSION_SECRET=generate-strong-random-secret-here-min-32-chars

# Google OAuth (Producción)
GOOGLE_CLIENT_ID=tu-client-id-produccion.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-produccion
GOOGLE_CALLBACK_URL=https://tu-dominio.com/api/auth/google/callback

# reCAPTCHA (Producción)
RECAPTCHA_SECRET_KEY=tu-secret-key-produccion

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

## 📊 Monitoreo

### PM2 Monitoring

```bash
# Ver logs en tiempo real
pm2 logs portfolio-backend

# Monitorear uso de recursos
pm2 monit

# Ver estado de la aplicación
pm2 status
```

### Logs de Aplicación

Los logs se guardan en:
- `logs/security/security.log` - Eventos de seguridad
- `logs/pm2-error.log` - Errores de PM2
- `logs/pm2-out.log` - Salida estándar

### Configurar Alertas (Opcional)

#### PM2 Plus (Monitoring Cloud)

```bash
pm2 link <secret_key> <public_key>
```

#### UptimeRobot (Monitoreo HTTP)

1. Crea cuenta en [UptimeRobot](https://uptimerobot.com/)
2. Agregar monitor HTTP(S)
3. URL: `https://tu-dominio.com/health`
4. Configura alertas por email

## 🔄 Actualización del Código

### Método Manual

```bash
# SSH a tu servidor
ssh usuario@tu-servidor

# Ir al directorio
cd ~/www

# Pull de cambios
git pull origin production

# Instalar nuevas dependencias
npm install --production

# Reiniciar aplicación
pm2 restart portfolio-backend
```

### Método Automatizado (GitHub Actions)

Solo haz push a la rama `production`:

```bash
git checkout production
git merge main
git push origin production
```

GitHub Actions se encargará del resto.

## 🛡️ Seguridad en Producción

### Firewall

```bash
# Permitir solo puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2Ban (Protección contra fuerza bruta)

```bash
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Headers de Seguridad

Ya están configurados en `app.js` con Helmet.js. Verifica en:
[Security Headers](https://securityheaders.com/?q=tu-dominio.com)

### MongoDB

- ✅ Whitelist de IPs configurada
- ✅ Usuario con permisos mínimos
- ✅ Conexión SSL habilitada
- ✅ Contraseñas fuertes

## 🐛 Troubleshooting

### Error: Cannot find module

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: EADDRINUSE (Puerto en uso)

```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso
kill -9 <PID>

# O usar PM2
pm2 delete portfolio-backend
pm2 start ecosystem.config.js
```

### Error: MongoDB connection timeout

- Verifica que la IP del servidor esté en MongoDB whitelist
- Verifica credenciales en MONGO_URI
- Prueba conexión manual:
  ```bash
  mongosh "mongodb+srv://cluster.mongodb.net" --username usuario
  ```

### Error 429 persiste después de esperar

```bash
# Limpiar cache de rate limiting (si usas Redis)
redis-cli FLUSHALL

# O reiniciar aplicación
pm2 restart portfolio-backend
```

## 📈 Optimización

### Enable Compression

Ya está habilitado en `app.js` con `compression()`.

### Static File Caching

En nginx:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Indexing

Asegúrate de tener índices en:
```javascript
// models/Comentario.js
comentarioSchema.index({ fecha: -1 });
comentarioSchema.index({ 'usuario.id': 1 });
```

## 🎯 Checklist Post-Despliegue

- [ ] Aplicación accesible en https://tu-dominio.com
- [ ] Google OAuth funciona correctamente
- [ ] reCAPTCHA se muestra y valida
- [ ] Formulario de contacto envía emails
- [ ] Comentarios se guardan en MongoDB
- [ ] Rate limiting funciona (probar con múltiples requests)
- [ ] Página de error 429 se muestra correctamente
- [ ] Logs se están generando
- [ ] PM2 está corriendo y auto-reinicia
- [ ] SSL funciona (candado verde en navegador)
- [ ] Headers de seguridad aprobados
- [ ] Backups automáticos de MongoDB configurados

## 📞 Soporte

Si encuentras problemas:
1. Revisa logs: `pm2 logs`
2. Verifica variables de entorno
3. Consulta `logs/security/security.log`
4. Abre un issue en GitHub

---

🎉 ¡Ya estás en producción! Monitorea tu aplicación regularmente y mantén las dependencias actualizadas.
