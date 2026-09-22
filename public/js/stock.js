const token =
    localStorage.getItem("token");

const user =
    JSON.parse(localStorage.getItem("user"));


if (!token || !user) {

    window.location.href =
        "/pages/login.html";
}


document.getElementById("userName")
    .textContent = user.full_name;

document.getElementById("welcomeMessage")
    .textContent =
    `Welcome, ${user.full_name} (${user.role})`;


const stockTable =
    document.getElementById("stockTable");

const searchInput =
    document.getElementById("searchInput");

const stockFilter =
    document.getElementById("stockFilter");

const stockForm =
    document.getElementById("stockForm");

const cancelBtn =
    document.getElementById("cancelBtn");


let stockData = [];


// =====================================================
// LOAD STOCK
// =====================================================

async function loadStock() {

    try {

        const response =
            await fetch(
                "/api/stock",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        stockData = data;

        updateSummary();

        displayStock(
            getFilteredStock()
        );


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load stock."
        );
    }
}


// =====================================================
// SUMMARY
// =====================================================

function updateSummary() {

    const totalMedicines =
        stockData.length;


    const totalStock =
        stockData.reduce(
            (total, medicine) =>
                total +
                Number(medicine.quantity),
            0
        );


    const lowStock =
        stockData.filter(
            medicine =>
                medicine.stock_status ===
                "Low Stock"
        ).length;


    const normalStock =
        totalMedicines -
        lowStock;


    document.getElementById(
        "totalMedicines"
    ).textContent =
        totalMedicines;


    document.getElementById(
        "totalStock"
    ).textContent =
        totalStock;


    document.getElementById(
        "lowStock"
    ).textContent =
        lowStock;


    document.getElementById(
        "normalStock"
    ).textContent =
        normalStock;
}


// =====================================================
// FILTER STOCK
// =====================================================

function getFilteredStock() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filter =
        stockFilter.value;


    return stockData.filter(
        medicine => {

            const matchesSearch =
                medicine.medicine_name
                    .toLowerCase()
                    .includes(search);


            const matchesFilter =
                filter === "all"

                ||

                (
                    filter === "low" &&
                    medicine.stock_status ===
                    "Low Stock"
                )

                ||

                (
                    filter === "normal" &&
                    medicine.stock_status ===
                    "Normal"
                );


            return (
                matchesSearch &&
                matchesFilter
            );
        }
    );
}


// =====================================================
// DISPLAY STOCK
// =====================================================

function displayStock(data) {

    stockTable.innerHTML = "";


    if (data.length === 0) {

        stockTable.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#64748b;
                    "
                >
                    No stock records found.
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(medicine => {

        const row =
            document.createElement("tr");


        const statusClass =
            medicine.stock_status ===
            "Low Stock"
                ? "low-status"
                : "normal-status";


        row.innerHTML = `

            <td>
                ${medicine.medicine_id}
            </td>

            <td>
                ${medicine.medicine_name}
            </td>

            <td>
                ${medicine.category_name || "-"}
            </td>

            <td>
                ${medicine.batch_number || "-"}
            </td>

            <td>
                ${medicine.quantity}
            </td>

            <td>
                ${medicine.reorder_level}
            </td>

            <td>
                ${medicine.expiry_date || "-"}
            </td>

            <td>
                <span class="${statusClass}">
                    ${medicine.stock_status}
                </span>
            </td>

            <td>

                ${
                    user.role === "admin" ||
                    user.role === "pharmacist"
                    ? `
                        <button
                            class="update-btn"
                            onclick="selectStock(
                                ${medicine.medicine_id}
                            )"
                        >
                            Update
                        </button>
                    `
                    : "-"
                }

            </td>
        `;


        stockTable.appendChild(row);
    });
}


// =====================================================
// SELECT STOCK FOR UPDATE
// =====================================================

async function selectStock(id) {

    try {

        const response =
            await fetch(
                `/api/stock/${id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const medicine =
            await response.json();


        if (!response.ok) {

            alert(medicine.message);

            return;
        }


        document.getElementById(
            "medicineId"
        ).value =
            medicine.medicine_id;


        document.getElementById(
            "quantity"
        ).value =
            medicine.quantity;


        document.getElementById(
            "reorderLevel"
        ).value =
            medicine.reorder_level;


        document.getElementById(
            "selectedMedicine"
        ).textContent =
            `Updating stock for: ${medicine.medicine_name}`;


        document.getElementById(
            "stockUpdateSection"
        ).scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load stock details."
        );
    }
}


// =====================================================
// UPDATE STOCK
// =====================================================

stockForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const medicineId =
            document.getElementById(
                "medicineId"
            ).value;


        if (!medicineId) {

            alert(
                "Please select a medicine first."
            );

            return;
        }


        const quantity =
            Number(
                document.getElementById(
                    "quantity"
                ).value
            );


        const reorderLevel =
            Number(
                document.getElementById(
                    "reorderLevel"
                ).value
            );


        if (
            quantity < 0 ||
            reorderLevel < 0
        ) {

            alert(
                "Quantity and reorder level cannot be negative."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/stock/${medicineId}`,
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({
                                quantity:
                                    quantity,

                                reorder_level:
                                    reorderLevel
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(data.message);

                return;
            }


            alert(data.message);


            resetForm();

            loadStock();


        } catch (error) {

            console.error(error);

            alert(
                "Unable to update stock."
            );
        }
    }
);


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    stockForm.reset();


    document.getElementById(
        "medicineId"
    ).value = "";


    document.getElementById(
        "selectedMedicine"
    ).textContent =
        "Select a medicine to update stock.";
}


cancelBtn.addEventListener(
    "click",
    resetForm
);


// =====================================================
// SEARCH
// =====================================================

searchInput.addEventListener(
    "input",
    function() {

        displayStock(
            getFilteredStock()
        );
    }
);


// =====================================================
// FILTER
// =====================================================

stockFilter.addEventListener(
    "change",
    function() {

        displayStock(
            getFilteredStock()
        );
    }
);


// =====================================================
// LOGOUT
// =====================================================

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    function() {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "/pages/login.html";
    }
);


// =====================================================
// START
// =====================================================

if (
    user.role === "staff"
) {

    document.getElementById(
        "stockUpdateSection"
    ).style.display = "none";
}


loadStock();