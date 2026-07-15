function showPage(page, element) {
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = "none";
    }
    )
    document.getElementById(page).style.display = "block";
    document.querySelectorAll(".navbar ul li").forEach(item => {
        item.classList.remove("active");
    })
    if (element) {
        element.classList.add("active");
    }
}

let slides = document.querySelectorAll(".hero-slide");
let index = 0;

function showSlide(i) {

    if (slides.length === 0) return;

    slides.forEach(slide => slide.classList.remove("active"));
    slides[i].classList.add("active");
}

function nextSlide() {
    index++;
    if (index >= slides.length) {
        index = 0;
    }
    showSlide(index);
}

function prevSlide() {
    index--;
    if (index < 0) {
        index = slides.length - 1;
    }
    showSlide(index);
}

/* Auto Slide */

setInterval(nextSlide, 5000);

// 🌦️ Get Weather Data
async function loadWeather() {

    try {
        const location = "Balasore"; // fallback
        //const location="Balasore";
        const API_KEY = ""; // 🔥 replace with your key

        const url = ``;

        let res = await fetch(url);

        if (!res.ok) {
            throw new Error("Weather API failed");
        }

        let data = await res.json();

        console.log("Weather Data:", data);

        // =========================
        // 🌡️ TEMPERATURE
        // =========================
        document.getElementById("temperature").innerHTML =`${data.main.temp} °C`;

        document.getElementById("temp").innerHTML =`Feels like ${data.main.feels_like} °C`;

        // =========================
        // 💧 HUMIDITY
        // =========================
        document.getElementById("humidity").innerHTML =`${data.main.humidity} %`;

        document.getElementById("hum").innerHTML ="Normal humidity level";

        // =========================
        // 🌦️ WEATHER CONDITION
        // =========================
        document.getElementById("weatherCondition").innerHTML =data.weather[0].main;

        document.getElementById("weatherDescription").innerHTML =data.weather[0].description;

        // =========================
        // ☁️ CLOUDS
        // =========================
        document.getElementById("cloudInfo").innerHTML =
            `${data.clouds.all} % cloudy`;

        // =========================
        // 👁️ VISIBILITY
        // =========================
        document.getElementById("visibilityInfo").innerText =
            `${data.visibility / 1000} km`;

        // =========================
        // 🌬️ WIND
        // =========================
        document.getElementById("windInfo").innerText =
            `${data.wind.speed} m/s`;

    } catch (error) {
        console.error("Weather Error:", error);
        alert("Failed to load weather ❌");
    }
}

    if(document.getElementById("temperature")){
        loadWeather();
    }

//Button click what function do
async function predictPrice() {

    try {

        const crop = document.getElementById("crop").value;
        const location = document.getElementById("location").value;
        const market = document.getElementById("market") 
                        ? document.getElementById("market").value 
                        : location;   // fallback

        if (!crop || crop === "Select Crop") {
            alert("Select crop");
            return;
        }

        console.log("Sending request...");

        let res = await fetch("http://127.0.0.1:5000/predict-full", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                crop: crop,
                market: location,
                lat: window.userLat || null,
                lon: window.userLon || null
            })
        });

        if (!res.ok) {
            throw new Error("Server error");
        }

        let data = await res.json();
        console.log("Data:", data);

        if (data.error) {
            alert(data.error);
            return;
        }
        // =========================
        // ✅ TOP SECTION UPDATE
        // =========================
        document.querySelector(".output").innerHTML =
            `🌽 ${crop} | 📍 ${location || "Manual Location"}`;

        document.querySelector(".current-price").innerHTML =
            `📈 Current Price: ₹${data.best_market.price}`;

        document.querySelector(".predicted-price").innerHTML =
            `🤖 Predicted Price: ₹${data.predicted_price}`;

        document.querySelector(".advice").innerHTML =
            `💡 ${data.advice}`;

        // =========================
        // ✅ NEARBY MARKETS
        // =========================
        let html = "<h2>Near Market</h2>";

        data.nearby_markets.forEach((m, index) => {

            if (index === 0) {
                html += `
                    <h3 style="color:green; font-weight:bold;">
                    ⭐ ${m.market} : ₹${m.price}/kg 
                    (${m.distance} km) | Profit: ₹${m.profit || 0}
                    </h3>
                `;
            } else {
                html += `
                    <h3>
                    📍 ${m.market} : ₹${m.price}/kg 
                    (${m.distance} km)
                    </h3>
                `;
            }
        });

        html += `<p>🔥 Best Market: ${data.best_market.market}</p>`;
        document.querySelector(".demand").innerHTML = html;

        // =========================
        // 📊 GRAPH LOAD (NEW)
        // =========================

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch data ❌");
    }
}

