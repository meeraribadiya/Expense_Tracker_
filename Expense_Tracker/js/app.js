let allData = getData();

// Formatter: show 2 decimal places and commas
function formatCurrency(value) {
    const n = Number(value);
    if (isNaN(n)) return "0.00";
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Dashboard show
function loadDashboard() {
    const tableBody = document.getElementById("transactionList");
    if (!tableBody) return;

    // Calculate overall totals (not affected by filter)
    let totalIncome = 0;
    let totalExpense = 0;

    // We should calculate totals based on ALL data, not just filtered view
    allData.forEach((t) => {
        const amt = Number(t.amount);
        if (t.type === "income") totalIncome += amt;
        else totalExpense += amt;
    });

    // Determine filter selection if present
    const filterSelect = document.getElementById("filterCategory");
    const selectedCat = filterSelect ? filterSelect.value : "all";

    // Filter data for table view
    const viewData = selectedCat === "all"
        ? allData
        : allData.filter((t) => t.category === selectedCat);

    tableBody.innerHTML = "";

    // Reverse generated data so newest is on top
    // We map original index to keep delete working correctly
    const viewDataWithIndices = viewData.map((item, index) => ({ ...item, originalIndex: allData.indexOf(item) }));

    if (viewDataWithIndices.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding: 2rem;">No transactions found.</td></tr>`;
    } else {
        // Show recent first
        viewDataWithIndices.slice().reverse().forEach((t) => {
            const amountClass = t.type === 'income' ? 'income-text' : 'expense-text';
            const typeLabel = t.type.charAt(0).toUpperCase() + t.type.slice(1);

            const rowHtml = `
                <tr>
                    <td data-label="Date">${t.date}</td>
                    <td data-label="Description">${t.desc}</td>
                    <td data-label="Category">${t.category}</td>
                    <td data-label="Type"><span class="${amountClass}">${typeLabel}</span></td>
                    <td data-label="Amount" class="${amountClass}">₹${formatCurrency(t.amount)}</td>
                    <td data-label="Action">
                        <button class="delete-btn" onclick="deleteData(${t.originalIndex})" title="Delete Transaction">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += rowHtml;
        });
    }

    const incEl = document.getElementById("totalIncome");
    const expEl = document.getElementById("totalExpense");
    const balEl = document.getElementById("balance");

    if (incEl) incEl.innerText = "₹" + formatCurrency(totalIncome);
    if (expEl) expEl.innerText = "₹" + formatCurrency(totalExpense);
    if (balEl) {
        const balance = totalIncome - totalExpense;
        balEl.innerText = "₹" + formatCurrency(balance);
        // Remove old classes
        balEl.parentElement.classList.remove('income', 'expense');
        // Optional: Color the balance card text or indicator based on positive/negative
        if (balance >= 0) {
            balEl.style.color = "var(--success-color)";
        } else {
            balEl.style.color = "var(--danger-color)";
        }
    }

    // Attach filter listener once
    if (filterSelect && !filterSelect._bound) {
        filterSelect.addEventListener("change", loadDashboard);
        filterSelect._bound = true;
    }
}

function deleteData(i) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        allData.splice(i, 1);
        saveData(allData);
        loadDashboard();
    }
}

// Add Page Logic
const addForm = document.getElementById("addForm");
const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {
    saveBtn.addEventListener("click", function () {
        // Collect data
        const dateVal = document.getElementById("date").value;
        const descVal = document.getElementById("desc").value;
        const catVal = document.getElementById("category").value;
        const amountVal = document.getElementById("amount").value;
        const typeVal = document.getElementById("type").value;

        // Basic validation
        const errorEl = document.getElementById("errorMsg");
        const amountNum = parseFloat(amountVal);

        if (!dateVal || !descVal.trim() || !amountVal) {
            if (errorEl) errorEl.innerText = "Please fill in all required fields.";
            return;
        }

        if (isNaN(amountNum) || amountNum <= 0) {
            if (errorEl) errorEl.innerText = "Please enter a valid positive amount.";
            return;
        }

        const obj = {
            date: dateVal,
            desc: descVal,
            category: catVal,
            amount: amountNum,
            type: typeVal
        };

        if (errorEl) errorEl.innerText = "";

        allData.push(obj);
        saveData(allData);

        // Show success feedback (could be a toast, but alert is fine for now)
        // alert("Transaction Saved!"); 
        window.location.href = "index.html";
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
