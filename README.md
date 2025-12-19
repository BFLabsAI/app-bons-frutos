# 🍇 Bons Frutos - Dashboard de Gestão

Sistema de gestão empresarial desenvolvido para a empresa **Bons Frutos**, oferecendo uma plataforma completa para gerenciamento de leads, produtos, vendas e notas fiscais.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat-square&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite)

---

## 📋 Sobre o Projeto

O **Bons Frutos Dashboard** é uma aplicação web moderna que centraliza todas as operações comerciais da empresa, permitindo:

- Visualização de métricas e KPIs em tempo real
- Gerenciamento completo de leads e clientes
- Cadastro e controle de produtos
- Registro e acompanhamento de vendas
- Emissão e controle de notas fiscais

---

## 🚀 Funcionalidades

### 📊 Dashboard
- **KPIs em tempo real**: Novos leads, quantidade de vendas, valor total de vendas
- **Comparativo mensal**: Indicadores de crescimento/queda em relação ao mês anterior
- **Gráfico de faturamento**: Visualização mensal do faturamento com gráfico de área
- **Interface responsiva**: Adaptável para desktop e mobile

### 👥 Gestão de Leads
- Listagem de todos os leads cadastrados
- Cadastro de novos leads com informações completas
- Edição e exclusão de leads
- Busca e filtros

### 📦 Gestão de Produtos
- Catálogo completo de produtos
- Cadastro com nome, descrição, preço e status
- Controle de produtos ativos/inativos
- Organização por categorias

### 💰 Gestão de Vendas
- Registro de vendas vinculadas a leads e produtos
- Cálculo automático de valores
- Histórico completo de transações
- Status de vendas (pendente, concluída, cancelada)

### 🧾 Notas Fiscais
- Emissão de notas fiscais
- Vinculação com vendas realizadas
- Controle de status (emitida, cancelada)
- Histórico e consulta

### 🔐 Autenticação
- Login seguro com email e senha
- Cadastro de novos usuários com função/cargo
- Email de confirmação personalizado
- Proteção de rotas autenticadas

---

## 🛠️ Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 19.2.0 | Biblioteca para construção de interfaces |
| TypeScript | 5.9.3 | Superset JavaScript com tipagem estática |
| Vite | 7.2.4 | Build tool e dev server ultra-rápido |
| TailwindCSS | 3.4.17 | Framework CSS utility-first |
| React Router | 7.10.1 | Roteamento SPA |
| Recharts | 3.6.0 | Biblioteca de gráficos |
| Lucide React | 0.561.0 | Ícones modernos |
| date-fns | 4.1.0 | Manipulação de datas |

### Backend & Database
| Tecnologia | Descrição |
|------------|-----------|
| Supabase | Backend-as-a-Service (BaaS) |
| PostgreSQL | Banco de dados relacional |
| Supabase Auth | Autenticação e autorização |
| Row Level Security | Segurança ao nível de linha |

### Animações & 3D
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| GSAP | 3.14.2 | Animações avançadas |
| Three.js | 0.182.0 | Gráficos 3D |
| React Three Fiber | 9.4.2 | React renderer para Three.js |

---

## 📁 Estrutura do Projeto

```
src/
├── assets/           # Recursos estáticos (imagens, fontes)
├── components/       # Componentes reutilizáveis
│   └── Layout.tsx    # Layout principal com sidebar
├── contexts/         # Contextos React (AuthContext)
├── lib/              # Configurações e utilitários
│   └── supabase.ts   # Cliente Supabase
├── pages/            # Páginas da aplicação
│   ├── Dashboard.tsx # Página inicial com KPIs
│   ├── Leads.tsx     # Gestão de leads
│   ├── Products.tsx  # Gestão de produtos
│   ├── Sales.tsx     # Gestão de vendas
│   ├── Invoices.tsx  # Notas fiscais
│   └── Login.tsx     # Autenticação
├── types/            # Definições de tipos TypeScript
├── App.tsx           # Componente principal com rotas
├── main.tsx          # Ponto de entrada
└── index.css         # Estilos globais
```

---

## 🎨 Design System

O projeto utiliza uma paleta de cores personalizada inspirada na marca Bons Frutos:

| Cor | Hex | Uso |
|-----|-----|-----|
| Brand Primary | `#8B9650` | Elementos principais, destaques |
| Brand Dark | `#606A30` | Fundos, bordas |
| Dark Background | `#1A1E16` | Fundo da aplicação |
| Text Primary | `#F2F4E6` | Textos principais |

### Efeitos Visuais
- **Glassmorphism**: Efeito de vidro fosco nos painéis
- **Glow Effects**: Brilhos sutis nos elementos interativos
- **Smooth Transitions**: Transições suaves em todas as interações

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/BFLabsAI/app-bons-frutos.git
cd app-bons-frutos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:5173
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa verificação de código |

---

## 🗄️ Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profile_bons_frutos` | Perfis de usuários (nome, email, função) |
| `leads_bons_frutos` | Leads/clientes cadastrados |
| `products_bons_frutos` | Catálogo de produtos |
| `sales_bons_frutos` | Registro de vendas |
| `invoices_bons_frutos` | Notas fiscais |

---

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado em todas as tabelas
- Tokens JWT para sessões
- Proteção de rotas no frontend
- Validação de dados no backend

---

## 📱 Responsividade

O dashboard é totalmente responsivo:
- **Desktop**: Sidebar fixa lateral
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hamburger com navegação em overlay

---

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é proprietário da **Bons Frutos** e desenvolvido por **BF Labs AI**.

---

## 📞 Contato

- **Empresa**: Bons Frutos
- **Desenvolvedor**: BF Labs AI
- **Repositório**: [GitHub](https://github.com/BFLabsAI/app-bons-frutos)

---

<p align="center">
  <strong>Desenvolvido com 💚 por BF Labs AI</strong>
</p>
