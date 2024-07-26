document.getElementById("suggestionsBtn").addEventListener("click", function() {
    let ingredientElements = document.querySelectorAll("#ingredient-list li");
    let ingredients = Array.from(ingredientElements).map(li => li.textContent.trim());
    console.log('Ingredients:', ingredients);

    // Send POST request to server with ingredients data
    fetch('/getsuggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredients: ingredients })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Suggestions received:', data);
        // Update the suggestions paragraph with the received data
        let suggestionsElement = document.getElementById("suggestions");
        suggestionsElement.textContent = data.suggestions.join('\n\n'); // Join suggestions with double newline
    })
    .catch(error => {
        console.error('Error fetching suggestions:', error);
        alert('Error fetching suggestions. Please try again.');
    });
});

function newIngredient() {
    let inputValue = document.getElementById("ingredient").value.trim();
    if (inputValue === '') {
        alert("You must write something!");
        return;
    }

    let ul = document.getElementById("ingredient-list");

    // Create new list item
    let li = document.createElement("li");
    li.textContent = inputValue;

    // Create close button
    let closeButton = document.createElement("button");
    closeButton.className = "closeBtn";
    closeButton.textContent = "X";
    closeButton.onclick = function() {
        ul.removeChild(li); // Remove the list item
    };

    li.appendChild(closeButton); // Append close button to list item
    ul.appendChild(li); // Append list item to the unordered list

    document.getElementById("ingredient").value = ""; // Clear input field
}