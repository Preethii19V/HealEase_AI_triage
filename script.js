// Configure API base (works for localhost and 127.0.0.1)
const API_BASE = (["localhost", "127.0.0.1"].includes(location.hostname))
  ? "http://127.0.0.1:5000"
  : "https://your-backend.onrender.com";

// App state
const state = { age: null, sex: null, symptoms: [], redFlags: [], details: {}, notes: "" };

// Elements
const steps = Array.from(document.querySelectorAll(".step"));
const statusDot = document.getElementById("backend-status");
const statusText = document.getElementById("status-text");
const progressBar = document.getElementById("progressBar");

const startBtn = document.getElementById("startBtn");
const toStep3 = document.getElementById("toStep3");
const toStep4 = document.getElementById("toStep4");
const toStep5 = document.getElementById("toStep5");
const analyzeBtn = document.getElementById("analyzeBtn");
const againBtn = document.getElementById("againBtn");
const homeBtn = document.getElementById("homeBtn");
const tipsBtn = document.getElementById("tipsBtn");
const backHome = document.getElementById("backHome");

const ageEl = document.getElementById("age");
const symptomTitle = document.getElementById("symptom-title");
const symptomList = document.getElementById("symptom-list");
const redflagList = document.getElementById("redflag-list");
const followups = document.getElementById("followups");
const notesEl = document.getElementById("notes");

const resultCard = document.getElementById("result");
const urgencyEl = document.getElementById("urgency");
const reasonEl = document.getElementById("reason");
const suggestionsEl = document.getElementById("suggestions");
const insightsWhyEl = document.getElementById("insights-why");
const insightsConfEl = document.getElementById("insights-confidence");
const agentResponseEl = document.getElementById("agent-response");
const historyList = document.getElementById("history-list");
const tipsList = document.getElementById("tips-list");

// Constants for UI fallback
const RED_FLAGS_UI = [
  "severe_chest_pain","difficulty_breathing","unconsciousness",
  "very_high_fever","seizures","sudden_confusion","severe_bleeding"
];
const ADULT_SYMPTOMS = [
  "abdominal_pain","blood_in_stool","chest_pain","constipation","cough","diarrhea",
  "difficulty_swallowing","dizziness","eye_discomfort_redness","foot_or_ankle_pain",
  "leg_swelling","headache","heart_palpitations","hip_pain","knee_pain","low_back_pain",
  "nasal_congestion","nausea_vomiting","neck_pain","numbness_tingling_hands",
  "pelvic_pain_female","pelvic_pain_male","shortness_of_breath","shoulder_pain",
  "sore_throat","urinary_problems","wheezing","fever","fatigue","chills"
];
const CHILD_SYMPTOMS = [
  "abdominal_pain","constipation","cough","diarrhea","ear_pain_problems",
  "eye_discomfort_redness","fever","headache","joint_or_muscle_pain","nasal_congestion",
  "nausea_vomiting","skin_rashes","sore_throat","urinary_problems","wheezing","fatigue","chills"
];

// Navigation
function go(stepIndex) {
  steps.forEach((s, i) => s.classList.toggle("active", i === stepIndex));
  const pct = Math.round(((stepIndex + 1) / steps.length) * 100);
  progressBar.style.width = `${Math.max(16, pct)}%`;
}

async function checkBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const ok = res.ok;
    statusDot.style.background = ok ? "#2ecc71" : "#e74c3c";
    statusText.textContent = ok ? "System Online" : "Limited Mode (Offline Tips Only)";
  } catch (err) {
    statusDot.style.background = "#e74c3c";
    statusText.textContent = "Limited Mode (Offline Tips Only)";
  }
}

// Step 1
startBtn.addEventListener("click", () => go(1));

// Step 2
toStep3.addEventListener("click", async () => {
  const ageVal = Number(ageEl.value);
  const sexVal = document.querySelector('input[name="sex"]:checked')?.value;
  if (!ageVal || ageVal < 0 || !sexVal) {
    alert("Please enter age (≥ 0) and select sex.");
    return;
  }
  state.age = ageVal;
  state.sex = sexVal;

  const isChild = ageVal < 18;
  symptomTitle.textContent = isChild ? "Select child symptoms" : "Select adult symptoms";

  try {
    const res = await fetch(`${API_BASE}/api/symptoms?age=${ageVal}`);
    const data = await res.json();
    renderCheckboxes(symptomList, data.symptoms);
  } catch {
    renderCheckboxes(symptomList, isChild ? CHILD_SYMPTOMS : ADULT_SYMPTOMS);
  }

  go(2);
});

// Step 3
toStep4.addEventListener("click", () => {
  state.symptoms = getSelected(symptomList);
  if (state.symptoms.length === 0) {
    alert("Please select at least one symptom.");
    return;
  }
  renderCheckboxes(redflagList, RED_FLAGS_UI);
  go(3);
});

// Step 4
toStep5.addEventListener("click", () => {
  state.redFlags = getSelected(redflagList);
  renderFollowUps(state.symptoms, state.age < 18);
  go(4);
});

