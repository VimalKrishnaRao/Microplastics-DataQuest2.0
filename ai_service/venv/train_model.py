import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier
import json

# Load dataset
data = pd.read_excel("Microplastics.xlsx")

# Use only two features
X = data[['Wave length ', '%T']]
y = data['Label']

# Encode target labels
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.25, stratify=y, random_state=42
)

# Train model
model = XGBClassifier(random_state=42)
model.fit(X_train, y_train)

# Save model, scaler, and label encoder
joblib.dump(model, "microplastics_model.joblib")
joblib.dump(scaler, "scaler.joblib")
joblib.dump(label_encoder, "label_encoder.joblib")

# Save feature names
with open("feature_names.json", "w") as f:
    json.dump(['Wave length ', '%T'], f)

print(" Model, scaler, and encoder saved successfully.")
