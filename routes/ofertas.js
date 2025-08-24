const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Carregar dados do JSON
const loadOffers = () => {
  try {
    const dataPath = path.join(__dirname, '../data/data.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data).offers;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return [];
  }
};

// Funções utilitárias
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatKind = (kind) => {
  return kind === 'presencial' ? 'Presencial 🏫' : 'EaD 🏠';
};

const formatLevel = (level) => {
  const levels = {
    'bacharelado': 'Graduação (bacharelado) 🎓',
    'tecnologo': 'Graduação (tecnólogo) 🎓',
    'licenciatura': 'Graduação (licenciatura) 🎓'
  };
  return levels[level] || level;
};

const calculateDiscount = (fullPrice, offeredPrice) => {
  const discount = ((fullPrice - offeredPrice) / fullPrice) * 100;
  return `${Math.round(discount)}% 📉`;
};

const formatOffer = (offer) => {
  return {
    courseName: offer.courseName,
    rating: offer.rating,
    fullPrice: formatCurrency(offer.fullPrice),
    offeredPrice: formatCurrency(offer.offeredPrice),
    discount: calculateDiscount(offer.fullPrice, offer.offeredPrice),
    kind: formatKind(offer.kind),
    level: formatLevel(offer.level),
    iesLogo: offer.iesLogo,
    iesName: offer.iesName
  };
};

// Função para filtrar ofertas
const filterOffers = (offers, filters) => {
  return offers.filter(offer => {
    // Filtro por level
    if (filters.level && offer.level !== filters.level) {
      return false;
    }
    
    // Filtro por kind
    if (filters.kind && offer.kind !== filters.kind) {
      return false;
    }
    
    // Filtro por preço
    if (filters.minPrice && offer.offeredPrice < parseFloat(filters.minPrice)) {
      return false;
    }
    
    if (filters.maxPrice && offer.offeredPrice > parseFloat(filters.maxPrice)) {
      return false;
    }
    
    // Busca por nome (case-insensitive)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (!offer.courseName.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
};

// Função para ordenar ofertas
const sortOffers = (offers, sortBy, order = 'asc') => {
  return offers.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'courseName':
        valueA = a.courseName.toLowerCase();
        valueB = b.courseName.toLowerCase();
        break;
      case 'offeredPrice':
        valueA = a.offeredPrice;
        valueB = b.offeredPrice;
        break;
      case 'rating':
        valueA = a.rating;
        valueB = b.rating;
        break;
      default:
        return 0;
    }
    
    if (order === 'desc') {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
  });
};

// Função para paginar resultados
const paginateResults = (offers, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: offers.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(offers.length / limit),
      totalItems: offers.length,
      itemsPerPage: limit,
      hasNext: endIndex < offers.length,
      hasPrev: startIndex > 0
    }
  };
};

// Função para selecionar campos específicos
const selectFields = (offers, fields) => {
  if (!fields || fields.length === 0) {
    return offers;
  }
  
  return offers.map(offer => {
    const selectedOffer = {};
    fields.forEach(field => {
      if (offer.hasOwnProperty(field)) {
        selectedOffer[field] = offer[field];
      }
    });
    return selectedOffer;
  });
};

// ROTAS

// GET /api/ofertas - Listar todas as ofertas com filtros, ordenação e paginação
router.get('/ofertas', (req, res) => {
  try {
    let offers = loadOffers();
    
    // Aplicar filtros
    const filters = {
      level: req.query.level,
      kind: req.query.kind,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search
    };
    
    offers = filterOffers(offers, filters);
    
    // Aplicar ordenação
    if (req.query.sortBy) {
      offers = sortOffers(offers, req.query.sortBy, req.query.order);
    }
    
    // Formatar ofertas
    let formattedOffers = offers.map(formatOffer);
    
    // Selecionar campos específicos
    if (req.query.fields) {
      const fields = req.query.fields.split(',');
      formattedOffers = selectFields(formattedOffers, fields);
    }
    
    // Aplicar paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = paginateResults(formattedOffers, page, limit);
    
    res.json(result);
    
  } catch (error) {
    console.error('Erro ao buscar ofertas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/ofertas/filtros - Retornar opções disponíveis para filtros
router.get('/ofertas/filtros', (req, res) => {
  try {
    const offers = loadOffers();
    
    const filters = {
      levels: [...new Set(offers.map(offer => offer.level))],
      kinds: [...new Set(offers.map(offer => offer.kind))],
      priceRange: {
        min: Math.min(...offers.map(offer => offer.offeredPrice)),
        max: Math.max(...offers.map(offer => offer.offeredPrice))
      }
    };
    
    res.json(filters);
    
  } catch (error) {
    console.error('Erro ao buscar filtros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