function openLoginPage() {
    window.open("../HTML/login.html", "_self");
}

function openAdminPage() {
    window.open("../HTML/admin.html", "_self");
}

function openChatbot() {
    window.location.href = "../chatbot.html";
}

function closePage() {
    window.history.back();
}

//admin page
const BASE_URL = "";

// Auto-check login on page load
//window.onload = function () {
 //   if (localStorage.getItem("admin") === "true") {
   //     showDashboard();
   // } else {
    //    showLogin();
   // }
//};

window.onload = function () {
    let login = document.getElementById("loginSection");
    let dashboard = document.getElementById("dashboardSection");

    if (login && dashboard) {
        if (localStorage.getItem("admin") === "true") {
            showDashboard();
        } else {
            showLogin();
        }
    }
};

// Show Login
function showLoginadmin() {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("dashboardSection").style.display = "none";
}

// Show Dashboard
function showDashboard() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";
}



// LOGOUT
function logout() {
    localStorage.removeItem("admin");
    alert("Logout sucessful");
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("dashboardSection").style.display = "none";
}

const weatherAPIKey = "";
//const cityName = document.getElementById("market").value;


// Add Market data
async function addMarket() {
    try {
        let crop = document.getElementById("crop").value;
        let market = document.getElementById("market").value;
        let date = document.getElementById("date").value;
        let price = document.getElementById("price").value;
        const locResp = await fetch(
            ``
        );
        const locData = await locResp.json();
        let altitude = locData.coord.lat;
        let longitude = locData.coord.lon;

        let res = await fetch(BASE_URL + "/add-market", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crop, market, date, price, altitude, longitude })
        });

        let data = await res.json();
        alert(data.message);

        // Clear inputs
        document.getElementById("crop").value = "";
        document.getElementById("market").value = "";
        document.getElementById("date").value = "";
        document.getElementById("price").value = "";
        document.getElementById("altitude").value = "";
        document.getElementById("longitude").value = "";
    }

    catch (error) {
        console.error("Error fetching weather data:", error);
    }

}

function showSignup() {
    document.querySelector(".login-container").style.display = "none";
    document.querySelector(".signup-container").style.display = "flex";
}

function showLogin() {
    document.querySelector(".signup-container").style.display = "none";
    document.querySelector(".login-container").style.display = "flex";
}

async function signupUser() {

    let username = document.getElementById("signup-username").value;
    let mobile = document.getElementById("signup-mobile").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;
    let terms = document.getElementById("checkbox-signup").checked;

    if (!username || !mobile || !email || !password) {
        alert("Fill all fields");
        return;
    }

    if (!terms) {
        alert("Accept Terms & Conditions");
        return;
    }

    let res = await fetch(BASE_URL + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, mobile, email, password, terms })
    });

    let data = await res.json();

    if (data.status === "success") {
        alert("Signup successful ✅");
        showLogin();
    } else {
        alert("User already exists ❌");
    }
}


async function loginUser() {

    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;
    let terms = document.getElementById("checkbox-login").checked;

    if (!username || !password) {
        alert("Enter username & password");
        return;
    }

    if (!terms) {
        alert("Accept Terms & Conditions");
        return;
    }

    let res = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    let data = await res.json();

    if (data.status === "success") {
        localStorage.setItem("user", username);
        alert("Login successful ✅");
        window.location.href = "../index.html";
    } else {
        alert("Invalid credentials ❌");
    }
    window.open("../HTML/index.html", "_self");
}

