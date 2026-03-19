# ================================
# ANDROID MALWARE BACKEND (DEPLOY READY)
# ================================

import pandas as pd
import numpy as np
import shap
import lime.lime_tabular
import pickle
import os

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from androguard.misc import AnalyzeAPK

# ================================
# ENV
# ================================

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ================================
# FASTAPI
# ================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# LOAD FILES (NO DOWNLOAD)
# ================================

DATA_PATH = "data/drebin.csv"
MAPPING_PATH = "data/mapping.csv"
MODEL_PATH = "model.pkl"

df = pd.read_csv(DATA_PATH)
df = df.replace('?', 0)

X = df.drop('class', axis=1)
y = df['class']

X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

mapping = pd.read_csv(MAPPING_PATH)

# ================================
# LOAD MODEL (NO TRAINING)
# ================================

rf_model = pickle.load(open(MODEL_PATH, "rb"))

# ================================
# EXPLAINERS
# ================================

explainer = shap.TreeExplainer(rf_model)

lime_explainer = lime.lime_tabular.LimeTabularExplainer(
    training_data=X.values,
    feature_names=X.columns.tolist(),
    class_names=['Benign (B)', 'Malware (S)'],
    mode='classification',
    discretize_continuous=False
)

# ================================
# REQUEST MODEL
# ================================

class Request(BaseModel):
    sample_index: int

# ================================
# LLM
# ================================

def generate_llm_report(top_features, descriptions):
    try:
        prompt = f"""
Explain this Android app in VERY SIMPLE language.

Features:
{top_features}

Descriptions:
{descriptions}

Format:
1. Simple Summary
2. What app is doing
3. Technical details
4. Risk level
"""

        res = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        return res.choices[0].message.content

    except Exception as e:
        return f"LLM failed: {str(e)}"

# ================================
# CORE ANALYSIS
# ================================

def analyze_instance(X_sample, use_explain=True):

    prediction = rf_model.predict(X_sample)[0]
    proba = rf_model.predict_proba(X_sample)[0]

    shap_data = []
    lime_data = []

    if use_explain:
        # SHAP
        shap_values = explainer.shap_values(X_sample, check_additivity=False)

        if isinstance(shap_values, list):
            shap_vals = shap_values[1 if prediction == 'S' else 0][0]
        else:
            shap_vals = shap_values[0]

        shap_vals = np.array(shap_vals).reshape(-1)
        idxs = np.argsort(-np.abs(shap_vals))[:10]

        shap_data = [
            {"feature": str(X.columns[i]), "value": float(shap_vals[i])}
            for i in idxs
        ]

        # LIME
        lime_exp = lime_explainer.explain_instance(
            X_sample.values[0],
            rf_model.predict_proba,
            num_features=10
        )

        lime_data = [
            {"feature": str(f), "value": float(w)}
            for f, w in lime_exp.as_list()
        ]

    # LLM
    top_features = [i["feature"] for i in shap_data]
    top_features_desc = mapping[mapping.iloc[:, 0].isin(top_features)]

    llm_report = generate_llm_report(
        top_features,
        top_features_desc.to_string(index=False)
    )

    return {
        "prediction": str(prediction),
        "confidence": {
            "benign": float(proba[0]),
            "malware": float(proba[1])
        },
        "shap": shap_data,
        "lime": lime_data,
        "llm": llm_report
    }

# ================================
# APK FEATURE EXTRACTION
# ================================

def extract_features_from_apk(file_path):
    try:
        a, d, dx = AnalyzeAPK(file_path)

        permissions = set(a.get_permissions())
        activities = set(a.get_activities())
        services = set(a.get_services())
        receivers = set(a.get_receivers())

        features = {}

        for col in X.columns:
            features[col] = 1 if (
                col in permissions or
                col in activities or
                col in services or
                col in receivers
            ) else 0

        return pd.DataFrame([features])

    except Exception as e:
        print("APK error:", e)
        return None

# ================================
# ROUTES
# ================================

@app.post("/analyze-sample")
def analyze(req: Request):
    X_sample = X.loc[[req.sample_index]]
    return analyze_instance(X_sample, use_explain=True)

@app.post("/analyze-apk")
async def analyze_apk(file: UploadFile = File(...)):

    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    X_sample = extract_features_from_apk(file_path)

    if X_sample is None:
        return {"error": "Invalid APK"}

    # 🚀 faster (no shap/lime for apk)
    return analyze_instance(X_sample, use_explain=False)

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}