const BOX_SVG = (num) => `
<svg class="box-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="24" width="40" height="22" rx="4" fill="#1c1c28" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <rect x="4" y="17" width="44" height="9" rx="3" fill="#22222f" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
  <rect x="22" y="17" width="8" height="29" rx="2" fill="rgba(255,255,255,0.06)"/>
  <rect x="22" y="17" width="8" height="9" rx="2" fill="rgba(200,169,110,0.18)"/>
  <text x="26" y="13" text-anchor="middle" font-size="8" fill="rgba(200,169,110,0.45)" font-family="'Bebas Neue',sans-serif" letter-spacing="1">${num}</text>
</svg>`;

const PRIZES = [50, 100, 200, "LOSE"];
const COLOR_CLASS = { 50: "green", 100: "blue", 200: "purple", LOSE: "red" };
const COLOR_HEX = {
  green: "#3ecf8e",
  blue: "#60a5fa",
  purple: "#a78bfa",
  red: "#f16060",
};

let round = 0;
let score = 0;
let roundScores = [];
let prizes = [];
let locked = false;

function shuffle(a) {
  return [...a].sort(() => Math.random() - 0.5);
}

function startGame() {
  round = 0;
  score = 0;
  roundScores = [];
  locked = false;
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("play-screen").style.display = "";
  document.getElementById("play-screen").classList.remove("shake");
  document.getElementById("score-disp").textContent = "0";
  showRound();
}

function showRound() {
  locked = false;
  document.getElementById("rnum").textContent = round + 1;
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";
  document.getElementById("next-btn").style.display = "none";

  for (let i = 0; i < 3; i++) {
    const s = document.getElementById("seg" + i);
    s.className = "round-seg" + (i < round ? " done" : i === round ? " active" : "");
  }

  prizes = shuffle(PRIZES);
  const container = document.getElementById("boxes");
  container.innerHTML = "";
  prizes.forEach((p, i) => {
    const box = document.createElement("div");
    box.className = "box";
    const label = p === "LOSE" ? "LOSE" : "+" + p;
    const sublabel = p === "LOSE" ? "bad luck" : "points";
    box.innerHTML = `${BOX_SVG(i + 1)}
      <div class="box-num">Box ${i + 1}</div>
      <div class="reveal-badge">
        <div class="reveal-val">${label}</div>
        <div class="reveal-label">${sublabel}</div>
      </div>`;
    box.onclick = () => pick(i, box);
    container.appendChild(box);
  });
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = 4 + Math.random() * 7;
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 90;
    p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${
      x - size / 2
    }px;top:${y - size / 2}px;--tx:${Math.cos(angle) * dist}px;--ty:${
      Math.sin(angle) * dist
    }px;animation-duration:${0.5 + Math.random() * 0.5}s;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function pick(idx, clickedBox) {
  if (locked) return;
  locked = true;
  const boxes = document.querySelectorAll(".box");
  const fb = document.getElementById("feedback");
  const prize = prizes[idx];
  const rect = clickedBox.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const col = COLOR_CLASS[prize === "LOSE" ? "LOSE" : prize];

  prizes.forEach((p, i) => {
    boxes[i].classList.add("revealed");
    if (p === "LOSE") boxes[i].classList.add("lost");
    else boxes[i].classList.add("won-" + p);
    if (i !== idx) boxes[i].classList.add("dim");
  });

  if (prize === "LOSE") {
    fb.textContent = "You hit the LOSE box — 0 points this round!";
    fb.className = "feedback lose";
    document.getElementById("play-screen").classList.add("shake");
    setTimeout(
      () => document.getElementById("play-screen").classList.remove("shake"),
      500
    );
    spawnParticles(cx, cy, COLOR_HEX.red);
    // Restart the whole game after showing the loss feedback.
    setTimeout(() => startGame(), 900);
    return;
  } else {
    score += prize;
    roundScores.push(prize);
    fb.textContent = "+" + prize + " points — great pick!";
    fb.className = "feedback win";
    const sd = document.getElementById("score-disp");
    sd.textContent = score;
    sd.classList.add("bump");
    setTimeout(() => sd.classList.remove("bump"), 400);
    spawnParticles(cx, cy, COLOR_HEX[col]);
  }

  round++;
  if (round < 3) {
    // Auto-advance to the next round after a win.
    setTimeout(showRound, 650);
  } else {
    // After 3 wins, show the final results.
    setTimeout(showEnd, 800);
  }
}

function nextRound() {
  showRound();
}

function showEnd() {
  document.getElementById("play-screen").style.display = "none";
  const es = document.getElementById("end-screen");
  // CSS sets display:none; we must override it here to show the end UI.
  es.style.display = "block";
  es.style.animation = "none";
  es.offsetHeight;
  es.style.animation = "";

  const won = roundScores.filter((s) => s > 0).length;
  const icon = score >= 300 ? "🏆" : score >= 150 ? "🎯" : score > 0 ? "🎲" : "💀";
  const title =
    score >= 300
      ? "Perfect Run"
      : score >= 150
        ? "Well Played"
        : score > 0
          ? "Not Bad"
          : "Wiped Out";
  document.getElementById("end-icon").textContent = icon;
  document.getElementById("end-title").textContent = title;
  document.getElementById("end-sub").textContent = `${won} of 3 rounds won`;

  const colorMap = { 50: "green", 100: "blue", 200: "purple", 0: "red" };
  const labelMap = { 50: "+50", 100: "+100", 200: "+200", 0: "LOSE" };
  document.getElementById("round-recap").innerHTML = roundScores
    .map(
      (s, i) => `
    <div class="recap-card">
      <div class="rc-label">Round ${i + 1}</div>
      <div class="rc-val ${colorMap[s]}">${labelMap[s]}</div>
    </div>`
    )
    .join("");
  document.getElementById("total-val").textContent = score;
}

// Start game on load
startGame();
