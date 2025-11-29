// Configuración de API optimizada
const API_URL = "";

// Cache de elementos DOM
const DOMCache = new Map();

const getElement = (id) => {
    if (!DOMCache.has(id)) {
        DOMCache.set(id, document.getElementById(id));
    }
    return DOMCache.get(id);
};

// Utilidades de seguridad optimizadas
const sanitizeText = (text) => {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const createSafeElement = (tag, className = '', content = '', attributes = {}) => {
    const element = document.createElement(tag);
    if (className) element.className = className;

    if (content) {
        if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }
    }

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;
};

// Sistema de animaciones optimizado
const AnimationManager = {
    observers: new Map(),

    init() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
    },

    observeElement(element) {
        this.intersectionObserver.observe(element);
    }
};


// Cargar reCAPTCHA de forma segura con verificación
function loadRecaptcha() {
    return new Promise((resolve) => {
        // Si ya está cargado, resolver inmediatamente
        if (typeof grecaptcha !== 'undefined') {
            resolve();
            return;
        }

        // Verificar si el script ya se está cargando
        if (document.querySelector('script[src*="recaptcha"]')) {
            // console.log('reCAPTCHA ya se está cargando...');
            // Esperar a que termine de cargar
            const checkLoaded = setInterval(() => {
                if (typeof grecaptcha !== 'undefined') {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
            return;
        }

        // console.log('Iniciando carga de reCAPTCHA...');

        const script = document.createElement('script');
        script.src = 'https://www.recaptcha.net/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            // console.log('reCAPTCHA cargado correctamente desde recaptcha.net');
            // Esperar a que grecaptcha esté disponible
            const waitForGrecaptcha = setInterval(() => {
                if (typeof grecaptcha !== 'undefined') {
                    clearInterval(waitForGrecaptcha);
                    resolve();
                }
            }, 50);
        };

        script.onerror = () => {
            console.warn('Error cargando reCAPTCHA desde recaptcha.net. Intentando con Google...');
            loadGoogleRecaptcha(resolve);
        };

        document.head.appendChild(script);
    });
}

function loadGoogleRecaptcha(resolve) {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;

    script.onload = () => {
        // console.log('reCAPTCHA cargado correctamente desde google.com');
        const waitForGrecaptcha = setInterval(() => {
            if (typeof grecaptcha !== 'undefined') {
                clearInterval(waitForGrecaptcha);
                resolve();
            }
        }, 50);
    };

    script.onerror = (err) => {
        console.error('Error cargando reCAPTCHA desde Google:', err);
        resolve(); // Resolver igual para no bloquear la app
    };

    document.head.appendChild(script);
}

// Loader optimizado 
function crearLoader() {
    const loader = createSafeElement('div', 'loader', '', {
        'id': 'loader',
        'aria-label': 'Cargando contenido'
    });

    const loaderContent = createSafeElement('div', 'loader-content');

    const loaderLogo = createSafeElement('img', 'loader-logo', '', {
        'src': 'Imagenes/Logo-empresa.avif',
        'alt': 'Logo Empresa',
        'loading': 'eager'
    });

    const loaderSpinner = createSafeElement('div', 'loader-spinner');
    const loaderText = createSafeElement('p', 'loader-text', 'Cargando...');

    loaderContent.appendChild(loaderLogo);
    loaderContent.appendChild(loaderSpinner);
    loaderContent.appendChild(loaderText);
    loader.appendChild(loaderContent);

    if (!document.querySelector('#loader-styles')) {
        const styles = document.createElement('style');
        styles.id = 'loader-styles';
        styles.textContent = `
            .loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                transition: opacity 0.6s ease-out;
            }
            .loader-content { 
                text-align: center; 
                color: white; 
            }
            .loader-logo {
                width: 100px;
                height: 100px;
                margin-bottom: 1.5rem;
                border-radius: 20px;
                animation: pulse 1.5s ease-in-out infinite;
            }
            .loader-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid #ffcc00;
                border-radius: 50%;
                margin: 0 auto 1rem auto;
                animation: spin 1s linear infinite;
            }
            .loader-text {
                font-size: 1rem;
                font-weight: 500;
                color: #ffffff;
                margin: 0;
                opacity: 0.9;
            }
            .loader.fade-out { 
                opacity: 0; 
                pointer-events: none; 
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            body.loading { overflow: hidden; }
            body.loading #contenido-principal { 
                opacity: 0; 
                visibility: hidden; 
            }
            .animate-in {
                animation: fadeInUp 0.6s ease-out forwards;
            }
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }

    return loader;
}

// Sistema de alertas 
class AlertManager {
    static show(message, type = 'info', duration = 3000) {
        const overlay = createSafeElement('div', 'alert-overlay');
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '10000',
            backdropFilter: 'blur(4px)'
        });

        const colors = {
            success: { border: '#28a745', icon: '#28a745', bg: 'white', text: '#333' },
            warning: { border: '#ffc107', icon: '#ffc107', bg: 'white', text: '#333' },
            error: { border: '#dc3545', icon: '#dc3545', bg: 'white', text: '#333' },
            info: { border: '#17a2b8', icon: '#17a2b8', bg: 'white', text: '#333' }
        };

        const color = colors[type] || colors.info;
        const alert = createSafeElement('div', `alert alert-${type}`);

        Object.assign(alert.style, {
            background: color.bg,
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            maxWidth: '350px',
            width: '90%',
            textAlign: 'center',
            borderLeft: `4px solid ${color.border}`,
            animation: 'alertSlideIn 0.3s ease-out'
        });

        const iconMap = {
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            info: 'fas fa-info-circle'
        };

        const icon = createSafeElement('i', iconMap[type] || 'fas fa-info-circle');
        Object.assign(icon.style, {
            fontSize: '2.5rem',
            color: color.icon,
            marginBottom: '0.8rem',
            display: 'block'
        });

        const messageEl = createSafeElement('p', 'alert-message', message);
        Object.assign(messageEl.style, {
            fontSize: '1rem',
            margin: '0 0 1.5rem 0',
            color: color.text,
            lineHeight: '1.4'
        });

        const closeBtn = createSafeElement('button', 'btn-alert', 'Aceptar');
        Object.assign(closeBtn.style, {
            background: color.border,
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '20px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        });

        const closeAlert = () => {
            alert.style.animation = 'alertSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
            }, 300);
        };

        closeBtn.addEventListener('click', closeAlert);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAlert();
        });

        alert.appendChild(icon);
        alert.appendChild(messageEl);
        alert.appendChild(closeBtn);
        overlay.appendChild(alert);
        document.body.appendChild(overlay);

        if (duration > 0) setTimeout(closeAlert, duration);

        if (!document.querySelector('#alert-animations')) {
            const styles = document.createElement('style');
            styles.id = 'alert-animations';
            styles.textContent = `
                @keyframes alertSlideIn {
                    from { opacity: 0; transform: translateY(-20px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes alertSlideOut {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(-20px) scale(0.9); }
                }
            `;
            document.head.appendChild(styles);
        }

        return closeAlert;
    }
}

// Matrix Background optimizado
class MatrixBackground {
    constructor() {
        this.canvas = getElement('matrix-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.isActive = false;

        this.setup();
        this.bindEvents();
    }

    setup() {
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }

    draw() {
        if (!this.isActive) return;

        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `500 ${this.fontSize}px monospace`;
        this.ctx.textBaseline = 'top';

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        for (let i = 0; i < this.drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            const hue = 50 + Math.random() * 10;
            const saturation = 80 + Math.random() * 20;
            const lightness = 50 + Math.random() * 10;
            this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.8 + Math.random() * 0.2})`;

            this.ctx.fillText(text, x, y);

            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            this.drops[i]++;
        }

        this.animationId = requestAnimationFrame(() => this.draw());
    }

    start() {
        if (!this.isActive) {
            this.isActive = true;
            this.draw();
        }
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    bindEvents() {
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resize(), 100);
        };

        window.addEventListener('resize', handleResize, { passive: true });
        document.addEventListener('visibilitychange', () => {
            document.hidden ? this.stop() : this.start();
        });
    }
}

// Smart Navbar con hide-on-scroll
class SmartNavbar {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        if (!this.navbar) return;

        this.lastScrollTop = 0;
        this.scrollThreshold = 5;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Si estamos en el top, siempre mostrar
        if (scrollTop <= 100) {
            this.navbar.classList.remove('navbar-hidden');
            this.navbar.classList.add('navbar-visible');
            this.lastScrollTop = scrollTop;
            return;
        }

        // Detectar dirección del scroll
        if (Math.abs(scrollTop - this.lastScrollTop) < this.scrollThreshold) {
            return;
        }

        if (scrollTop > this.lastScrollTop) {
            // Scroll hacia abajo - ocultar navbar
            this.navbar.classList.add('navbar-hidden');
            this.navbar.classList.remove('navbar-visible');
        } else {
            // Scroll hacia arriba - mostrar navbar
            this.navbar.classList.remove('navbar-hidden');
            this.navbar.classList.add('navbar-visible');
        }

        this.lastScrollTop = scrollTop;
    }

    bindEvents() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}

// Hero Slider optimizado 
class HeroSlider {
    constructor() {
        this.slider = document.querySelector('.hero-slider');
        this.titleEl = getElement('hero-title');
        this.subtitleEl = getElement('hero-subtitle');
        this.prevBtn = document.querySelector('.hero-control.prev');
        this.nextBtn = document.querySelector('.hero-control.next');
        this.indicatorsContainer = document.querySelector('.hero-indicators');

        if (!this.slider || !this.titleEl) return;

        this.slides = [];
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.typingInterval = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/imagenes.json');
            const data = await response.json();
            this.slides = data.slides || this.getFallbackSlides();

            this.createSlides();
            this.createIndicators();
            this.showSlide(0);
            this.startAutoplay();
            this.bindEvents();
        } catch (error) {
            console.warn('Error loading slides:', error);
            this.slides = this.getFallbackSlides();
            this.createSlides();
            this.showSlide(0);
        }
    }

    getFallbackSlides() {
        return [{
            image: "/images/hero-backup.jpg",
            title: "Bienvenido a Mi Portfolio",
            subtitle: "Desarrollador Full Stack & Ingeniero Electrónico"
        }];
    }

    createSlides() {
        this.slides.forEach((slide, index) => {
            const slideEl = createSafeElement('div', 'hero-slide');
            slideEl.style.backgroundImage = `url(${slide.image})`;
            slideEl.style.opacity = '0';

            if (index === 0) {
                slideEl.style.opacity = '1';
                slideEl.classList.add('active');
            }

            this.slider.appendChild(slideEl);
        });
    }

    createIndicators() {
        if (!this.indicatorsContainer) return;

        this.slides.forEach((_, index) => {
            const indicator = createSafeElement('button', `hero-indicator ${index === 0 ? 'active' : ''}`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }

    showSlide(index) {
        const currentSlide = this.slider.children[this.currentIndex];
        if (currentSlide) {
            currentSlide.style.opacity = '0';
            currentSlide.classList.remove('active');
        }

        this.currentIndex = index;
        const newSlide = this.slider.children[this.currentIndex];
        if (newSlide) {
            newSlide.style.opacity = '1';
            newSlide.classList.add('active');
        }

        this.updateIndicators();
        this.updateText();
    }

    updateIndicators() {
        const indicators = this.indicatorsContainer?.querySelectorAll('.hero-indicator');
        indicators?.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    updateText() {
        const slide = this.slides[this.currentIndex];
        if (!slide) return;

        this.typeText(this.titleEl, slide.title, () => {
            if (this.subtitleEl && slide.subtitle) {
                this.subtitleEl.textContent = slide.subtitle;
                this.subtitleEl.classList.add('show');
            }
        });
    }

    typeText(element, text, onComplete) {
        if (this.typingInterval) clearInterval(this.typingInterval);

        element.textContent = '';
        let index = 0;

        this.typingInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(this.typingInterval);
                this.typingInterval = null;
                onComplete?.();
            }
        }, 50);
    }

    goToSlide(index) {
        this.showSlide(index);
        this.resetAutoplay();
    }

    nextSlide() {
        this.goToSlide((this.currentIndex + 1) % this.slides.length);
    }

    prevSlide() {
        this.goToSlide((this.currentIndex - 1 + this.slides.length) % this.slides.length);
    }

    startAutoplay() {
        if (this.slides.length > 1) {
            this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
        }
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }

    bindEvents() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());

        this.slider?.addEventListener('mouseenter', () => this.stopAutoplay());
        this.slider?.addEventListener('mouseleave', () => this.startAutoplay());

        let touchStartX = 0;
        this.slider?.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            this.stopAutoplay();
        }, { passive: true });

        this.slider?.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }

            this.startAutoplay();
        }, { passive: true });
    }
}

