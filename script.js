// ── Topping Database ──────────────────────────────────────────────────────────
const toppings = [
  { id:  1, name: "Pepperoni",            emoji: "🍖", probability: 0.85, pleasantness:  7 },
  { id:  2, name: "Mozzarella Cheese",    emoji: "🧀", probability: 0.92, pleasantness:  8 },
  { id:  3, name: "Mushrooms",            emoji: "🍄", probability: 0.65, pleasantness:  5 },
  { id:  4, name: "Bell Peppers",         emoji: "🫑", probability: 0.60, pleasantness:  4 },
  { id:  5, name: "Onions",               emoji: "🧅", probability: 0.55, pleasantness:  3 },
  { id:  6, name: "Black Olives",         emoji: "🫒", probability: 0.45, pleasantness:  2 },
  { id:  7, name: "Anchovies",            emoji: "🐟", probability: 0.25, pleasantness:  1 },
  { id:  8, name: "Jalapeños",            emoji: "🌶️", probability: 0.35, pleasantness:  3 },
  { id:  9, name: "Pineapple",            emoji: "🍍", probability: 0.40, pleasantness: -2 },
  { id: 10, name: "Bacon",                emoji: "🥓", probability: 0.70, pleasantness:  6 },
  { id: 11, name: "Baby Spinach",         emoji: "🥬", probability: 0.30, pleasantness:  2 },
  { id: 12, name: "Sun-dried Tomatoes",   emoji: "🍅", probability: 0.50, pleasantness:  4 },
  { id: 13, name: "Strawberries",         emoji: "🍓", probability: 0.08, pleasantness: -3 },
  { id: 14, name: "Gummy Bears",          emoji: "🐻", probability: 0.02, pleasantness: -8 },
  { id: 15, name: "Motor Oil",            emoji: "🛢️", probability: 0.01, pleasantness:-10 },
  { id: 16, name: "Blue Cheese & Honey",  emoji: "🍯", probability: 0.15, pleasantness:  5 },
  { id: 17, name: "Mango Habanero Sauce", emoji: "🥭", probability: 0.12, pleasantness:  2 },
  { id: 18, name: "Nutella",              emoji: "🍫", probability: 0.06, pleasantness: -4 },
  { id: 19, name: "Cotton Candy",         emoji: "🍬", probability: 0.04, pleasantness: -6 },
  { id: 20, name: "Dill Pickles",         emoji: "🥒", probability: 0.20, pleasantness:  0 },
  { id: 21, name: "Canned Corn",          emoji: "🌽", probability: 0.30, pleasantness: -1 },
  { id: 22, name: "Sauerkraut",           emoji: "🫙", probability: 0.15, pleasantness: -3 },
  { id: 23, name: "Spam",                emoji: "🥫", probability: 0.25, pleasantness: -4 },
];

// Maximum possible novelty = sum of all -log2(p) values (all toppings selected)
const MAX_NOVELTY = toppings.reduce((s, t) => s + (-Math.log2(t.probability)), 0);
// Arc length for a semicircle with radius 100: π * 100
const ARC_LENGTH = Math.PI * 100;

let selected = new Set();

// ── Score Calculation ─────────────────────────────────────────────────────────
function computeScores() {
  let novelty = 0;
  let quality = 0;
  selected.forEach(id => {
    const t = toppings.find(t => t.id === id);
    // Bayesian surprise: I(x) = -log2(p(x)). Grows exponentially as p → 0.
    novelty += -Math.log2(t.probability);
    quality += t.pleasantness;
  });
  return { novelty, quality };
}

// ── Gauge Update ──────────────────────────────────────────────────────────────
function setGauge(gaugeId, percent) {
  const fill = document.querySelector(`#${gaugeId} .gauge-fill`);
  const dashLen = Math.max(0, Math.min(1, percent / 100)) * ARC_LENGTH;
  fill.style.strokeDasharray = `${dashLen.toFixed(2)} ${ARC_LENGTH.toFixed(2)}`;
}

