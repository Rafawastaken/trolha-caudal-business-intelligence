# Análise de Lacunas — trolha-kpi vs ks-kpi-fs

> Recomendações de que **dados/KPIs adicionar** ao trolha-kpi, geradas comparando
> com o `ks-kpi-fs` (projeto irmão, mais completo) e **verificadas contra o código
> real** (os 23 endpoints da Trolha Tracking API, `docs/trolha.docs.json`, e os
> slices do frontend). Cada item foi avaliado adversarialmente quanto a
> viabilidade e valor. Data: 2026-06-20.

---

## O retrato

O trolha-kpi é hoje um **BI de vendas puro** — lê só a BD PrestaShop (quem já
entrou no funil). O ks-kpi-fs acrescenta **5 dimensões de dados** que não temos:

| Dimensão | ks-kpi-fs tem | trolha-kpi tem | Implica |
|---|---|---|---|
| **Margem / custo (COGS)** | Sage → lucro real, margem | só **receita** | dado novo (custo) |
| **Gasto em ads / ROAS / MER / CAC** | Meta/Google/TikTok | nada | integração externa |
| **Analytics web (GA4)** | sessões, fontes, atribuição | nada | integração externa |
| **Atribuição de canal por encomenda** | módulo `r_orderattribution` | nada | módulo na loja |
| **Automação (briefings Telegram, conversões offline)** | sim | nada | cron + backend |

## A escolha estratégica

O utilizador declarado é o **departamento de compras**. Antes de copiar o ks às
cegas, separar:

- **Dados que servem COMPRAS** (a missão): margem/COGS, velocidade de
  venda/reposição, devoluções por produto, RFM de instaladores B2B, encomendas
  em risco. → **prioridade máxima**.
- **Dados que servem GESTÃO/MARKETING** (valor alto, outra persona): ROAS, GA4,
  atribuição, channel-laundering. → 2ª vaga.

Constrangimento de arquitetura: o trolha-kpi é **frontend-only**. Tudo o que
precisa de endpoint novo depende de quem controla a Trolha Tracking API. Por
isso distinguimos *quick wins* (só com os 23 endpoints atuais) do que exige
backend.

---

## 🟢 A — Quick wins (só frontend, API atual) — começar já

| # | Recomendação | Valor | Esforço | Nota verificada |
|---|---|---|---|---|
| 1 | **Reposição de stock acionável** — cruzar `top-products` × `low-stock` (ambos têm `product_id`) → dias-de-cobertura + qtd sugerida, ordenado por urgência | **Alto** (compras!) | Médio | Versão "estreita" (best-sellers **já em rutura**) é frontend-only. Cobertura do catálogo inteiro e "produtos parados" exigem endpoint novo (`/stock-velocity`). Lead-time = input manual nas Definições. Sinal ruidoso para produtos sazonais/lentos → marcar baixa confiança quando qty no período é pequeno. |
| 2 | **Encomendas em risco / pendentes** (Lote A) — filtrar `orders-list?state=aguarda-pagamento` ordenado por valor/antiguidade + "valor total em risco" | **Alto** | Baixo | `date` já vem em cada linha → "dias pendente" calcula-se no browser. Filtros `state`+`payment` já existem. O **contacto** por linha é que precisa de backend (Lote B). |
| 3 | **Conversão por método de pagamento** (criadas→pagas) | Médio | Baixo | `payments` **já devolve `orders_all`** — o frontend está a deitá-lo fora (`orders/api.ts`). É só parar de o descartar + card. Deteta Multibanco gerado-e-nunca-pago. (Cortar a parte de "financiamento/crédito" — não há gateway desses.) |
| 4 | **Centro de Alertas / anomalias** (MVP) | Médio | Médio | `kpis`/`overview` já trazem `previous`+deltas → alertas "receita −X%" e "abandono↑" quase grátis. `refunds`/`top-products`/`low-stock` **não** trazem baseline → exige 2º fetch do período anterior. Cuidado com falsos positivos (volume B2B sazonal) → *alert fatigue*. É *pull* à carga da página, não *push* real. |
| 5 | **Comparação de períodos sobreposta** (série diária atual vs anterior) | Médio | Baixo | 2ª chamada a `daily` com datas deslocadas. **Armadilha:** alinhar por *offset de dia*, não por data (presets de mês têm nº de dias diferente, senão parte em silêncio). Escrever `previousRange(from,to)`. |

