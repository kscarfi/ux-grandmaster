// Statistics for UX analytics. No dependencies. Each method names its source.

/**
 * Standard normal CDF.
 * Uses the complementary error function approximation from W. J. Cody's rational
 * Chebyshev approximation as given in Numerical Recipes (erfc, fractional error
 * below 1.2e-7 everywhere).
 */
export function normalCdf(z) {
  return 1 - 0.5 * erfc(z / Math.SQRT2);
}

function erfc(x) {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

/**
 * Inverse standard normal CDF.
 * Peter J. Acklam's algorithm (relative error below 1.15e-9), refined with one
 * Newton step.
 */
export function normalQuantile(p) {
  if (!(p > 0 && p < 1)) throw new Error(`Probability must be between 0 and 1, got ${p}`);
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  let q;
  let x;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pLow) {
    q = p - 0.5;
    const r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const e = normalCdf(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

/**
 * Wilson score interval for a proportion (Wilson 1927). Better than the normal
 * approximation for small samples and rates near 0 or 1.
 */
export function wilsonInterval(successes, n, confidence = 0.95) {
  if (n === 0) return { low: 0, high: 1 };
  const z = normalQuantile(1 - (1 - confidence) / 2);
  const p = successes / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return { low: Math.max(0, center - half), high: Math.min(1, center + half) };
}

/**
 * Newcombe's hybrid score interval for a difference of two proportions
 * (Newcombe 1998, method 10). Interval for p2 - p1.
 */
export function newcombeInterval(x1, n1, x2, n2, confidence = 0.95) {
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const w1 = wilsonInterval(x1, n1, confidence);
  const w2 = wilsonInterval(x2, n2, confidence);
  const d = p2 - p1;
  const low = d - Math.sqrt((p2 - w2.low) ** 2 + (w1.high - p1) ** 2);
  const high = d + Math.sqrt((w2.high - p2) ** 2 + (p1 - w1.low) ** 2);
  return { low, high };
}

/** Two-sided two-proportion z-test with pooled variance. Returns z and p-value. */
export function twoProportionTest(x1, n1, x2, n2) {
  const pPool = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  if (se === 0) return { z: 0, p: 1 };
  const z = (x2 / n2 - x1 / n1) / se;
  return { z, p: 2 * (1 - normalCdf(Math.abs(z))) };
}

/**
 * Chi-square goodness-of-fit p-value for df = 1, via the normal distribution
 * (a chi-square with one degree of freedom is the square of a standard normal).
 */
export function chiSquareP1(stat) {
  return 2 * (1 - normalCdf(Math.sqrt(stat)));
}

/**
 * Sample ratio mismatch check. A tiny p-value means the observed split differs
 * from the planned split by more than chance, so the experiment is likely broken
 * (assignment, logging or bot filtering) and its results should not be trusted.
 * Threshold 0.001 follows common industry practice (Kohavi, Tang and Xu,
 * "Trustworthy Online Controlled Experiments", 2020, chapter 21).
 */
export const SRM_THRESHOLD = 0.001;

export function sampleRatioMismatch(n1, n2, expectedShare1 = 0.5) {
  const total = n1 + n2;
  const e1 = total * expectedShare1;
  const e2 = total - e1;
  const stat = (n1 - e1) ** 2 / e1 + (n2 - e2) ** 2 / e2;
  const p = chiSquareP1(stat);
  return { stat, p, mismatch: p < SRM_THRESHOLD };
}

/**
 * Users needed per arm to detect a change from baseline rate p1 to p2 with a
 * two-sided test (standard two-proportion formula, e.g. Fleiss, Levin and Paik,
 * "Statistical Methods for Rates and Proportions", 2003).
 */
export function sampleSizePerArm(p1, p2, { alpha = 0.05, power = 0.8 } = {}) {
  if (p1 === p2) throw new Error("The baseline and target rates must differ.");
  const za = normalQuantile(1 - alpha / 2);
  const zb = normalQuantile(power);
  const pBar = (p1 + p2) / 2;
  const n =
    (za * Math.sqrt(2 * pBar * (1 - pBar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p2 - p1) ** 2;
  return Math.ceil(n);
}

export function pct(x, digits = 1) {
  return `${(x * 100).toFixed(digits)}%`;
}
