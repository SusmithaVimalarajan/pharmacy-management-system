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

const supplierForm =
    document.getElementById("supplierForm");

const supplierTable =
    document.getElementById("supplierTable");

const searchInput =
    document.getElementById("searchInput");

const cancelBtn =
    document.getElementById("cancelBtn");


// =====================================================
// LOAD SUPPLIERS
// =====================================================

async function loadSuppliers() {

    try {

        const response =
            await fetch(
                "/api/suppliers",
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


        displaySuppliers(data);


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load suppliers."
        );
    }
}


// =====================================================
// DISPLAY SUPPLIERS
// =====================================================

function displaySuppliers(suppliers) {

    supplierTable.innerHTML = "";


    if (suppliers.length === 0) {

        supplierTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No suppliers found.
                </td>
            </tr>
        `;

        return;
    }


    suppliers.forEach(supplier => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                SUP${String(supplier.supplier_id).padStart(3, "0")}
            </td>

            <td>
                ${supplier.supplier_name}
            </td>

            <td>
                ${supplier.company_name || "-"}
            </td>

            <td>
                ${supplier.phone || "-"}
            </td>

            <td>
                ${supplier.email || "-"}
            </td>

            <td>
                ${supplier.address || "-"}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editSupplier(
                        ${supplier.supplier_id}
                    )"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteSupplier(
                        ${supplier.supplier_id}
                    )"
                >
                    Delete
                </button>

            </td>
        `;


        supplierTable.appendChild(row);

    });
}


// =====================================================
// ADD / UPDATE SUPPLIER
// =====================================================

supplierForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const supplierId =
            document.getElementById(
                "supplierId"
            ).value;


        const supplierData = {

            supplier_name:
                document.getElementById(
                    "supplierName"
                ).value.trim(),

            company_name:
                document.getElementById(
                    "companyName"
                ).value.trim(),

            phone:
                document.getElementById(
                    "phone"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            address:
                document.getElementById(
                    "address"
                ).value.trim()

        };


        try {

            let url =
                "/api/suppliers";

            let method = "POST";


            if (supplierId) {

                url =
                    `/api/suppliers/${supplierId}`;

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
                                supplierData
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

            loadSuppliers();


        } catch (error) {

            console.error(error);

            alert(
                "Unable to save supplier."
            );
        }

    }
);


// =====================================================
// EDIT SUPPLIER
// =====================================================

async function editSupplier(id) {

    try {

        const response =
            await fetch(
                `/api/suppliers/${id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const supplier =
            await response.json();


        if (!response.ok) {

            alert(supplier.message);

            return;
        }


        document.getElementById(
            "supplierId"
        ).value =
            supplier.supplier_id;


        document.getElementById(
            "supplierName"
        ).value =
            supplier.supplier_name;


        document.getElementById(
            "companyName"
        ).value =
            supplier.company_name || "";


        document.getElementById(
            "phone"
        ).value =
            supplier.phone || "";


        document.getElementById(
            "email"
        ).value =
            supplier.email || "";


        document.getElementById(
            "address"
        ).value =
            supplier.address || "";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Update Supplier";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load supplier."
        );
    }
}


// =====================================================
// DELETE SUPPLIER
// =====================================================

async function deleteSupplier(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this supplier?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/suppliers/${id}`,
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

        loadSuppliers();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete supplier."
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

            loadSuppliers();

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/suppliers/search?q=${encodeURIComponent(search)}`,
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


            displaySuppliers(data);


        } catch (error) {

            console.error(error);
        }

    }
);


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    supplierForm.reset();


    document.getElementById(
        "supplierId"
    ).value = "";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add New Supplier";
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

loadSuppliers();