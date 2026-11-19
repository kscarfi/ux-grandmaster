// Generates checkout-events.csv for the funnel analysis eval.
// Deterministic: the same seed always writes the same file.
//
// Known truth built into the data (for graders only, not shown to the agent):
// - Steps: view_product, add_to_cart, checkout_address, payment_submitted, order_complete.
// - The biggest loss is between checkout_address and payment_submitted.
// - That loss is concentrated on Android: Android users pass the payment step far
//   less often than iOS or web users.
// - A tracking change: from 2026-10-15 web stops sending view_product for
//   returning users. Grader checks whether the answer notices or caveats it.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SEED = 20261119;
const USERS = 3000;
const START = Date.UTC(2026, 9, 1); // 2026-10-01
const DAYS = 28;

let state = SEED;
function rand() {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
}
const pick = (items) => {
  const r = rand();
  let acc = 0;
  for (const [value, weight] of items) {
    acc += weight;
    if (r < acc) return value;
  }
  return items[items.length - 1][0];
};

// Probability of moving on to the next step, per device.
const PASS = {
  ios: [0.42, 0.78, 0.82, 0.91],
  android: [0.4, 0.76, 0.31, 0.9],
  web: [0.38, 0.74, 0.8, 0.92],
};
const STEPS = ["view_product", "add_to_cart", "checkout_address", "payment_submitted", "order_complete"];
const TRACKING_CHANGE = Date.UTC(2026, 9, 15);

const rows = [["user_id", "event", "timestamp", "device", "returning"]];
for (let i = 1; i <= USERS; i++) {
  const device = pick([["ios", 0.38], ["android", 0.42], ["web", 0.2]]);
  const returning = rand() < 0.35;
  let t = START + Math.floor(rand() * DAYS * 86400000);
  const id = `u${String(i).padStart(5, "0")}`;
  for (let s = 0; s < STEPS.length; s++) {
    if (s > 0 && rand() > PASS[device][s - 1]) break;
    t += 20000 + Math.floor(rand() * 240000);
    const hiddenByTracking = s === 0 && device === "web" && returning && t >= TRACKING_CHANGE;
    if (!hiddenByTracking) {
      rows.push([id, STEPS[s], new Date(t).toISOString(), device, returning ? "yes" : "no"]);
    }
  }
}

const out = join(dirname(fileURLToPath(import.meta.url)), "checkout-events.csv");
writeFileSync(out, rows.map((r) => r.join(",")).join("\n") + "\n");
console.log(`Wrote ${rows.length - 1} events for ${USERS} users to ${out}`);
