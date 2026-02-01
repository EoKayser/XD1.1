# TODO: Resolver Visibilidade de Produtos

## Problema
Produtos salvos no painel admin aparecem apenas localmente, não no celular ou para outros usuários.

## Causa
O API_BASE estava hardcoded para 'http://localhost:3001/api', que só funciona localmente.

## Soluções Implementadas
- [x] Criar arquivo js/config.js com API_BASE configurável
- [x] Atualizar js/store.js para importar API_BASE de config.js
- [x] Atualizar js/admin.js para usar API_BASE em vez de localhost hardcoded

## Próximos Passos para Implantação
Para tornar os produtos visíveis para outros usuários e no celular, você precisa implantar o servidor publicamente:

1. **Escolher provedor de hospedagem:**
   - Vercel, Heroku, Railway, Render, etc.
   - Ou usar ngrok para testes temporários

2. **Implantar o backend:**
   - Fazer upload do código do servidor
   - Obter URL pública (ex: https://minha-loja.vercel.app)

3. **Atualizar config.js:**
   - Mudar API_BASE para a URL pública + '/api'
   - Exemplo: export const API_BASE = 'https://minha-loja.vercel.app/api';

4. **Implantar o frontend:**
   - Hospedar index.html, CSS, JS, assets em um provedor estático
   - Ou usar a mesma hospedagem se suportar

5. **Testar:**
   - Verificar se produtos aparecem no celular e para outros usuários

## Notas
- Os produtos são salvos permanentemente no arquivo products.json no servidor
- O problema era apenas a acessibilidade da API
- Com a implantação pública, todos poderão ver os produtos
