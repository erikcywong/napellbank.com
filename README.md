# Napell Bank — napellbank.com

Coffee bean custody and savings bank. A five-page static site built around one thesis:

> Green coffee is real collateral with a public price, a measurable grade and a known shelf life.
> It is almost never financed at its true worth because nobody prices it properly.

Live: **https://nexcoffee.cn**

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Positioning, the dead-capital problem, three-layer architecture, unit economics |
| `valuation.html` | The valuation engine + a live calculator (VaR-derived LTV, margin call, liquidation) |
| `products.html` | Vault storage, receipt lending, bean leasing, bean savings, receipt state machine |
| `compliance.html` | Registry, independent audit, pledge state machine, two precedents, five red lines |
| `assetization.html` | In-field receipts, secondary market preconditions, four-stage roadmap, REIT interface |

## The model

```
V     = P × Q × D(age + term, temp) × W
VaR95 = 1.645 × σ × √(term / 12)
LTV   = 1 − VaR95 − re-inspection − disposal − buffer
Loan  = V × LTV
```

- **P** spot anchor: ICE C-price + origin differential + FX. Specialty needs a transaction index.
- **Q** quality multiplier, deliberately asymmetric: capped at 1.15, floors at 0.65.
- **D(t)** decay in conservative step bands, Q10 = 2 (every 10 °C doubles the effective ageing rate).
- **LTV** a residual, not a negotiation. Capped 75%, floored 30%.

Defaults reproduce a 60 t lot: ¥3.24m cargo → ¥3.26m adjusted value → **52.2% LTV** → ¥1.70m loan,
margin call at ¥2.83m of collateral, liquidation at 72%.

## Structure

```
/
├── index.html
├── valuation.html
├── products.html
├── compliance.html
├── assetization.html
├── CNAME
└── assets/
    ├── css/style.css
    └── js/
        ├── i18n.js     data-en / data-zh, localStorage "napellbank_lang", "langchange" event
        ├── nav.js      active state + mobile drawer
        └── engine.js   NB.compute(), decay bands, formatting
```

No build step. ECharts 5 from jsDelivr, only on `valuation.html`.

### Adding a language string

```html
<h2 data-en="English copy" data-zh="中文文案">English copy</h2>
<!-- inside attributes: single quotes only, they are injected via innerHTML -->
```

Charts re-render on the `langchange` event.

## Deploy

GitHub Pages, `main` / root, custom domain `nexcoffee.cn` via `CNAME`, HTTPS enforced.

```bash
git add -A && git commit -m "update" && git push
```

## Disclaimer

Concept demonstration. Not an offer of financial services, credit or investment advice.
All parameter values are illustrative and require calibration against live market data.
Compliance structures described here require a written legal opinion in the operating jurisdiction.
