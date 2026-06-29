// Ingredient list (short sample — I can generate 500+ for you)
const ingredients = [
    "Flour", "Milk", "Water", "Sugar", "Salt", "Butter", "Eggs", "Rice",
    "Chicken", "Beef", "Pasta", "Tomatoes", "Onions", "Garlic", "Olive Oil",
    "Carrots", "Potatoes", "Cheese", "Bread", "Spinach"
];

let selectedIngredients = [];
let currentUnit = "metric";

// SEARCH FUNCTION
document.getElementById("searchBox").addEventListener("input", () => {
    const query = document.getElementById("searchBox").value.toLowerCase();
    const results = ingredients.filter(i => i.toLowerCase().includes(query));

    const box = document.getElementById("searchResults");
    box.innerHTML = "";

    results.forEach(item => {
        const div = document.createElement("div");
        div.className = "search-item";
        div.textContent = item;
        div.onclick = () => addIngredient(item);
        box.appendChild(div);
    });
});

// ADD INGREDIENT TILE
function addIngredient(name) {
    if (selectedIngredients.includes(name)) return;

    selectedIngredients.push(name);

    const grid = document.getElementById("selectedGrid");

    const tile = document.createElement("div");
    tile.className = "ingredient-tile";

    tile.innerHTML = `
        <div class="delete-x" onclick="deleteIngredient('${name}')">×</div>
        <strong>${name}</strong>
        <input class="amount-input" id="amt-${name}" placeholder="Enter amount (e.g. 250 g)">
    `;

    grid.appendChild(tile);
}

// DELETE INGREDIENT TILE
function deleteIngredient(name) {
    selectedIngredients = selectedIngredients.filter(i => i !== name);
    document.getElementById("selectedGrid").innerHTML = "";
    selectedIngredients.forEach(addIngredient);
}

// UNIT TOGGLE
document.getElementById("metricBtn").onclick = () => {
    currentUnit = "metric";
    updateUnits();
    document.getElementById("metricBtn").classList.add("active");
    document.getElementById("imperialBtn").classList.remove("active");
};

document.getElementById("imperialBtn").onclick = () => {
    currentUnit = "imperial";
    updateUnits();
    document.getElementById("imperialBtn").classList.add("active");
    document.getElementById("metricBtn").classList.remove("active");
};

// CONVERSION LOGIC
function convert(value, from, to) {
    if (from === to) return value;

    // grams ↔ ounces
    if (from === "g" && to === "oz") return value * 0.0353;
    if (from === "oz" && to === "g") return value / 0.0353;

    // ml ↔ cups
    if (from === "ml" && to === "cups") return value / 240;
    if (from === "cups" && to === "ml") return value * 240;

    return value;
}

function updateUnits() {
    selectedIngredients.forEach(name => {
        const input = document.getElementById(`amt-${name}`);
        let val = input.value;

        if (!val.includes(" ")) return;

        let [amount, unit] = val.split(" ");

        amount = parseFloat(amount);

        if (currentUnit === "metric") {
            if (unit === "oz") input.value = convert(amount, "oz", "g").toFixed(1) + " g";
            if (unit === "cups") input.value = convert(amount, "cups", "ml").toFixed(1) + " ml";
        } else {
            if (unit === "g") input.value = convert(amount, "g", "oz").toFixed(1) + " oz";
            if (unit === "ml") input.value = convert(amount, "ml", "cups").toFixed(1) + " cups";
        }
    });
}

// ⭐ REAL CHATGPT RECIPE GENERATION THROUGH CLOUDFLARE WORKER
document.getElementById("generate").onclick = async () => {
    const resultBox = document.getElementById("result");

    const formatted = selectedIngredients.map(name => {
        const val = document.getElementById(`amt-${name}`).value || "unknown amount";
        return `${val} of ${name}`;
    }).join(", ");

    resultBox.innerHTML = "Generating recipe...";

    try {
        const response = await fetch("https://noaway.jackninja73.workers.dev", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: `Create a detailed recipe using: ${formatted}`
            })
        });

        const data = await response.json();
        const text = data.choices[0].message.content;

        resultBox.innerHTML = `<p>${text}</p>`;
    } catch (err) {
        resultBox.innerHTML = "<p style='color:red;'>Error: AI request failed.</p>";
    }
};
