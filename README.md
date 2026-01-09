# HealEase_AI_triage
HealEase is a smart and empathetic web application that helps users quickly understand their symptoms and receive safe care guidance. It combines a rule‑based triage engine with an AI agent to provide urgency levels (Self‑care, Telehealth, Clinic, ER) and conversational explanations that reassure patients and suggest practical next steps.
## HealEase — AI‑Powered Healthcare Triage Assistant

 HealEase helps users quickly understand their symptoms and get safe care guidance.  
It combines a rule‑based triage engine with an empathetic AI agent, delivering urgency levels (Self‑care, Telehealth, Clinic, ER) and conversational explanations.


---
## Problem Statement

Many people delay medical care or panic unnecessarily due to a lack of clarity about symptom severity.  
Minor issues are often overtreated, while serious conditions may be ignored.

HealEase aims to reduce this gap by:
- Evaluating symptoms safely
- Detecting emergency red flags
- Providing calm, empathetic explanations
- Guiding users toward the right care option

---
## Solution Overview

HealEase classifies symptoms into four urgency levels:

- 🟢 **Self-Care**
- 🟡 **Telehealth Consultation**
- 🟠 **Clinic Visit**
- 🔴 **Emergency Room (ER)**

Each result includes:
- Clear reasoning
- Safety guidance
- AI-generated empathetic explanations

---

## Features
- Dynamic symptom selection (adult/child aware)
- Red flag detection for emergencies
- AI agent responses with empathy and clarity
- Urgency color coding (green, yellow, orange, red)
- Animated UI with bouncing icons and progress bar
- History tracking of recent triage sessions
- Local health tips for preventive care



## Tech Stack
- **Frontend:** HTML, CSS (Bootstrap, custom animations), JavaScript  
- **Backend:** Flask + Flask‑CORS  
- **AI Integration:** OpenAI API (ChatCompletion)  
- **Deployment:** Works locally or via cloud hosting

---

## Project Structure
HealEase/
├── backend/
│   ├── app.py               # Flask server with routes
│   ├── triage_logic.py     # Symptom triage rules
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── index.html           # UI layout
│   ├── style.css            # Styling + animations
│   └── script.js            # Navigation + API calls





---

## Setup & Run

### Backend & Frontend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
export OPENAI_API_KEY=sk-yourkeyhere   # Mac/Linux
setx OPENAI_API_KEY "sk-yourkeyhere"   # Windows

python app.py

cd frontend
python -m http.server 3000







                           


