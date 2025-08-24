
// This file defines the entire API structure.
// In a real-world scenario, this might be generated from a backend framework.

const productSchema = {
  id: "prod_123",
  name: "Pastel de Queijo",
  description: "Massa crocante recheada com queijo minas.",
  price: 8.90,
  category: "Salgados",
  images: ["url_to_image.png"],
  is_featured: true,
  variations: [{ type: "Tamanho", name: "Grande", price_modifier: 2.00 }]
};

const orderSchema = {
  id: "ord_123",
  customer_name: "João Silva",
  items: [{ productId: "prod_123", quantity: 2, price: 8.90 }],
  total_amount: 17.80,
  status: "pendente"
};

export const apiSpec = {
  info: {
    title: 'API Doce Encanto',
    version: '1.0.0',
    description: `
Bem-vindo à documentação da API da Doce Encanto. Use nossa API para integrar nossos deliciosos produtos em suas aplicações.
      
**Contato de Suporte:**
- **Email:** avelinananakamti09@gmail.com
- **Telefone:** +244 943 480 916

**Autenticação:**
Para usar os endpoints protegidos, você precisará de uma chave de API. Gere sua chave no painel de desenvolvedor.
Inclua sua chave de API no header 'X-API-KEY' em todas as requisições.
    `,
  },
  // The original array content (categories and endpoints) is now stored under the 'sections' key.
  sections: [
    {
      category: "Produtos",
      endpoints: [
        {
          method: "GET",
          path: "/api/products",
          summary: "Listar todos os produtos",
          description: "Retorna uma lista paginada de todos os produtos disponíveis no catálogo.",
          parameters: {
            query: [
              { name: "category", type: "string", description: "Filtra produtos por categoria (ex: Salgados)." },
              { name: "limit", type: "integer", description: "Número de resultados por página." }
            ]
          },
          responses: {
            "200": { description: "Sucesso", example: [productSchema] }
          }
        },
        {
          method: "GET",
          path: "/api/products/{id}",
          summary: "Obter um produto específico",
          description: "Retorna os detalhes de um único produto com base no seu ID.",
          parameters: {
            path: [{ name: "id", type: "string", description: "O ID do produto." }]
          },
          responses: {
            "200": { description: "Sucesso", example: productSchema },
            "404": { description: "Não Encontrado", example: { error: "Produto não encontrado." } }
          }
        },
         {
          method: "POST",
          path: "/api/products",
          summary: "Criar um novo produto",
          description: "Adiciona um novo produto ao catálogo. Requer permissão de administrador.",
          requestBody: {
            description: "Objeto do produto a ser criado.",
            required: true,
            example: { name: "Pastel de Vento", price: 7.50, category: "Especiais" }
          },
          responses: {
            "201": { description: "Criado com Sucesso", example: productSchema },
            "400": { description: "Requisição Inválida", example: { error: "Campo 'name' é obrigatório." } }
          }
        }
      ]
    },
    {
      category: "Pedidos",
      endpoints: [
        {
          method: "POST",
          path: "/api/orders",
          summary: "Criar um novo pedido",
          description: "Cria um novo pedido com os itens do carrinho de um cliente.",
          requestBody: {
            description: "Detalhes do pedido.",
            required: true,
            example: {
              customer_name: "Maria Oliveira",
              customer_email: "maria@example.com",
              items: [{ productId: "prod_123", quantity: 2 }, { productId: "prod_456", quantity: 1 }],
              delivery_type: "entrega",
              delivery_address: "Rua das Flores, 123"
            }
          },
          responses: {
            "201": { description: "Pedido Criado", example: orderSchema },
            "400": { description: "Dados Inválidos", example: { error: "ID de produto inválido." } }
          }
        },
        {
          method: "GET",
          path: "/api/orders/{id}",
          summary: "Consultar status de um pedido",
          description: "Retorna o status e os detalhes de um pedido específico.",
          parameters: {
            path: [{ name: "id", type: "string", description: "O ID do pedido." }]
          },
          responses: {
            "200": { description: "Sucesso", example: orderSchema },
            "404": { description: "Não Encontrado", example: { error: "Pedido não encontrado." } }
          }
        }
      ]
    },
  ]
};
