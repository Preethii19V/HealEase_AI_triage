from datetime import datetime

URGENCY = {"SELF_CARE":"Self-care","TELEHEALTH":"Telehealth","CLINIC":"Clinic","ER":"ER"}

RED_FLAGS = {
    "severe_chest_pain",
    "difficulty_breathing",
    "unconsciousness",
    "very_high_fever",
    "seizures",
    "sudden_confusion",
    "severe_bleeding"
}

ADULT_SYMPTOMS = [
    "abdominal_pain","blood_in_stool","chest_pain","constipation","cough","diarrhea",
    "difficulty_swallowing","dizziness","eye_discomfort_redness","foot_or_ankle_pain",
    "leg_swelling","headache","heart_palpitations","hip_pain","knee_pain","low_back_pain",
    "nasal_congestion","nausea_vomiting","neck_pain","numbness_tingling_hands",
    "pelvic_pain_female","pelvic_pain_male","shortness_of_breath","shoulder_pain",
    "sore_throat","urinary_problems","wheezing","fever","fatigue","chills"
]

CHILD_SYMPTOMS = [
    "abdominal_pain","constipation","cough","diarrhea","ear_pain_problems",
    "eye_discomfort_redness","fever","headache","joint_or_muscle_pain","nasal_congestion",
    "nausea_vomiting","skin_rashes","sore_throat","urinary_problems","wheezing","fatigue","chills"
]

def triage(payload):
    age = int(payload.get("age", 0))
    sex = payload.get("sex", "other")
    symptoms = set(payload.get("symptoms", []))
    red_flags = set(payload.get("redFlags", []))
    details = payload.get("details", {})
    notes = payload.get("notes", "")

    if red_flags & RED_FLAGS:
        return result("ER",
            "One or more red flag symptoms were detected, which require immediate emergency care.",
            suggestions_er(), sources(), notes)

    is_child = age < 18

    moderate_combo = ("fever" in symptoms and "cough" in symptoms) or len(symptoms & {"fever","cough","fatigue","chills"}) >= 2
    cough = details.get("cough", {})
    cough_duration = int(cough.get("durationDays", 0))
    cough_pain = int(cough.get("painLevel", 0))
    if moderate_combo and cough_duration <= 3 and cough_pain <= 6:
        return result("Telehealth",
            "Moderate symptom combination suitable for remote evaluation.",
            suggestions_telehealth(), sources(), notes)

    prolonged = any(int(v.get("durationDays", 0)) >= 4 for v in details.values())
    severe_pain = any(int(v.get("severity", v.get("painLevel", 0))) >= 7 for v in details.values())
    if prolonged or severe_pain:
        return result("Clinic",
            "Prolonged symptoms or higher pain level warrant in-person evaluation.",
            suggestions_clinic(), sources(), notes)

    if is_child and "fever" in symptoms:
        fever = details.get("fever_child", {})
        if float(fever.get("maxTemp", 0)) >= 39.0 or int(fever.get("durationDays", 0)) >= 3:
            return result("Clinic",
                "Child fever pattern suggests in-person evaluation.",
                suggestions_clinic(), sources(), notes)

    return result("Self-care",
        "Mild, short-term symptoms can often be managed at home with monitoring.",
        suggestions_selfcare(), sources(), notes)

def result(urgency, reason, suggestions, sources, notes):
    return {
        "urgency": urgency,
        "reason": reason,
        "disclaimer": "This is not a medical diagnosis.",
        "sources": sources,
        "suggestions": suggestions,
        "insights": {
            "why": reason,
            "confidence": "Guidance based on WHO & CDC symptom triage principles"
        },
        "notesEcho": notes,
        "timestamp": datetime.utcnow().isoformat()
    }

def sources():
    return ["WHO", "CDC"]

def suggestions_selfcare():
    return ["Rest","Hydration","Monitor symptoms","Consider non‑specific over‑the‑counter relief if appropriate"]

def suggestions_telehealth():
    return ["Book online consultation","Track temperature and pain","Seek help if symptoms worsen"]

def suggestions_clinic():
    return ["Visit a clinic within 24–48 hours","Carry symptom details","Avoid delay"]

def suggestions_er():
    return ["Seek immediate emergency care","Go to nearest ER","Do not delay"]
