class GitHubPortfolio {
    constructor(username) {
        this.username = username;
        this.statsContainer = document.getElementById('github-stats-card');
        this.langsContainer = document.getElementById('github-langs-card');
        this.reposContainer = document.getElementById('github-repos');
        this.maxRepos = 6;
        this.userData = null;
        this.languageStats = {};
    }

    async init() {
        // console.log('Inicializando GitHub Portfolio...');
        try {
            await Promise.allSettled([
                this.loadUserStats(),
                this.loadRepositories()
            ]);
            // console.log('GitHub Portfolio inicializado correctamente');
        } catch (error) {
            console.error('Error loading GitHub data:', error);
        }
    }

    async loadUserStats() {
        try {
            const response = await fetch(`https://api.github.com/users/${this.username}`);

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            this.userData = await response.json();
            this.renderStats();
        } catch (error) {
            console.error('Error fetching user stats:', error);
            if (this.statsContainer) {
                this.statsContainer.innerHTML = `
                    <p class="text-warning text-center">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        No se pudieron cargar las estadísticas
                    </p>
                `;
            }
        }
    }

    renderStats() {
        if (!this.userData || !this.statsContainer) return;

        const stats = `
            <div class="row g-3 text-light">
                <div class="col-6">
                    <div class="stat-item text-center p-3" style="background: rgba(255, 204, 0, 0.1); border-radius: 12px; transition: all 0.3s;">
                        <i class="fas fa-code-branch text-warning" style="font-size: 2.5rem;"></i>
                        <h4 class="mt-2 mb-0" style="font-size: 2rem; font-weight: 700; color: #ffcc00;">${this.userData.public_repos}</h4>
                        <p class="mb-0" style="font-size: 0.85rem; color: #aaa;">Repositorios</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-item text-center p-3" style="background: rgba(255, 204, 0, 0.1); border-radius: 12px; transition: all 0.3s;">
                        <i class="fas fa-users text-warning" style="font-size: 2.5rem;"></i>
                        <h4 class="mt-2 mb-0" style="font-size: 2rem; font-weight: 700; color: #ffcc00;">${this.userData.followers}</h4>
                        <p class="mb-0" style="font-size: 0.85rem; color: #aaa;">Seguidores</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-item text-center p-3" style="background: rgba(255, 204, 0, 0.1); border-radius: 12px; transition: all 0.3s;">
                        <i class="fas fa-user-friends text-warning" style="font-size: 2.5rem;"></i>
                        <h4 class="mt-2 mb-0" style="font-size: 2rem; font-weight: 700; color: #ffcc00;">${this.userData.following}</h4>
                        <p class="mb-0" style="font-size: 0.85rem; color: #aaa;">Siguiendo</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-item text-center p-3" style="background: rgba(255, 204, 0, 0.1); border-radius: 12px; transition: all 0.3s;">
                        <i class="fas fa-folder text-warning" style="font-size: 2.5rem;"></i>
                        <h4 class="mt-2 mb-0" style="font-size: 2rem; font-weight: 700; color: #ffcc00;">${this.userData.public_gists}</h4>
                        <p class="mb-0" style="font-size: 0.85rem; color: #aaa;">Gists</p>
                    </div>
                </div>
            </div>
            <div class="mt-4 text-center">
                <p class="mb-0" style="font-size: 0.9rem; color: #888;">
                    <i class="fas fa-calendar-alt me-2"></i>
                    Miembro desde ${new Date(this.userData.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </p>
            </div>
        `;

        this.statsContainer.innerHTML = stats;
    }

    async loadRepositories() {
        if (!this.reposContainer) return;

        try {
            const response = await fetch(`https://api.github.com/users/${this.username}/repos?sort=updated&per_page=100`);

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const repos = await response.json();
            console.log(`Cargados ${repos.length} repositorios`);

            // Calcular estadísticas de lenguajes
            this.calculateLanguageStats(repos);
            this.renderLanguages();

            // Filtrar y ordenar repositorios
            const featuredRepos = repos
                .filter(repo => !repo.fork && !repo.private)
                .sort((a, b) => {
                    if (b.stargazers_count !== a.stargazers_count) {
                        return b.stargazers_count - a.stargazers_count;
                    }
                    return new Date(b.updated_at) - new Date(a.updated_at);
                })
                .slice(0, this.maxRepos);

            this.renderRepositories(featuredRepos);
        } catch (error) {
            console.error('Error fetching repositories:', error);
            this.showError();
        }
    }

    calculateLanguageStats(repos) {
        const langCount = {};

        repos.forEach(repo => {
            if (repo.language && !repo.fork) {
                langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            }
        });

        this.languageStats = langCount;
    }

