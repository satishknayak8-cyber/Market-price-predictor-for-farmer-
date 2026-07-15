from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests
from datetime import datetime
from geopy.distance import geodesic
from predict import predict_price

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database=""
    )

# =========================
# USER SIGNUP
# =========================
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    conn = get_db()
    cursor = conn.cursor()

    # Check existing user
    cursor.execute("SELECT * FROM users WHERE email=%s", (data['email'],))
    if cursor.fetchone():
        conn.close()
        return jsonify({"status": "exists", "message": "User already exists"})

    # Insert user
    cursor.execute(
        "INSERT INTO users (username, mobile, email, password, terms) VALUES (%s,%s,%s,%s,%s)",
        (data['username'], data['mobile'], data['email'], data['password'], data['terms'])
    )

    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


# =========================
# USER LOGIN
# =========================
@app.route('/login', methods=['POST'])
def login():
    data = request.json

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (data['username'], data['password'])
    )

    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "fail"})


# =========================
# ADMIN LOGIN
# =========================
@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.json

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM admin WHERE username=%s AND password=%s",
        (data['username'], data['password'])
    )

    admin = cursor.fetchone()
    conn.close()

    if admin:
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "fail"})


# =========================
# ADD MARKET (ADMIN ONLY)
# =========================
API_KEY="";
@app.route('/add-market', methods=['POST'])
def add_market():

    data = request.json
    crop = data['crop']
    market = data['market']
    date = data['date']
    price = data['price']

    # 🔹 Fetch weather automatically
    url = f""
    weather = requests.get(url).json()

    temp = weather['main']['temp']
    humidity = weather['main']['humidity']
    rainfall = weather.get('rain', {}).get('1h', 0)
    latitude = weather['coord']['lat']
    longitude = weather['coord']['lon']
    conn = get_db()
    cursor = conn.cursor()

    # Insert market data
    cursor.execute("""
        INSERT INTO market_prices (crop, market, date, price,latitude,longitude)
        VALUES (%s, %s, %s, %s,%s,%s)
    """, (crop, market, date, price,latitude,longitude))

    # Insert weather data
    cursor.execute("""
        INSERT INTO weather_data (market, date, temperature, humidity, rainfall)
        VALUES (%s, %s, %s, %s, %s)
    """, (market, date, temp, humidity, rainfall))

    conn.commit()
    conn.close()

    return jsonify({"message": "Market + Weather stored ✅"})



@app.route('/predict-full', methods=['POST'])
def predict_full():

    data = request.json
    crop = data.get('crop')
    market = data.get('market')

    # ✅ Optional GPS (can ignore if not using)
    user_lat = data.get('lat')
    user_lon = data.get('lon')

    # =========================
    # 🔹 GET LOCATION + WEATHER
    # =========================

    if user_lat and user_lon:
        # ✅ If GPS provided
        user_loc = (float(user_lat), float(user_lon))

        # 👉 Still need weather → use city fallback
        geo_url = f""
        geo_res = requests.get(geo_url).json()

        if 'main' not in geo_res:
            return jsonify({"error": "Weather fetch failed"})

    else:
        # ✅ Use city name
        geo_url = f""
        geo_res = requests.get(geo_url).json()

        if 'coord' not in geo_res:
            return jsonify({"error": "Invalid location"})

        user_loc = (
            geo_res['coord']['lat'],
            geo_res['coord']['lon']
        )

    # 🔹 Weather data
    temp = geo_res['main']['temp']
    humidity = geo_res['main']['humidity']
    rainfall = geo_res.get('rain', {}).get('1h', 0)

    today = datetime.now()
    day = today.day
    month = today.month

    # =========================
    # 🔹 DATABASE
    # =========================
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # 🔥 Previous price (IMPORTANT)
    cursor.execute("""
        SELECT price FROM market_prices 
        WHERE crop=%s ORDER BY date DESC LIMIT 1
    """, (crop,))
    
    last_price = cursor.fetchone()
    prev_price = float(last_price['price']) if last_price else 0

    # 🤖 AI Prediction
    predicted_price = predict_price(day, month, temp, humidity, rainfall, prev_price)

    # 🔹 Latest market data
    cursor.execute("""
        SELECT market, price, latitude, longitude, date
        FROM market_prices
        WHERE crop=%s
        AND date = (SELECT MAX(date) FROM market_prices)
    """, (crop,))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({"error": "No data found"})

    # =========================
    # 🔹 REMOVE DUPLICATES
    # =========================
    unique = {}
    for r in rows:
        if r['market'] not in unique:
            unique[r['market']] = r

    rows = list(unique.values())

    # =========================
    # 🔥 DISTANCE CALCULATION
    # =========================
    nearby = []

    for r in rows:
        if r['latitude'] and r['longitude']:

            market_loc = (r['latitude'], r['longitude'])
            distance = geodesic(user_loc, market_loc).km

            r['distance'] = round(distance, 2)
            nearby.append(r)

    # ❌ Important check
    if not nearby:
        return jsonify({"error": "No nearby markets found"})

    # =========================
    # ✅ SORT + LIMIT
    # =========================
    nearby = sorted(nearby, key=lambda x: x['distance'])
    nearby = nearby[:5]

    # =========================
    # 🔥 BEST MARKET
    # =========================
    best_market = max(nearby, key=lambda x: x['price'])

    # =========================
    # 💡 AI ADVICE
    # =========================
    if predicted_price > best_market['price']:
        advice = "Wait 📈 (Price likely to increase)"
    else:
        advice = "Sell now 📉 (Good current price)"

    # =========================
    # ✅ RESPONSE
    # =========================
    return jsonify({
        "predicted_price": round(predicted_price, 2),
        "nearby_markets": nearby,
        "best_market": best_market,
        "advice": advice
    })
