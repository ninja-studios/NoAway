document.getElementById("generate").onclick = async () => {
    const leftovers = document.getElementById("leftovers").value;
    const resultBox = document.getElementById("result");

    resultBox.innerHTML = "Generating recipe...";

    const response = await fetch(
        "https://api-inference.huggingface.co/models/google/flan-t5-base",
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer YOUR_API_KEY",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: `Create a recipe using these leftovers: ${leftovers}`
            })
        }
    );

    const data = await response.json();
    const text = data[0]?.generated_text || "No recipe found.";

    resultBox.innerHTML = `<p class="neutral">${text}</p>`;
};

