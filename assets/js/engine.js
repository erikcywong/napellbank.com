/* NAPELL BANK — valuation engine
   V_expiry  = P * Q * D(age + term) * weight
   VaR95     = 1.645 * sigma * sqrt(term/12)
   LTV       = 1 - VaR95 - re-inspection - disposal - buffer
   Loan      = V_expiry * LTV
   All money in CNY. Prices in US cents / lb.
*/
(function () {
  var LB_PER_KG = 2.2046226218;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* Quality multiplier — asymmetric on purpose.
     Good quality caps at 1.15, poor quality can fall to 0.65.
     Upside is capped to stop sample beautification (adverse selection). */
  function scaBase(sca) {
    if (sca >= 88) return 1.10;
    if (sca >= 86) return 1.07;
    if (sca >= 84) return 1.03;
    if (sca >= 82) return 1.00;
    if (sca >= 80) return 0.92;
    return 0.75;
  }

  function moistureAdj(m) {
    if (m >= 10.5 && m <= 11.5) return 0;
    var d = m < 10.5 ? (10.5 - m) : (m - 11.5);
    return -Math.min(0.10, d * 0.04);
  }

  function defectAdj(cat) {
    if (cat === 0) return 0.02;
    if (cat === 1) return 0;
    return -0.06;
  }

  function quality(sca, moisture, defects) {
    return clamp(scaBase(sca) + moistureAdj(moisture) + defectAdj(defects), 0.65, 1.15);
  }

  /* Time decay — conservative step bands, temperature adjusted with Q10 = 2.
     A 10C rise roughly doubles the effective aging rate. */
  function decay(months, temp) {
    var k = Math.pow(2, (temp - 20) / 10);
    var m = months * k;
    if (m < 6) return 1.00;
    if (m < 12) return 0.94;
    if (m < 18) return 0.88;
    if (m < 24) return 0.80;
    return 0.68;
  }

  function effectiveMonths(months, temp) {
    return months * Math.pow(2, (temp - 20) / 10);
  }

  /* Haircut horizon is the time needed to liquidate the collateral,
     not the loan term. Term is handled by the decay factor D.
     Mixing the two is the most common error in commodity-receipt lending. */
  var LIQ_HORIZON = 3;

  function var95(sigma, horizon) {
    return 1.645 * sigma * Math.sqrt(horizon / 12);
  }

  function compute(i) {
    var priceCents = i.cPrice + i.differential;
    var usdPerKg = (priceCents / 100) * LB_PER_KG;
    var kg = i.tonnes * 1000;

    var spotValue = usdPerKg * kg * i.fx;
    var Q = quality(i.sca, i.moisture, i.defects);
    var monthsAtExpiry = i.age + i.term;
    var D = decay(monthsAtExpiry, i.temp);
    var adjValue = spotValue * Q * D;

    var varPct = var95(i.sigma, LIQ_HORIZON);
    var ltv = clamp(1 - varPct - i.reinspect - i.disposal - i.buffer, 0.30, 0.75);
    var loan = adjValue * ltv;

    var maintainLtv = 0.60;
    var liquidateLtv = 0.72;

    return {
      priceCents: priceCents,
      usdPerKg: usdPerKg,
      kg: kg,
      spotValue: spotValue,
      Q: Q,
      D: D,
      Dnow: decay(i.age, i.temp),
      effMonths: effectiveMonths(monthsAtExpiry, i.temp),
      adjValue: adjValue,
      varPct: varPct,
      ltv: ltv,
      loan: loan,
      maintainValue: loan / maintainLtv,
      liquidateValue: loan / liquidateLtv,
      maintainLtv: maintainLtv,
      liquidateLtv: liquidateLtv,
      status: loan / adjValue > 0.70 ? 'bad' : (loan / adjValue > 0.62 ? 'warn' : 'ok')
    };
  }

  function decaySeries(temp, months) {
    var out = [];
    for (var m = 0; m <= months; m++) out.push([m, decay(m, temp)]);
    return out;
  }

  function fmtCny(v) {
    if (v >= 1e8) return '¥' + (v / 1e8).toFixed(2) + '亿';
    if (v >= 1e4) return '¥' + (v / 1e4).toFixed(1) + '万';
    return '¥' + Math.round(v).toLocaleString('en-US');
  }

  function fmtPct(v, d) { return (v * 100).toFixed(d === undefined ? 1 : d) + '%'; }

  window.NB = {
    compute: compute,
    decay: decay,
    quality: quality,
    decaySeries: decaySeries,
    var95: var95,
    LIQ_HORIZON: LIQ_HORIZON,
    fmtCny: fmtCny,
    fmtPct: fmtPct,
    LB_PER_KG: LB_PER_KG
  };
})();