@app.route('/nearby-markets', methods=['POST'])
def nearby_markets():

    data = request.json
    crop = data['crop']
    location = data['location']

    # 🔹 Get location
    url = f""
    res = requests.get(url).json()

    if 'coord' not in res:
        return jsonify({"error": "Invalid location"})

    user_loc = (res['coord']['lat'], res['coord']['lon'])

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # ✅ SAME AS predict-full (IMPORTANT 🔥)
    cursor.execute("""
        SELECT market, price, latitude, longitude, date
        FROM market_prices
        WHERE crop=%s
        AND date = (SELECT MAX(date) FROM market_prices)
    """, (crop,))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({"error": "No data found for this crop"})

    # 🔹 Remove duplicates
    unique = {}
    for r in rows:
        if r['market'] not in unique:
            unique[r['market']] = r

    rows = list(unique.values())

    # 🔥 Distance calculation
    nearby = []
    for r in rows:
        if r['latitude'] and r['longitude']:
            market_loc = (r['latitude'], r['longitude'])
            distance = geodesic(user_loc, market_loc).km

            # ✅ increase range
            if distance <= 300:
                r['distance'] = round(distance, 2)
                nearby.append(r)

    # ❌ If still empty → fallback
    if not nearby:
        nearby = rows[:5]

    # ✅ SORT BY DISTANCE
    nearby = sorted(nearby, key=lambda x: x['distance'])

    # ✅ LIMIT
    nearby = nearby[:5]

    return jsonify({"markets": nearby})

@app.route('/price-history', methods=['POST'])
def price_history():

    data = request.json
    crop = data.get('crop')
    market = data.get('market')
    days = int(data.get('days', 10))   # ✅ dynamic days

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # 🔥 Get last N days
    cursor.execute(f"""
        SELECT date, price 
        FROM market_prices
        WHERE crop=%s AND market=%s
        ORDER BY date DESC
        LIMIT {days}
    """, (crop, market))

    rows = cursor.fetchall()

    if not rows:
        conn.close()
        return jsonify({"error": "No data found"})

    # 🔁 correct order
    rows = rows[::-1]

    # 🔹 LAST DATA FOR PREDICTION
    last = rows[-1]

    today = datetime.now()
    day = today.day
    month = today.month

    # 🔥 Get weather
    geo_url = f""
    geo_res = requests.get(geo_url).json()

    temp = geo_res['main']['temp']
    humidity = geo_res['main']['humidity']
    rainfall = geo_res.get('rain', {}).get('1h', 0)

    prev_price = float(last['price'])

    # 🤖 Predict next day
    future_price = predict_price(day, month, temp, humidity, rainfall, prev_price)

    conn.close()

    return jsonify({
        "dates": [str(r['date']) for r in rows] + ["Future"],
        "prices": [float(r['price']) for r in rows] + [round(future_price, 2)]
    })


# ⚠️ KEEP THIS ALWAYS AT LAST
if __name__ == "__main__":
    app.run(debug=True)