## 🟡 B — Alto valor, precisa de ~1 endpoint novo (o salto)

| # | Recomendação | Valor | Esforço | Nota verificada |
|---|---|---|---|---|
| 6 | **Margem e lucro real por produto/categoria** ⭐ | **Alto** | Médio | **A mais importante** — transforma "reporting de vendas" em "ferramenta de compras". Caminho rápido: expor `original_wholesale_price` (já persistido por linha em `ps_order_detail`, imune a alterações futuras de preço). **Pré-requisito crítico:** validar cobertura de `wholesale_price` na BD (`% produtos com wholesale_price > 0`) — se vier a 0/desatualizado, a margem mente. Fase 2 (opcional): reconciliar com Sage se a cobertura PrestaShop for fraca. KPIs: top por **lucro** (≠ receita), margem por categoria, volume-killers <10%. |
| 7 | **Segmentação RFM + LTV/CLV** | **Alto** | Médio | O `SegmentsCard` "Em breve" **já está na página Clientes** (o dono anotou "requer histórico por cliente / novos endpoints"). Precisa de `/customers/rfm` que varra histórico all-time por `id_customer` (só estados pagos/válidos), com cache. ⚠️ `orders-list` **não** expõe `id_customer` estável por linha (só nome) → não dá para reconstruir client-side. Cohorts (#10) saem do mesmo agregado. |
| 8 | **Recuperação de carrinhos abandonados acionável** | **Alto** | Alto | Hoje só a *taxa* (`abandoned-carts` = `{abandoned, converted, rate}`). Falta a lista com email/produtos/etapa. Filtrar bots/`id_customer>0`/já-convertidos (join a `ps_orders` por `id_cart`); RGPD/opt-in; **não** usar "AOV × abandonados" (número falso) → somar conteúdo real dos carrinhos recuperáveis. Taxa de recuperação típica single-digit. |
| 9 | **Devoluções por produto/marca** | Médio | Médio | Sinal de problema de fornecedor → decisão de compras. `refunds` só dá agregado; precisa `/refunds/products` (cruzar `ps_order_slip` × produtos × unidades vendidas). "Motivo" provavelmente vazio (só com módulo RMA). Sinal fraco por SKU → agregar por marca/categoria + janelas longas. |
| 10 | **Cohorts de retenção** | Médio | Médio | Entregar **junto** com o RFM (mesma fundação). Bombas são bens duráveis (ciclo 5–15 anos) → grelha pode ser quase toda zero após M+1; brilha no slice B2B/instaladores. `customer-mix` (novos vs recorrentes) já é um proxy grosseiro. |
| 11 | **Ficha de cliente 360 + drill-down** | Médio | Alto | `top-customers` já dá `id_customer`. Precisa `/customers/{id}/orders` e `/products` (join-heavy). Falta rota `customers/:id` no frontend. Valor real = ângulo B2B (produtos habituais, recompra de consumíveis), não a lista de encomendas isolada. Nota RGPD: expor telefone/email. |

## 🔵 C — Integrações externas (2ª vaga, foco gestão)

| # | Recomendação | Valor | Esforço | Nota verificada |
|---|---|---|---|---|
| 12 | **Marketing: MER / CAC blended** (Tier 1) | Alto (gestão) | Médio | `revenue` e `newCustomers` já existem → MER e CAC blended triviais; **só falta o input de ad spend**. Começar por **upload CSV / Google Sheet / cron simples**, não API. Valor real já aqui. |
| 13 | **ROAS por plataforma + GA4 + atribuição** (Tier 2) | Alto (gestão) | Alto | Bloco grande e interdependente: ROAS por canal exige atribuição UTM → módulo na loja + RGPD + GA4. APIs Google Ads (developer token) e Meta (app review) = passivo operacional contínuo (tokens, timezone, spend retroativo ~72h). ⚠️ "conversão real = encomendas/sessões" é metodologicamente falho (contradiz a própria contagem de encomendas). Adiar para depois do Tier 1. |
| 14 | **Briefing diário (Telegram/Email)** | Médio | Médio | Dados mapeiam 100% nos endpoints atuais. Bloqueio real **não** é o cron — é a **auth** (JWT 8h sem refresh → conta de serviço + re-login no job + host sempre-ligado + gestão de segredos). "Smart flags acionáveis" = bot stateful (alto); digest unidirecional = médio. |

## ⚪ D — Backlog / baixo valor (não investir já)

- **Filtros/segmentos globais cross-dashboard** — exige backend em ~15 endpoints
  (params `region`/`customer_type`/`category`). Sem isso, só re-embala
  `geography`/`customer-mix`/`categories` que já existem.
- **Drill-down de categoria com "procura não satisfeita"** — a tese "encomendas
  falhadas = o que stockar" é frágil (são quase todas falhas de pagamento, não
  rutura). Não há join produto→categoria nos endpoints atuais.
