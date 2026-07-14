import pandas as pd
import mysql.connector
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import pickle

# DB connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database=""
)

query = """
SELECT 
    m.date,
    m.price,
    w.temperature,
    w.humidity,
    w.rainfall
FROM market_prices m
JOIN weather_data w
ON m.market = w.market AND m.date = w.date
"""

df = pd.read_sql(query, conn)

# Feature engineering
df['date'] = pd.to_datetime(df['date'])
df['day'] = df['date'].dt.day
df['month'] = df['date'].dt.month

# 🔥 Important feature
df['prev_price'] = df['price'].shift(1)
# 🔥 NEW FEATURES
df['avg_price_3'] = df['price'].rolling(3).mean()
df['price_change'] = df['price'].diff()

# Fill missing values
df.fillna(method='bfill', inplace=True)

print("Rows before dropna:", len(df))

df = df.dropna()

print("Rows after dropna:", len(df))

X = df[['day','month','temperature','humidity','rainfall','prev_price','avg_price_3','price_change']]
y = df['price']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = RandomForestRegressor(
    n_estimators=300,
    max_depth=10,
    random_state=42
)
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model.fit(X_train, y_train)

from sklearn.metrics import r2_score
pred = model.predict(X_test)
print("Accuracy:", r2_score(y_test, pred))

# Accuracy
pred = model.predict(X_test)
print("Accuracy:", r2_score(y_test, pred))

# Save model
pickle.dump(model, open("model.pkl", "wb"))

print("✅ Model trained & saved")

print("Data preview:")
print(df.head())
print("Total rows:", len(df))