// Sistema de autenticación 
class AuthManager {
    constructor() {
        this.btnLogin = getElement('btn-login-google');
        this.btnLogout = getElement('btn-logout');
        this.userInfo = getElement('usuario-info');
        this.userAvatar = getElement('usuario-avatar');
        this.userName = getElement('usuario-nombre');

        this.isLoggingOut = false;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.checkAuth();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${API_URL}/api/auth/current`, {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (response.ok) {
                const user = await response.json();
                this.updateUI(user);
                return user;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.updateUI(null);
            return null;
        }
    }

    updateUI(user) {
        if (user && !this.isLoggingOut) {
            this.userAvatar.src = user.avatar || 'https://i.imgur.com/8Km9tLL.jpg';
            this.userAvatar.alt = `Avatar de ${user.nombre}`;
            this.userName.textContent = user.nombre;
            this.userInfo.classList.remove('d-none');
            this.btnLogin.classList.add('d-none');
            this.btnLogout.classList.remove('d-none');

            this.userInfo.style.opacity = '0';
            this.userInfo.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                this.userInfo.style.opacity = '1';
                this.userInfo.style.transform = 'translateY(0)';
                this.userInfo.style.transition = 'all 0.3s ease';
            }, 100);
        } else {
            this.userInfo.classList.add('d-none');
            this.btnLogin.classList.remove('d-none');
            this.btnLogout.classList.add('d-none');
        }
    }

    async logout() {
        if (this.isLoggingOut) return;

        this.isLoggingOut = true;

        try {
            // Mostrar estado de carga
            this.btnLogout.disabled = true;
            this.btnLogout.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Cerrando...';

            const response = await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();

                // Mostrar mensaje de éxito
                AlertManager.show(result.message || 'Sesión cerrada correctamente', 'success');

                // Actualizar UI inmediatamente
                this.updateUI(null);

                // Recargar la página después de un breve delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } else {
                throw new Error(`Error ${response.status} al cerrar sesión`);
            }
        } catch (error) {
            console.error('Error en logout:', error);

            // Restaurar botón
            this.btnLogout.disabled = false;
            this.btnLogout.innerHTML = '<i class="fas fa-sign-out-alt me-2"></i>Cerrar sesión';
            this.isLoggingOut = false;

            AlertManager.show('Error al cerrar sesión. Intenta nuevamente.', 'error');
        }
    }

    bindEvents() {
        this.btnLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `${API_URL}/api/auth/google`;
        });

        this.btnLogout?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }
}

// Sistema de comentarios optimizado 
class CommentsManager {
    constructor() {
        this.container = getElement('comentarios-container');
        this.textarea = getElement('comentario-texto');
        this.submitBtn = getElement('btn-enviar-comentario');
        this.recaptchaWidgetId = null;

        if (!this.container) return;

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadComments();
        this.initRecaptcha();
    }

    initRecaptcha() {
        // Esperar a que el DOM esté completamente listo
        if (document.readyState !== 'complete') {
            setTimeout(() => this.initRecaptcha(), 100);
            return;
        }

        const recaptchaContainer = document.querySelector('.g-recaptcha');
        if (!recaptchaContainer) {
            console.warn('Contenedor reCAPTCHA no encontrado. Reintentando...');
            setTimeout(() => this.initRecaptcha(), 500);
            return;
        }

        if (typeof grecaptcha === 'undefined') {
            console.warn('grecaptcha no está disponible. Reintentando...');
            setTimeout(() => this.initRecaptcha(), 500);
            return;
        }

        try {
            // console.log('Inicializando widget reCAPTCHA...');
            this.recaptchaWidgetId = grecaptcha.render(recaptchaContainer, {
                'sitekey': '6Ld7oL0rAAAAALwdJ06-4m7BodInxzPrxRb5YJ4O',
                'callback': (token) => { console.log('Recaptcha verificado'); },
                'expired-callback': () => { console.log('Recaptcha expirado'); }
            });
        } catch (e) {
            console.warn('Error renderizando reCAPTCHA:', e);
        }
    }

    async loadComments() {
        try {
            const response = await fetch(`${API_URL}/api/comentarios`);
            if (!response.ok) throw new Error('Error cargando comentarios');
            const comentarios = await response.json();
            this.renderComments(comentarios);
        } catch (error) {
            console.error('Error:', error);
            this.renderError('No se pudieron cargar los comentarios.');
        }
    }

    renderComments(comentarios) {
        this.container.innerHTML = '';
        if (!comentarios || comentarios.length === 0) {
            this.container.innerHTML = '<p class="text-center text-muted">No hay comentarios aún. ¡Sé el primero!</p>';
            return;
        }
        comentarios.forEach(c => {
            this.container.appendChild(this.createCommentElement(c));
        });
    }

    async submitComment() {
        const contenido = this.textarea.value.trim();
        if (!contenido) {
            AlertManager.show('Por favor escribe un comentario', 'warning');
            return;
        }

        // Obtener token de reCAPTCHA
        let captchaToken = null;
        if (typeof grecaptcha !== 'undefined' && this.recaptchaWidgetId !== null) {
            captchaToken = grecaptcha.getResponse(this.recaptchaWidgetId);
        }

        if (!captchaToken) {
            AlertManager.show('Por favor completa el captcha', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ contenido, captcha: captchaToken })
            });

            if (response.status === 401) {
                AlertManager.show('Debes iniciar sesión para comentar', 'info');
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar');
            }

            this.textarea.value = '';
            AlertManager.show(data.mensaje || 'Comentario enviado', 'success');

            // Resetear captcha
            if (typeof grecaptcha !== 'undefined' && this.recaptchaWidgetId !== null) {
                grecaptcha.reset(this.recaptchaWidgetId);
            }

            await this.loadComments();
        } catch (error) {
            console.error('Error submitting comment:', error);
            AlertManager.show(error.message || 'Error al enviar comentario', 'error');

            // Resetear captcha en caso de error también
            if (typeof grecaptcha !== 'undefined' && this.recaptchaWidgetId !== null) {
                grecaptcha.reset(this.recaptchaWidgetId);
            }
        }
    }
    createCommentElement(comentario) {
        const card = createSafeElement("div", "card mb-3", '', {
            'data-aos': 'fade-up'
        });

        const cardBody = createSafeElement("div", "card-body");
        const header = createSafeElement("div", "d-flex align-items-center mb-2");

        const img = createSafeElement("img", "rounded-circle me-2", '', {
            'src': comentario.usuario.avatar || "https://i.imgur.com/8Km9tLL.jpg",
            'alt': comentario.usuario.nombre,
            'width': '40',
            'height': '40',
            'loading': 'lazy'
        });

        const info = createSafeElement("div");
        const nombre = createSafeElement("h6", "mb-0 text-light", comentario.usuario.nombre);

        const fecha = createSafeElement("small", "text-muted",
            new Date(comentario.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        );

        info.appendChild(nombre);
        info.appendChild(fecha);
        header.appendChild(img);
        header.appendChild(info);

        const texto = createSafeElement("p", "card-text mt-3 text-light", comentario.contenido);

        cardBody.appendChild(header);
        cardBody.appendChild(texto);
        card.appendChild(cardBody);
        return card;
    }

    renderError(message) {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        const alertDiv = createSafeElement("div", "bg-yellow-900/30 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg flex items-center");
        const icon = createSafeElement("i", "fas fa-exclamation-triangle mr-2");
        const alertText = document.createTextNode(message);

        alertDiv.appendChild(icon);
        alertDiv.appendChild(alertText);
        this.container.appendChild(alertDiv);
    }

    bindEvents() {
        this.submitBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitComment();
        });

        this.textarea?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitComment();
            }
        });
    }
}

// Gestor de formularios de contacto 
class ContactFormManager {
    constructor() {
        this.form = getElement('contactForm');

        if (!this.form) return;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    async handleSubmit(e) {
        e.preventDefault();

        const nombre = getElement('nombre').value.trim();
        const correo = getElement('correo').value.trim();
        const mensaje = getElement('mensaje').value.trim();

        if (!nombre || !correo || !mensaje) {
            this.showAlert('Todos los campos son obligatorios', 'error');
            return;
        }

        if (!this.isValidEmail(correo)) {
            this.showAlert('Por favor ingresa un email válido', 'error');
            return;
        }

        await this.submitForm({ nombre, correo, mensaje });
    }

    async submitForm(data) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        const spinner = createSafeElement('i', 'fas fa-circle-notch fa-spin mr-2', '', {
            'aria-hidden': 'true'
        });
        const loadingText = document.createTextNode('Enviando...');

        submitBtn.textContent = '';
        submitBtn.appendChild(spinner);
        submitBtn.appendChild(loadingText);

        try {
            const response = await fetch(`${API_URL}/enviar-correo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert(result.mensaje, 'success');
                this.form.reset();
            } else {
                throw new Error(result.error || 'Error al enviar mensaje');
            }
        } catch (error) {
            this.showAlert('Error de conexión. Intenta nuevamente.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showAlert(message, type) {
        // Usar el AlertManager unificado en lugar de alertas personalizadas
        AlertManager.show(message, type === 'error' ? 'error' : 'success', 3000);
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
}

// Inicialización optimizada de la aplicación
class App {
    constructor() {
        this.modules = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // CARGAR RECAPTCHA PRIMERO
            await loadRecaptcha();

            AnimationManager.init();
            this.showLoader();

            await Promise.allSettled([
                this.initMatrix(),
                this.initSmartNavbar(),
                this.initHeroSlider(),
                this.initAuth(),
                this.initComments(),
                this.initContactForm()
            ]);

            this.setupHeroAnimations();

            if (document.readyState === 'complete') {
                this.handlePageLoad();
            } else {
                window.addEventListener('load', () => this.handlePageLoad());
            }

        } catch (error) {
            console.error('Error inicializando la aplicación:', error);
            this.handlePageLoad();
        }
    }

    async initMatrix() {
        this.modules.set('matrix', new MatrixBackground());
        this.modules.get('matrix').start();
    }

    async initSmartNavbar() {
        this.modules.set('navbar', new SmartNavbar());
    }

    async initHeroSlider() {
        this.modules.set('slider', new HeroSlider());
    }

    async initAuth() {
        this.modules.set('auth', new AuthManager());
    }

    async initComments() {
        this.modules.set('comments', new CommentsManager());
    }

    async initContactForm() {
        this.modules.set('contact', new ContactFormManager());
    }

    showLoader() {
        const loader = crearLoader();
        document.body.appendChild(loader);
        document.body.classList.add('loading');
        this.setupInitialStyles();
    }

    setupInitialStyles() {
        const elementsToAnimate = [
            getElement('nombre-completo'),
            getElement('descripcion-profesion'),
            document.querySelector('.btn-animado')
        ];

        elementsToAnimate.forEach(el => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
            }
        });
    }

    setupHeroAnimations() {
        const elements = [
            getElement('nombre-completo'),
            getElement('descripcion-profesion'),
            document.querySelector('.btn-animado')
        ];

        elements.forEach((el, index) => {
            if (el) {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                }, index * 200);
            }
        });
    }

    handlePageLoad() {
        const loader = getElement('loader');
        const mainContent = getElement('contenido-principal');

        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.remove();
                document.body.classList.remove('loading');

                if (mainContent) {
                    mainContent.style.opacity = '1';
                    mainContent.style.visibility = 'visible';
                }

                this.isInitialized = true;

                if (window.AOS) {
                    window.AOS.init({
                        duration: 600,
                        easing: 'ease-out-cubic',
                        once: true,
                        offset: 50
                    });
                }

            }, 600);
        }
    }

    destroy() {
        this.modules.forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            } else if (module.stop) {
                module.stop();
            }
        });
        this.modules.clear();
    }
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
    loadRecaptcha();

    const app = new App();
    app.initialize();

    window.addEventListener('beforeunload', () => app.destroy());
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            app.initialize();
        }
    });

    window.app = app;
});

// Polyfill para Promise.allSettled
if (!Promise.allSettled) {
    Promise.allSettled = function (promises) {
        return Promise.all(promises.map(p =>
            p.then(value => ({
                status: 'fulfilled',
                value
            })).catch(reason => ({
                status: 'rejected',
                reason
            }))
        ));
    };
}