- **Heatmap hora × dia** — cosmético para compras; não se reconstrói de 2
  marginais (`hour`+`weekday`) sem assumir independência (alisa os picos);
  exigiria paginar `orders-list`.
- **Qualidade catálogo/SEO** — o back-office PrestaShop já o sinaliza;
  preocupação de conteúdo/marketing, não de compras.
- **Funil de checkout detalhado** — o funil de 6 níveis **já cobre**
  checkout→envio→pagamento com drop-off. Delta marginal (só split login/morada +
  filtro de bots, que limpa a taxa de abandono ~87% contaminada).
- **Tracking health / channel-laundering** — camada de 3ª ordem, só depois de
  ads+atribuição em produção.
- ❌ **Programa de influencers** — *rejeitado*: nem o negócio tem programa, nem a
  API tem atribuição/comissões; para B2B de bombas o canal influencer é
  irrelevante. (Se houver revendedores: atribuição barata por código de voucher,
  que `/vouchers` já suporta — não o módulo do ks.)

---

## Por onde começar (recomendação)

1. **#1 Reposição de stock** + **#2 Encomendas em risco (Lote A)** — ambos
   *frontend-only*, transformam features passivas em listas acionáveis. Valor sem
   esperar pela API.
2. **#6 Margem/COGS (Fase 1)** — o único item que muda a *categoria* do produto.
   **Primeiro validar a cobertura de `wholesale_price`** na BD (uma query). Se for
   fraca, a margem precisa do Sage/ERP — descobrir isso *antes* de construir UI.
3. **#7 RFM** — preenche o `SegmentsCard` "Em breve" já renderizado à espera.

> Quick wins mais baratos para validar o padrão de uma nova feature: **#3**
> (conversão por método — só parar de descartar um campo) e **#1**.

---

### Apêndice — método

Gerado por análise multi-agente (29 agentes): leitura paralela dos serviços do
ks-kpi-fs (`data_service`, `ga4_service`, `sage_service`, `ad_spend`,
`platform_metrics_service`, `commission_reconciler`, `mer_telegram_briefing`,
etc. → **86 capacidades** mapeadas), síntese de lacunas (22 recomendações), e
verificação adversarial item-a-item contra `docs/trolha.docs.json` e os slices
do frontend. Os "valor/esforço" das tabelas são os **veredictos revistos** pelos
críticos, não as estimativas iniciais.