    renderLanguages() {
        if (!this.langsContainer || Object.keys(this.languageStats).length === 0) {
            if (this.langsContainer) {
                this.langsContainer.innerHTML = '<p class="text-light text-center">Cargando lenguajes...</p>';
            }
            return;
        }

        const sortedLangs = Object.entries(this.languageStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6);

        const total = sortedLangs.reduce((sum, [, count]) => sum + count, 0);

        const langsHTML = sortedLangs.map(([lang, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const color = this.getLanguageColor(lang);

            return `
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-light d-flex align-items-center" style="font-size: 0.9rem;">
                            <span class="badge me-2" style="background-color: ${color}; width: 14px; height: 14px; padding: 0; border-radius: 50%; display: inline-block;"></span>
                            <strong>${lang}</strong>
                        </span>
                        <span class="text-warning fw-bold" style="font-size: 0.95rem;">${percentage}%</span>
                    </div>
                    <div class="progress" style="height: 10px; background-color: rgba(255, 255, 255, 0.1); border-radius: 5px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${percentage}%; background-color: ${color}; border-radius: 5px;" 
                             aria-valuenow="${percentage}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.langsContainer.innerHTML = langsHTML;
    }

    renderRepositories(repos) {
        if (!repos || repos.length === 0) {
            this.showNoRepos();
            return;
        }

        this.reposContainer.innerHTML = '';

        repos.forEach(repo => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = this.getRepoCardHTML(repo);
            this.reposContainer.appendChild(col);
        });
    }

    getRepoCardHTML(repo) {
        const langColor = this.getLanguageColor(repo.language);
        const langBadge = repo.language ?
            `<span class="badge" style="background-color: ${langColor}; padding: 0.35rem 0.85rem; border-radius: 12px; font-size: 0.75rem;">${repo.language}</span>`
            : '';

        const stars = repo.stargazers_count > 0 ?
            `<span class="text-warning me-2" style="font-size: 0.85rem;"><i class="fas fa-star me-1"></i>${repo.stargazers_count}</span>`
            : '';

        const forks = repo.forks_count > 0 ?
            `<span class="text-light" style="font-size: 0.85rem;"><i class="fas fa-code-branch me-1"></i>${repo.forks_count}</span>`
            : '';

        return `
            <article class="card h-100 shadow-lg border-0 repo-card" 
                     style="background: linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%); 
                            border: 1px solid rgba(255, 204, 0, 0.2) !important; 
                            transition: all 0.3s ease;">
                <div class="card-body d-flex flex-column">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                        <h3 class="card-title h6 text-warning mb-2">
                            <i class="fab fa-github me-2"></i>${this.escapeHTML(repo.name)}
                        </h3>
                    </a>
                    <p class="card-text text-light flex-grow-1" style="font-size: 0.9rem;">
                        ${this.escapeHTML(repo.description) || 'Sin descripción'}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-3" 
                         style="border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        ${langBadge}
                        <div class="d-flex gap-2">${stars}${forks}</div>
                    </div>
                    <div class="mt-3">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" 
                           class="btn btn-outline-warning btn-sm w-100">
                            <i class="fas fa-external-link-alt me-2"></i>Ver Repositorio
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Shell': '#89e051',
            'Kotlin': '#F18E33',
            'Swift': '#ffac45',
            'Dart': '#00B4AB',
            'Vue': '#4FC08D',
            'C#': '#178600'
        };
        return colors[language] || '#8b949e';
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError() {
        if (!this.reposContainer) return;

        this.reposContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No se pudieron cargar los repositorios. 
                    <a href="https://github.com/${this.username}" target="_blank" rel="noopener" class="alert-link">
                        Visita mi GitHub directamente
                    </a>
                </div>
            </div>
        `;
    }

    showNoRepos() {
        if (!this.reposContainer) return;

        this.reposContainer.innerHTML = `
            <div class="col-12 text-center text-light">
                <p>No hay repositorios públicos disponibles.</p>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que los elementos estén en el DOM
    setTimeout(() => {
        const githubPortfolio = new GitHubPortfolio('Danielperdomo29');
        githubPortfolio.init();

        // Agregar estilos de hover para las tarjetas
        const style = document.createElement('style');
        style.textContent = `
            .repo-card:hover {
                transform: translateY(-8px) !important;
                box-shadow: 0 12px 30px rgba(255, 204, 0, 0.3) !important;
            }
            .stat-item:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 20px rgba(255, 204, 0, 0.2);
            }
        `;
        document.head.appendChild(style);

        // Manejar errores de carga de imágenes (Fallback)
        // Esto reemplaza el onerror inline para cumplir con CSP estricto
        const fallbackImages = document.querySelectorAll('.github-fallback-img');
        fallbackImages.forEach(img => {
            img.addEventListener('error', function () {
                console.log('Error cargando imagen de GitHub, activando fallback...');
                this.style.display = 'none';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.display = 'block';
                }
            });
        });
    }, 1000);
});
