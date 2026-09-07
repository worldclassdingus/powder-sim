console.log("main.js is running");

const button = document.getElementById("testButton");
const jsStatus = document.getElementById("status");

function handleClick() {
    jsStatus.textContent = "JavaScript changed the DOM";
}

button.addEventListener(
    "click",
    handleClick
);