const token =
    localStorage.getItem("token");

const user =
    JSON.parse(localStorage.getItem("user"));


if (!token || !user) {

    window.location.href =
        "/pages/login.html";

}


// =====================================================
// USER INFORMATION
// =====================================================

document.getElementById("userName")
    .textContent = user.full_name;

document.getElementById("welcomeMessage")
    .textContent =
    `Welcome, ${user.full_name} (${user.role})`;


// =====================================================
// ELEMENTS
// =====================================================

const medicineForm =
    document.getElementById("medicineForm");

const medicineTable =
    document.getElementById("medicineTable");

const searchInput =
    document.getElementById("searchInput");

const cancelBtn =
    document.getElementById("cancelBtn");


// =====================================================
// LOAD MEDICINES
// =====================================================

async function loadMedicines() {

    try {

        const response =
            await fetch(
                "/api/medicines",
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


        displayMedicines(data);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load medicines."
        );

    }

}


// =====================================================
// DISPLAY MEDICINES
// =====================================================

function displayMedicines(medicines) {

    medicineTable.innerHTML = "";


    if (medicines.length === 0) {

        medicineTable.innerHTML = `
            <tr>
                <td colspan="9">
                    No medicines found.
                </td>
            </tr>
        `;

        return;
    }


    medicines.forEach(medicine => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                MD${String(medicine.medicine_id).padStart(3, "0")}
            </td>

            <td>
                ${medicine.medicine_name}
            </td>

            <td>
                ${medicine.category_name || "-"}
            </td>

            <td>
                ${medicine.supplier_name || "-"}
            </td>

            <td>
                ${medicine.batch_number || "-"}
            </td>

            <td>
                ${Number(
                    medicine.selling_price
                ).toFixed(2)}
            </td>

            <td>
                ${medicine.quantity}
            </td>

            <td>
                ${medicine.expiry_date || "-"}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editMedicine(
                        ${medicine.medicine_id}
                    )"
                >
                    Edit
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteMedicine(
                        ${medicine.medicine_id}
                    )"
                >
                    Delete
                </button>

            </td>

        `;


        medicineTable.appendChild(row);

    });

}


// =====================================================
// ADD / UPDATE MEDICINE
// =====================================================

medicineForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const medicineId =
            document.getElementById(
                "medicineId"
            ).value;


        const medicineData = {

            medicine_name:
                document.getElementById(
                    "medicineName"
                ).value.trim(),

            category_id:
                document.getElementById(
                    "categoryId"
                ).value || null,

            supplier_id:
                document.getElementById(
                    "supplierId"
                ).value || null,

            batch_number:
                document.getElementById(
                    "batchNumber"
                ).value.trim(),

            purchase_price:
                document.getElementById(
                    "purchasePrice"
                ).value || 0,

            selling_price:
                document.getElementById(
                    "sellingPrice"
                ).value,

            quantity:
                document.getElementById(
                    "quantity"
                ).value || 0,

            reorder_level:
                document.getElementById(
                    "reorderLevel"
                ).value || 10,

            expiry_date:
                document.getElementById(
                    "expiryDate"
                ).value || null

        };


        try {

            let url =
                "/api/medicines";

            let method = "POST";


            if (medicineId) {

                url =
                    `/api/medicines/${medicineId}`;

                method = "PUT";

            }


            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                medicineData
                            )
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

            loadMedicines();

        } catch (error) {

            console.error(error);

            alert(
                "Unable to save medicine."
            );

        }

    }
);


// =====================================================
// EDIT MEDICINE
// =====================================================

async function editMedicine(id) {

    try {

        const response =
            await fetch(
                `/api/medicines/${id}`,
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
            "medicineName"
        ).value =
            medicine.medicine_name;


        document.getElementById(
            "categoryId"
        ).value =
            medicine.category_id || "";


        document.getElementById(
            "supplierId"
        ).value =
            medicine.supplier_id || "";


        document.getElementById(
            "batchNumber"
        ).value =
            medicine.batch_number || "";


        document.getElementById(
            "purchasePrice"
        ).value =
            medicine.purchase_price;


        document.getElementById(
            "sellingPrice"
        ).value =
            medicine.selling_price;


        document.getElementById(
            "quantity"
        ).value =
            medicine.quantity;


        document.getElementById(
            "reorderLevel"
        ).value =
            medicine.reorder_level;


        document.getElementById(
            "expiryDate"
        ).value =
            medicine.expiry_date || "";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Update Medicine";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load medicine."
        );

    }

}


// =====================================================
// DELETE MEDICINE
// =====================================================

async function deleteMedicine(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this medicine?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/medicines/${id}`,
                {
                    method: "DELETE",

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


        alert(data.message);

        loadMedicines();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete medicine."
        );

    }

}


// =====================================================
// SEARCH
// =====================================================

searchInput.addEventListener(
    "input",
    async function() {

        const search =
            this.value.trim();


        if (search === "") {

            loadMedicines();

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/medicines/search?q=${encodeURIComponent(search)}`,
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


            displayMedicines(data);

        } catch (error) {

            console.error(error);

        }

    }
);


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    medicineForm.reset();


    document.getElementById(
        "medicineId"
    ).value = "";


    document.getElementById(
        "reorderLevel"
    ).value = 10;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add New Medicine";

}


// =====================================================
// CANCEL
// =====================================================

cancelBtn.addEventListener(
    "click",
    resetForm
);


// =====================================================
// LOGOUT
// =====================================================

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    function() {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "/pages/login.html";

    }
);


// =====================================================
// START
// =====================================================

loadMedicines();