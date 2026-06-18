# Ideias & Roadmap — Trolha Caudal (Pulse)

Reúne ideias de evolução da plataforma, para lá das fases já planeadas. Nasceu
de uma conversa sobre o que distingue isto de um CRM (tipo Salesforce) e como
poderíamos crescer nessa direção.

## Posicionamento atual

O **Pulse** é uma ferramenta de **Business Intelligence / Analytics**: lê os
dados do trolha.pt e ajuda a *decidir* (KPIs, funil, encomendas, produtos,
clientes). **Observa** o negócio.

Um **CRM** (Salesforce, HubSpot…) **opera** o negócio: gere a relação comercial
— fichas de cliente, pipeline, follow-ups, tickets, automações de marketing.

| | Pulse (atual) | CRM |
|---|---|---|
| Categoria | BI / Analytics | CRM |
| Objetivo | Ver onde o dinheiro flui, decidir | Gerir relações e vendas |
| Dados | Sobretudo leitura | Cria/gere registos |
| Utilizador | Compras / gestão | Vendas / apoio / marketing |

O eixo de evolução é claro: **passar de "ler" para "agir"**.

---

## 1. De BI para CRM (operação)

- **Ficha de cliente 360º** — histórico de encomendas, valor de vida (LTV),
  ticket médio, frequência, último contacto, notas internas, tags.
- **Segmentação** — novos vs recorrentes, top clientes, **em risco/churn**
  (compravam e pararam), inativos, alto potencial. Guardar segmentos.
- **Tarefas & follow-ups** — lembretes atribuíveis a funcionários ("ligar ao
  cliente X", "repor stock Y"), com prazo e estado.
- **Ações sobre os dados** (o grande salto):
  - Recuperar **carrinhos abandonados** (lista + contacto/email).
  - Contactar **top clientes** / clientes em risco.
  - **Stock baixo → sugestão de compra** (ligar ao departamento de compras).
  - Notas/decisões registadas por encomenda ou produto.

## 2. Inteligência & automação

- **Alertas** — stock baixo, taxa de abandono a subir, queda de receita,
  pico de reembolsos, produto a esgotar. Centro de notificações.
- **Deteção de anomalias** — variações fora do normal vs período homólogo.
- **Insights automáticos** — "a categoria X caiu 18% esta semana", "o cliente
  Y não compra há 60 dias", em linguagem natural.
- **Sugestões de compra** — com base em procura real, rutura e sazonalidade.

## 3. Assistente AI interativo (já planeado — Fase 5)

- Chat à direita (estilo Cloudflare) que **lê os dados no ecrã** e responde.
- Evoluir de "responder" para **agir**: mudar período, navegar, filtrar,
  exportar, abrir a ficha de um cliente, gerar um relatório — tudo por comando.
- Resumos e recomendações proativas ("o que devo comprar esta semana?").

## 4. Relatórios & partilha (já planeado — Fase 6)

- Exportar PDF/CSV/Excel.
- **Relatórios agendados** por email (ex.: resumo semanal para o patrão).
- Snapshots/partilha de uma vista.

## 5. Outras melhorias (técnicas / UX)

- **Tempo real** — fazer jus ao nome "Pulse" (auto-refresh / live).
- **Comparação de períodos** lado a lado.
- **Drill-down** consistente (clicar num KPI → detalhe filtrado).
- **Favoritos / vistas guardadas** por utilizador.
- **Permissões** por papel (compras vs gestão).
- **Code-splitting** dos charts (recharts) para reduzir o bundle inicial.
- **PWA / mobile** para consulta rápida.

---

## Fases planeadas (referência)

- ✅ 0 Scaffold · 1 Shell + tema · 2 Auth · 3 Dashboard
- 🔜 4 Orders/Products/Customers/Trends (Orders em curso)
- 🔜 5 Assistente AI (Gemini) · 6 Relatórios & export

> Nota: estas ideias são um backlog vivo — priorizar conforme o valor para o
> departamento de compras.
