class OfertasApp {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        
        this.initEventListeners();
        this.loadOffers();
    }
    
    initEventListeners() {
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearFilters());
        
        // enter key na busca
        document.getElementById('search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }
    
    async loadOffers(page = 1) {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: page,
                limit: this.itemsPerPage,
                ...this.currentFilters
            });
            
            const response = await fetch(`/api/ofertas?${params}`);
            const data = await response.json();
            
            this.displayOffers(data.data);
            this.displayPagination(data.pagination);
            
        } catch (error) {
            console.error('Erro ao carregar ofertas:', error);
            this.showError('Erro ao carregar ofertas');
        } finally {
            this.hideLoading();
        }
    }
    
    handleSearch() {
        this.currentFilters = {
            search: document.getElementById('search').value,
            level: document.getElementById('level').value,
            kind: document.getElementById('kind').value,
            minPrice: document.getElementById('minPrice').value,
            maxPrice: document.getElementById('maxPrice').value,
            sortBy: document.getElementById('sortBy').value,
            order: document.getElementById('order').value
        };
        
        // remove campos vazios
        Object.keys(this.currentFilters).forEach(key => {
            if (!this.currentFilters[key]) {
                delete this.currentFilters[key];
            }
        });
        
        this.currentPage = 1;
        this.loadOffers(1);
    }
    
    clearFilters() {
        document.getElementById('search').value = '';
        document.getElementById('level').value = '';
        document.getElementById('kind').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('sortBy').value = '';
        document.getElementById('order').value = 'asc';
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.loadOffers(1);
    }
    
    displayOffers(offers) {
        const container = document.getElementById('offers-container');
        
        if (offers.length === 0) {
            container.innerHTML = '<div class="no-results">Nenhuma oferta encontrada</div>';
            return;
        }
        
        container.innerHTML = offers.map(offer => this.createOfferCard(offer)).join('');
    }
    
    createOfferCard(offer) {
        const stars = '★'.repeat(Math.floor(offer.rating)) + '☆'.repeat(5 - Math.floor(offer.rating));
        
        return `
            <div class="offer-card">
                <div class="offer-header">
                    <div class="course-info">
                        <h3>${offer.courseName}</h3>
                        <p>${offer.level}</p>
                    </div>
                    <div class="ies-info">
                        <img src="${offer.iesLogo}" alt="${offer.iesName}" class="ies-logo" onerror="this.style.display='none'">
                        <span>${offer.iesName}</span>
                    </div>
                </div>
                
                <div class="offer-details">
                    <div class="detail-item">
                        <div class="detail-label">Modalidade</div>
                        <div class="detail-value">${offer.kind}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Avaliação</div>
                        <div class="detail-value rating">
                            <span class="stars">${stars}</span>
                            <span>${offer.rating}</span>
                        </div>
                    </div>
                </div>
                
                <div class="price-info">
                    <div class="prices">
                        <div class="price-container">
                            <span class="full-price">De ${offer.fullPrice}</span>
                            <div class="offered-price-container">
                                <span class="offered-price">Por ${offer.offeredPrice}</span>
                                <span class="discount">${offer.discount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    displayPagination(pagination) {
        const container = document.getElementById('pagination');
        
        if (pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // botão anterior
        paginationHTML += `
            <button ${!pagination.hasPrev ? 'disabled' : ''} onclick="app.goToPage(${pagination.currentPage - 1})">
                ← Anterior
            </button>
        `;
        
        // páginas
        for (let i = 1; i <= pagination.totalPages; i++) {
            if (i === pagination.currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else if (
                i === 1 || 
                i === pagination.totalPages || 
                (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
            ) {
                paginationHTML += `<button onclick="app.goToPage(${i})">${i}</button>`;
            } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
                paginationHTML += `<span>...</span>`;
            }
        }
        
        // botão próximo
        paginationHTML += `
            <button ${!pagination.hasNext ? 'disabled' : ''} onclick="app.goToPage(${pagination.currentPage + 1})">
                Próxima →
            </button>
        `;
        
        container.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadOffers(page);
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    showError(message) {
        const container = document.getElementById('offers-container');
        container.innerHTML = `<div class="error">${message}</div>`;
    }
}

// inicializar a aplicação
const app = new OfertasApp();
