// ---------- Passcode gate ----------

const PASSCODE_KEY = "amigoSecreto.passcodeOk";

function initPasscodeGate() {
  const gate = document.getElementById("passcode-gate");
  const app = document.getElementById("app");
  const form = document.getElementById("passcode-form");
  const input = document.getElementById("passcode-input");
  const error = document.getElementById("passcode-error");

  if (localStorage.getItem(PASSCODE_KEY) === "true") {
    gate.classList.add("hidden");
    app.classList.remove("hidden");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim() === CONFIG.passcode) {
      localStorage.setItem(PASSCODE_KEY, "true");
      gate.classList.add("hidden");
      app.classList.remove("hidden");
    } else {
      error.classList.remove("hidden");
      input.value = "";
      input.focus();
    }
  });
}

// ---------- Header text ----------

function initHeaderText() {
  document.getElementById("event-title").textContent = CONFIG.eventTitle;
  document.getElementById("event-subtitle").textContent = CONFIG.eventSubtitle;
  document.title = CONFIG.eventTitle;
}

// ---------- Countdown ----------

function getTargetDate() {
  return new Date(CONFIG.countdownTarget);
}

function isDrawPhase() {
  return Date.now() >= getTargetDate().getTime();
}

function initCountdown(onPhaseChange) {
  const section = document.getElementById("countdown-section");
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const remaining = getTargetDate().getTime() - Date.now();

    if (remaining <= 0) {
      section.classList.add("hidden");
      clearInterval(timer);
      onPhaseChange();
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  const timer = setInterval(tick, 1000);
  tick();
}

// ---------- Registration ----------

function normalizeName(name, surname) {
  return (name.trim() + " " + surname.trim()).toLowerCase().replace(/\s+/g, " ");
}

function initRegistration(participantsCache) {
  const form = document.getElementById("registration-form");
  const nameInput = document.getElementById("reg-name");
  const surnameInput = document.getElementById("reg-surname");
  const error = document.getElementById("registration-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.classList.add("hidden");

    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    if (!name || !surname) return;

    const key = normalizeName(name, surname);
    const isDuplicate = Object.values(participantsCache.data).some(
      (p) => normalizeName(p.name, p.surname) === key
    );

    if (isDuplicate) {
      error.textContent =
        "Ya hay alguien anotado con ese nombre y apellido. Agrega una inicial para diferenciarte.";
      error.classList.remove("hidden");
      return;
    }

    db.ref("participants").push({ name, surname, hasDrawn: false });
    nameInput.value = "";
    surnameInput.value = "";
    nameInput.focus();
  });
}

// ---------- Participants list (live) ----------

function initParticipantsList(participantsCache, onUpdate) {
  const listEl = document.getElementById("participants-list");
  const emptyEl = document.getElementById("participants-empty");
  const headingEl = document.getElementById("participants-heading");

  db.ref("participants").on("value", (snapshot) => {
    participantsCache.data = snapshot.val() || {};
    renderParticipants();
    onUpdate();
  });

  function renderParticipants() {
    const entries = Object.entries(participantsCache.data);

    headingEl.textContent = "Quiénes juegan";

    listEl.innerHTML = "";
    entries.forEach(([, p]) => {
      const li = document.createElement("li");
      li.textContent = p.name + " " + p.surname;
      listEl.appendChild(li);
    });

    emptyEl.classList.toggle("hidden", entries.length > 0);
  }
}

// ---------- Assignment (single-cycle derangement) ----------

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function computeAssignments(participantIds) {
  const order = shuffle(participantIds);
  const assignments = {};
  for (let i = 0; i < order.length; i++) {
    assignments[order[i]] = order[(i + 1) % order.length];
  }
  return assignments;
}

function ensureAssignmentsComputed() {
  db.ref("participants").once("value").then((snapshot) => {
    const ids = Object.keys(snapshot.val() || {});
    if (ids.length < 2) return;

    db.ref("gameState/assignmentsComputed").transaction((current) => {
      if (current) return; // ya calculado por otro visitante: abortar
      return true;
    }, (error, committed) => {
      if (error || !committed) return;

      const assignments = computeAssignments(ids);
      const updates = {};
      Object.entries(assignments).forEach(([giverId, targetId]) => {
        updates["assignments/" + giverId + "/targetId"] = targetId;
      });
      db.ref().update(updates);
    });
  });
}

// ---------- Draw phase UI ----------

function initDrawPhase(participantsCache) {
  const drawSection = document.getElementById("draw-section");
  const select = document.getElementById("draw-select");
  const form = document.getElementById("draw-form");
  const error = document.getElementById("draw-error");
  const roulette = document.getElementById("roulette");
  const rouletteName = document.getElementById("roulette-name");
  const resultBox = document.getElementById("reveal-result");
  const resultName = document.getElementById("reveal-name");

  let activated = false;

  function activate() {
    if (activated) return;
    activated = true;
    document.getElementById("registration-section").classList.add("hidden");
    drawSection.classList.remove("hidden");
    ensureAssignmentsComputed();
  }

  function refreshSelect() {
    const previousValue = select.value;
    select.innerHTML = '<option value="" disabled selected>Elige tu nombre...</option>';
    Object.entries(participantsCache.data)
      .filter(([, p]) => !p.hasDrawn)
      .forEach(([id, p]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = p.name + " " + p.surname;
        select.appendChild(option);
      });
    if ([...select.options].some((o) => o.value === previousValue)) {
      select.value = previousValue;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.classList.add("hidden");
    resultBox.classList.add("hidden");

    const participantId = select.value;
    if (!participantId) return;

    const drawnRef = db.ref("participants/" + participantId + "/hasDrawn");
    drawnRef.transaction((current) => {
      if (current === true) return; // ya lo había descubierto: abortar
      return true;
    }, (txError, committed) => {
      if (txError) return;

      if (!committed) {
        error.textContent =
          "Esa persona ya descubrió a su amigo secreto antes. Revisa lo que anotó.";
        error.classList.remove("hidden");
        return;
      }

      revealFor(participantId);
    });
  });

  function revealFor(participantId) {
    db.ref("assignments/" + participantId + "/targetId").once("value").then((snap) => {
      const targetId = snap.val();
      const target = participantsCache.data[targetId];
      if (!target) return;
      playRoulette(target.name + " " + target.surname);
    });
  }

  function playRoulette(finalName) {
    form.classList.add("hidden");
    roulette.classList.remove("hidden");

    const candidates = Object.values(participantsCache.data).map(
      (p) => p.name + " " + p.surname
    );

    let ticks = 0;
    const totalTicks = 18;
    const spin = setInterval(() => {
      rouletteName.textContent =
        candidates[Math.floor(Math.random() * candidates.length)];
      ticks++;
      if (ticks >= totalTicks) {
        clearInterval(spin);
        roulette.classList.add("hidden");
        resultName.textContent = finalName;
        resultBox.classList.remove("hidden");
      }
    }, 90);
  }

  return { activate, refreshSelect };
}

// ---------- Boot ----------

function boot() {
  initPasscodeGate();
  initHeaderText();

  const participantsCache = { data: {} };
  const draw = initDrawPhase(participantsCache);

  initRegistration(participantsCache);
  initParticipantsList(participantsCache, () => draw.refreshSelect());

  function enterDrawPhaseIfDue() {
    if (isDrawPhase()) draw.activate();
  }

  initCountdown(enterDrawPhaseIfDue);
  enterDrawPhaseIfDue();
}

document.addEventListener("DOMContentLoaded", boot);
