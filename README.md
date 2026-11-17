# BrasaOS - Front-end do Restaurante

Este projeto é somente o frontend administrativo/KDS, sem dados mockados. Todas as telas esperam respostas REST do backend.

## Executar
```bash
npm install
cp .env.example .env
npm run dev
```

## Principais telas
- `/login`: autenticação real via API
- `/admin/dashboard`: indicadores e gráficos vindos do backend
- `/admin/cardapio`: produtos/categorias via API, edição de preço, disponibilidade, inclusão/edição/exclusão
- `/admin/escala`: funcionários e escala 5x2 via API
- `/admin/qrcodes`: QR por mesa apontando para o frontend mobile
- `/cozinha`: KDS consumindo pedidos reais e alterando status via API

## Contrato REST esperado
- POST `/auth/login`
- GET `/auth/me`
- GET `/dashboard/resumo?periodo=`
- GET `/categorias`
- GET/POST `/produtos`
- PUT/DELETE `/produtos/{id}`
- GET `/pedidos`
- PATCH `/pedidos/{id}/status`
- GET `/funcionarios`
- GET/PUT `/escalas`
- GET `/chamados?status=ABERTO`
- PATCH `/chamados/{id}/atender`
- POST `/mesas/{numero}/fechar`

O token retornado pelo login é armazenado como `auth_token` e enviado como `Authorization: Bearer ...`.
