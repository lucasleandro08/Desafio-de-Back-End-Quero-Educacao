## Como Executar o Projeto
1. **Execute o servidor** <br>
- node server.js
2. **Acesse a aplicação**
- Abra seu navegador em: `http://localhost:3000`
  
### Pré-requisitos
- Node.js (versão 14 ou superior)

### Instalação (caso algo dê errado)

1. **Instalar as dependências**
npm install

2. **Executar o servidor**
node server.js

3. **Acessar a aplicação**
- Abra seu navegador em: `http://localhost:3000`

### Configuração de Porta Personalizada (Opcional)
Se você quiser usar uma porta diferente da padrão (3000):
1. **Instalar dotenv**
npm install dotenv

2. **Criar arquivo de configuração**
Crie um arquivo `.env` na raiz do projeto:
PORT=8080
*(Substitua 8080 pela porta desejada)*

3. **Executar com a porta personalizada**
node server.js

O servidor será iniciado na porta especificada no arquivo `.env`.

## 🌐 API Endpoints

### `GET /api/ofertas`
Lista ofertas com filtros opcionais:
- `?search=engenharia` - Busca por nome
- `?level=bacharelado` - Filtra por nível
- `?kind=ead` - Filtra por modalidade
- `?minPrice=200&maxPrice=500` - Filtra por preço
- `?sortBy=rating&order=desc` - Ordena por campo
- `?page=2&limit=5` - Paginação
- `?fields=courseName,rating` - Seleciona campos específicos

### `GET /api/ofertas/filtros`
Retorna opções disponíveis para filtros.

## 📁 Estrutura do Projeto

projeto-ofertas/<br>
├── data/data.json # Dados das ofertas <br>
├── routes/ofertas.js # Rotas da API<br>
├── public/ # Interface web <br>
├── server.js # Servidor principal <br>
└── package.json # Dependências <br>
