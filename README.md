# Allia

Sistema fullstack com React (frontend) e Node.js + MongoDB (backend).

## Como rodar localmente

### Backend
1. Entre na pasta `backend`:
   ```bash
   cd backend
   npm install
   cp ../.env.example .env  # Edite com seus dados reais
   npm start
   ```

### Frontend
1. Entre na pasta `frontend`:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Como subir para produção
- **Frontend:** Gere o build com `npm run build` e envie o conteúdo da pasta `build` para sua hospedagem (ex: HostGator).
- **Backend:** Hospede em um serviço como Render, Railway, etc. Configure as variáveis de ambiente conforme `.env.example`.
- **Banco:** Use MongoDB Atlas ou outro MongoDB acessível.

## Variáveis de ambiente
Veja o arquivo `.env.example` para saber o formato e o que precisa ser configurado.

## Observações
- Nunca suba arquivos `.env` reais para o GitHub.
- O diretório `node_modules`, `uploads` e `build` não devem ser enviados ao repositório.
- Para dúvidas, consulte este README ou peça ajuda!