// Step 5 → Analyze (AI Agent)
analyzeBtn.addEventListener("click", async () => {
  const { details, notes } = collectDetails(state.symptoms, state.age < 18);
  state.details = details;
  state.notes = notes || notesEl?.value || "";

  go(5); // show spinner

  try {
    const res = await fetch(`${API_BASE}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: state.age,
        sex: state.sex,
        symptoms: state.symptoms,
        redFlags: state.redFlags,
        details: state.details,
        notes: state.notes
      })
    });
    const data = await res.json();
    renderAgentResult(data);
    await loadHistory();
    go(6); // show results step
  } catch (e) {
    alert("Unable to analyze right now. Showing offline tips.");
    await loadTips("IN-TN");
    go(7); // tips step
  }
});

// Result actions
againBtn.addEventListener("click", () => { resetState(); go(1); });
homeBtn.addEventListener("click", () => go(0));
tipsBtn.addEventListener("click", async () => { await loadHistory(); await loadTips("IN-TN"); go(7); });
backHome?.addEventListener("click", () => go(0));

// Helpers
function renderCheckboxes(listEl, items) {
  listEl.innerHTML = items.map(i => `
    <div class="col-auto">
      <label class="form-check-label">
        <input class="form-check-input me-2" type="checkbox" value="${i}" />
        <span>${labelize(i)}</span>
      </label>
    </div>
  `).join("");
}

function getSelected(listEl) {
  return Array.from(listEl.querySelectorAll("input[type=checkbox]:checked")).map(i => i.value);
}

function labelize(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function setResultStyle(urgency) {
  resultCard.classList.remove("green","yellow","orange","red","show");
  const map = { "Self-care":"green","Telehealth":"yellow","Clinic":"orange","ER":"red" };
  resultCard.classList.add(map[urgency] || "green");
  requestAnimationFrame(() => resultCard.classList.add("show"));
}

function renderAgentResult(data) {
  const triage = data.triage || {};
  urgencyEl.textContent = triage.urgency || "";
  reasonEl.textContent = triage.reason || "";
  suggestionsEl.innerHTML = (triage.suggestions || []).map(s => `<li>${s}</li>`).join("");
  insightsWhyEl.textContent = triage.insights?.why || "";
  insightsConfEl.textContent = triage.insights?.confidence || "";
  agentResponseEl.textContent = data.agentResponse || "AI agent unavailable. Please try again later.";
  setResultStyle(triage.urgency || "Self-care");
}

async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/api/history`);
    const items = await res.json();
    historyList.innerHTML = items.slice().reverse().map(i => `
      <li>
        <strong>${i.urgency}</strong> — ${new Date(i.timestamp).toLocaleString()}<br/>
        <span>${i.reason}</span>
      </li>
    `).join("");
  } catch {}
}

async function loadTips(region = "IN-TN") {
  try {
    const res = await fetch(`${API_BASE}/api/tips?region=${region}`);
    const { tips } = await res.json();
    tipsList.innerHTML = tips.map(t => `<li>${t}</li>`).join("");
  } catch {}
}

function resetState() {
  state.age = null; state.sex = null; state.symptoms = [];
  state.redFlags = []; state.details = {}; state.notes = "";
  ageEl.value = ""; document.querySelectorAll('input[name="sex"]').forEach(r => r.checked = false);
  symptomList.innerHTML = ""; redflagList.innerHTML = ""; followups.innerHTML = "";
  agentResponseEl.textContent = "";
}

// Follow-up generator (simple demo)
function renderFollowUps(symptoms, isChild) {
  const hasCough = symptoms.includes("cough");
  const hasFever = symptoms.includes("fever");
  const fields = [];

  if (hasCough) {
    fields.push(`
      <div class="col-md-6">
        <label class="form-label">Cough duration (days)</label>
        <input id="cough_duration" type="number" class="form-control" min="0" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Cough pain level (0–10)</label>
        <input id="cough_pain" type="number" class="form-control" min="0" max="10" />
      </div>
    `);
  }
  if (hasFever) {
    fields.push(`
      <div class="col-md-6">
        <label class="form-label">${isChild ? "Child" : "Adult"} fever max temp (°C)</label>
        <input id="fever_temp" type="number" class="form-control" step="0.1" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Fever duration (days)</label>
        <input id="fever_duration" type="number" class="form-control" min="0" />
      </div>
    `);
  }

  followups.innerHTML = fields.join("");
}

function collectDetails(symptoms, isChild) {
  const details = {};
  if (symptoms.includes("cough")) {
    details["cough"] = {
      durationDays: Number(document.getElementById("cough_duration")?.value || 0),
      painLevel: Number(document.getElementById("cough_pain")?.value || 0)
    };
  }
  if (symptoms.includes("fever")) {
    const key = isChild ? "fever_child" : "fever_adult";
    details[key] = {
      maxTemp: Number(document.getElementById("fever_temp")?.value || 0),
      durationDays: Number(document.getElementById("fever_duration")?.value || 0)
    };
  }
  return { details, notes: "" };
}

// Init
checkBackend();
