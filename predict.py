import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model.pkl")

# ✅ Check if file exists
if not os.path.exists(model_path):
    raise Exception("❌ model.pkl not found. Run train_model.py")

# ✅ Load model safely
with open(model_path, "rb") as f:
    model = pickle.load(f)

print("✅ Model loaded successfully")

# Prediction function
def predict_price(day, month, temp, humidity, rainfall, prev_price):

    avg_price_3 = prev_price
    price_change = 0

    return float(model.predict([[
        day, month, temp, humidity, rainfall,
        prev_price, avg_price_3, price_change
    ]])[0])