async function adminLogin() {

    let username = document.getElementById("admin-username").value;
    let password = document.getElementById("admin-password").value;

    let res = await fetch(BASE_URL + "/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    let data = await res.json();

    if (data.status === "success") {
        localStorage.setItem("admin", "true");
        alert("Admin login success ✅");
        window.location.href = "admin.html";
    } else {
        alert("Wrong admin credentials ❌");
    }
}

async function loadMarkets() {

    let location = document.getElementById("location").value;
    let crop = document.getElementById("crop").value;

    if (!location || crop === "--Select--") {
        alert("Enter location & select crop");
        return;
    }

    let res = await fetch("BASE_URL/nearby-markets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ location, crop })
    });

    let data = await res.json();

    let table = document.getElementById("table");
    table.innerHTML = "";

    if (data.error) {
        table.innerHTML = `<tr><td colspan="4">${data.error}</td></tr>`;
        return;
    }

    // ✅ LOOP THROUGH MARKETS
// 🔥 Sort by highest price
data.markets.sort((a, b) => b.price - a.price);

data.markets.forEach((m, index) => {

    // ⭐ Highlight best market
    if (index === 0) {
        table.innerHTML += `
            <tr style="background: #d4edda; font-weight: bold;">
                <td>${index + 1}</td>
                <td>${m.market} ⭐</td>
                <td>${m.distance} km</td>
                <td>₹${m.price}/kg</td>
            </tr>
        `;
    } else {
        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${m.market}</td>
                <td>${m.distance} km</td>
                <td>₹${m.price}/kg</td>
            </tr>
        `;
    }
});
}
let chart;

async function loadGraph(crop, market) {

    const loader = document.getElementById("loader");
    loader.style.display = "block";   // ✅ show loader

    try {
        let res = await fetch("BASE_URL/price-history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                crop: crop,
                market: market,
                days: selectedDays
            })
        });

        let data = await res.json();

        if (data.error) {
            alert(data.error);
            loader.style.display = "none";
            return;
        }

        if (chart) chart.destroy();

        let ctx = document.getElementById("priceChart").getContext("2d");

        // 🔥 split actual + predicted
        let actualPrices = data.prices.slice(0, -1);
        let futurePrice = data.prices.slice(-1);

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.dates,
                datasets: [
                    {
                        label: `${crop} Price`,
                        data: actualPrices,
                        borderWidth: 2,
                        tension: 0.4, // ✅ smooth curve
                        fill: true,   // ✅ area fill

                        // 🎨 gradient fill
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;

                            if (!chartArea) return null;

                            let gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, "rgba(40,167,69,0.4)");
                            gradient.addColorStop(1, "rgba(40,167,69,0.05)");
                            return gradient;
                        }
                    },
                    {
                        label: "🤖 Prediction",
                        data: [...Array(actualPrices.length).fill(null), futurePrice[0]],
                        borderDash: [6, 6],
                        borderWidth: 2,
                        pointRadius: 5,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1200,   // ✅ smooth animation
                    easing: "easeOutQuart"
                },
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

    } catch (err) {
        console.error(err);
        alert("Graph loading failed ❌");
    }

    loader.style.display = "none";   // ✅ hide loader
}

function changeDays(days) {
    selectedDays = days;

    const crop = document.getElementById("crop").value;
    const market = document.getElementById("market")?.value || document.getElementById("location").value;

    loadGraph(crop, market);
}

function loadGraphFromInput() {

    const crop = document.getElementById("graphCrop").value;
    const market = document.getElementById("graphMarket").value;

    if (!crop || crop === "Select Crop" || !market || market === "Select Market") {
        alert("Select crop and market");
        return;
    }

    loadGraph(crop, market);
}
