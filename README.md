# HealEase_AI_triage
HealEase is a smart and empathetic web application that helps users quickly understand their symptoms and receive safe care guidance. It combines a rule‑based triage engine with an AI agent to provide urgency levels (Self‑care, Telehealth, Clinic, ER) and conversational explanations that reassure patients and suggest practical next steps.
# HealEase — AI‑Powered Healthcare Triage Assistant

 HealEase helps users quickly understand their symptoms and get safe care guidance.  
It combines a rule‑based triage engine with an empathetic AI agent, delivering urgency levels (Self‑care, Telehealth, Clinic, ER) and conversational explanations.

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







                           


