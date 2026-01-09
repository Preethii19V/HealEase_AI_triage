from flask import Flask, request, jsonify
from flask_cors import CORS
from triage_logic import triage, ADULT_SYMPTOMS, CHILD_SYMPTOMS
import os
import openai

app = Flask(__name__)
CORS(app)

# Load API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

HISTORY = []

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.post("/api/triage")
def triage_route():
    data = request.get_json(force=True) or {}
    result = triage(data)
    HISTORY.append(result)
    return jsonify(result)

@app.post("/api/agent")
def agent_route():
    data = request.get_json(force=True) or {}
    triage_result = triage(data)

    prompt = f"""
    You are HealEase, an empathetic healthcare triage assistant.
    Urgency: {triage_result['urgency']}
    Reason: {triage_result['reason']}
    Suggestions: {', '.join(triage_result['suggestions'])}

    Explain this result to the patient in a friendly, clear way.
    Add empathy, reassurance, and practical next steps.
    Keep it concise (120–180 words).
    """

    ai_message = "AI agent unavailable. Please try again later."
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful healthcare triage assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        ai_message = resp["choices"][0]["message"]["content"]
    except Exception as e:
        print("AI agent error:", e)

    HISTORY.append(triage_result)

    return jsonify({
        "triage": triage_result,
        "agentResponse": ai_message
    })

@app.get("/api/history")
def history():
    return jsonify(HISTORY[-20:])

@app.get("/api/symptoms")
def symptoms():
    age = int(request.args.get("age", 18))
    is_child = age < 18
    return jsonify({
        "age": age,
        "set": "child" if is_child else "adult",
        "symptoms": CHILD_SYMPTOMS if is_child else ADULT_SYMPTOMS
    })

@app.get("/api/tips")
def tips():
    region = request.args.get("region", "IN-TN")
    tips = [
        "Wash hands frequently and avoid touching your face.",
        "Stay up to date with local health advisories.",
        "During peak flu season, consider masks in crowded indoor spaces."
    ]
    if region.startswith("IN"):
        tips.append("Chennai: Stay hydrated and avoid heat exposure during hot spells.")
    return jsonify({"tips": tips})

if __name__ == "__main__":
    # Run on 8000
    app.run(host="0.0.0.0", port=8000)