// ── Main Update ───────────────────────────────────────────────────────────────
function update() {
  const { novelty, quality } = computeScores();

  // Novelty: 0–100% normalized against theoretical max (all toppings)
  const noveltyPct = Math.min(100, (novelty / MAX_NOVELTY) * 100);

  // Quality: 0% = no quality, 100% = max. Fill with absolute value; color signals pos/neg.
  const qualityPct = Math.min(100, Math.abs(quality) / 50 * 100);

  // Update novelty gauge + colour gradient based on intensity
  setGauge('novelty-gauge', noveltyPct);
  const nFill = document.querySelector('#novelty-gauge .gauge-fill');
  if (noveltyPct >= 65)      nFill.style.stroke = '#a855f7';   // purple — very novel
  else if (noveltyPct >= 35) nFill.style.stroke = '#3b82f6';   // blue — interesting
  else                       nFill.style.stroke = '#22c55e';   // green — ordinary

  // Update quality gauge + colour based on sign
  setGauge('quality-gauge', qualityPct);
  const qFill = document.querySelector('#quality-gauge .gauge-fill');
  qFill.style.stroke = quality >= 0 ? '#22c55e' : '#ef4444';

  // Update numeric labels
  document.getElementById('novelty-value').textContent = `${noveltyPct.toFixed(0)}%`;
  document.getElementById('quality-value').textContent =
    (quality >= 0 ? '+' : '') + quality;

  // ── Status Banner ──
  const banner = document.getElementById('status-banner');
  banner.className = 'status-banner'; // reset

  if (selected.size === 0) {
    banner.textContent = 'Select toppings to begin your experiment';
    banner.classList.add('idle');

  // ── High Novelty ──
  } else if (noveltyPct >= 55 && quality >= 15) {
    banner.textContent = '✨ COMPUTATIONAL MASTERPIECE ✨';
    banner.classList.add('masterpiece');
  } else if (noveltyPct >= 55 && quality >= 0) {
    banner.textContent = '🧪 Edgy Experiment — Weird but Surviving';
    banner.classList.add('interesting');
  } else if (noveltyPct >= 35) {
    banner.textContent = '🔬 Getting Scientifically Interesting…';
    banner.classList.add('interesting');

  // ── Low Novelty + High Quality (ceiling matches floor above: < 35%) ──
  } else if (noveltyPct < 10 && quality >= 18) {
    banner.textContent = '👑 THE CROWD PLEASER — Peak Conventional Pizza';
    banner.classList.add('crowdpleaser');
  } else if (noveltyPct < 22 && quality >= 10) {
    banner.textContent = '⭐ Certified Classic — Safe, Solid, Delicious';
    banner.classList.add('classic');
  } else if (noveltyPct < 35 && quality >= 4) {
    banner.textContent = '😌 Reliable Choice — No Surprises Here';
    banner.classList.add('reliable');

  // ── Negative Quality ──
  } else if (quality < -10) {
    banner.textContent = '🤢 UNCONSUMABLE GARBAGE 🤢';
    banner.classList.add('garbage');
  } else if (quality < 0) {
    banner.textContent = '😬 Questionable Decisions Were Made';
    banner.classList.add('questionable');

  } else {
    banner.textContent = '🍕 A Respectable Pizza';
    banner.classList.add('idle');
  }

  // ── Pizza Emoji Preview ──
  const pizzaEl = document.getElementById('pizza-visual');
  const sel = toppings.filter(t => selected.has(t.id));
  pizzaEl.textContent = sel.length === 0 ? '🍕' : sel.map(t => t.emoji).join('');

  document.getElementById('selected-count').textContent =
    `${selected.size} topping${selected.size !== 1 ? 's' : ''} selected`;
}

// ── Render Ingredients List ───────────────────────────────────────────────────
function renderToppingsList() {
  const container = document.getElementById('toppings-list');
  container.innerHTML = toppings.map(t => `
    <label class="topping-item" data-id="${t.id}">
      <input type="checkbox" class="topping-checkbox" value="${t.id}">
      <span class="topping-emoji">${t.emoji}</span>
      <span class="topping-name">${t.name}</span>
      <span class="topping-stats">
        <span class="prob-badge" title="Probability on a typical pizza">p=${t.probability}</span>
        <span class="pleasantness-badge ${t.pleasantness >= 0 ? 'pos' : 'neg'}">
          ${t.pleasantness >= 0 ? '+' : ''}${t.pleasantness}
        </span>
      </span>
    </label>
  `).join('');

  container.querySelectorAll('.topping-checkbox').forEach(cb => {
    cb.addEventListener('change', e => {
      const id = parseInt(e.target.value);
      if (e.target.checked) selected.add(id);
      else selected.delete(id);
      e.target.closest('.topping-item').classList.toggle('selected', e.target.checked);
      update();
    });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderToppingsList();
  update();

  document.getElementById('clear-btn').addEventListener('click', () => {
    selected.clear();
    document.querySelectorAll('.topping-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.topping-item.selected').forEach(el => el.classList.remove('selected'));
    update();
  });
});
