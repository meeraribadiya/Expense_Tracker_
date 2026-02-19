function getData() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
}

function saveData(arr) {
    localStorage.setItem("transactions", JSON.stringify(arr));
}
