export function calculateRugpullChance(pct, amt) {
  // pct is fraction of supply (0–1, e.g. 0.37 = 37%)
  // amt is creator's holdings value (sim currency)

  // Step 1: normalize amount on log scale (so large values don’t instantly max out risk)
  const A = Math.min(1, Math.log10(Math.max(1, amt)) / 8); 
  // now $1 → 0, $10k → ~0.5, $100M → ~1

  // Step 2: weighted risk score
  const R = 0.6 * pct + 0.4 * A; 

  // Step 3: logistic transformation (gentler slope & midpoint)
  const k = 3;     // smaller = smoother
  const t = 0.5;   // midpoint
  const probability = 1 / (1 + Math.exp(-k * (R - t)));

  return probability;
}