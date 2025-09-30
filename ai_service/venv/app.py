from flask import Flask, request, jsonify
import joblib
import numpy as np
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow requests from React/Express

# Load model, scaler, encoder
model = joblib.load("microplastics_model.joblib")
scaler = joblib.load("scaler.joblib")
label_encoder = joblib.load("label_encoder.joblib")

with open("feature_names.json") as f:
    feature_names = json.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print(" Incoming:", data)

        values = [data.get(col, 0) for col in feature_names]
        print(" Values in order:", values)

        X = np.array(values).reshape(1, -1)
        X_scaled = scaler.transform(X)

        pred = model.predict(X_scaled)[0]
        proba = model.predict_proba(X_scaled)[0]
        confidence = float(np.max(proba))

        label = label_encoder.inverse_transform([pred])[0]

        print("Prediction:", label, " | Confidence:", confidence)

        return jsonify({
            "prediction": label,
            "raw_class": int(pred),
            "confidence": confidence
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True, use_reloader=False)

