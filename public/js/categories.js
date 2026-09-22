const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user")
);


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

const categoryForm =
    document.getElementById("categoryForm");

const categoryTable =
    document.getElementById("categoryTable");

const searchInput =
    document.getElementById("searchInput");

const cancelBtn =
    document.getElementById("cancelBtn");


// =====================================================
// LOAD CATEGORIES
// =====================================================

async function loadCategories() {

    try {

        const response =
            await fetch(
                "/api/categories",
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

        displayCategories(data);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load categories."
        );
    }
}


// =====================================================
// DISPLAY CATEGORIES
// =====================================================

function displayCategories(categories) {

    categoryTable.innerHTML = "";

    if (categories.length === 0) {

        categoryTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No categories found.
                </td>
            </tr>
        `;

        return;
    }


    categories.forEach(category => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                CAT${String(category.category_id).padStart(3, "0")}
            </td>



            <td>
                ${category.category_name}
            </td>

            <td>
                ${category.description || "-"}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editCategory(
                        ${category.category_id}
                    )"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteCategory(
                        ${category.category_id}
                    )"
                >
                    Delete
                </button>

            </td>
        `;


        categoryTable.appendChild(row);

    });
}


// =====================================================
// ADD / UPDATE
// =====================================================

categoryForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const categoryId =
            document.getElementById(
                "categoryId"
            ).value;


        const categoryData = {

            category_name:
                document.getElementById(
                    "categoryName"
                ).value.trim(),

            description:
                document.getElementById(
                    "description"
                ).value.trim()

        };


        try {

            let url =
                "/api/categories";

            let method = "POST";


            if (categoryId) {

                url =
                    `/api/categories/${categoryId}`;

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
                                categoryData
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

            loadCategories();


        } catch (error) {

            console.error(error);

            alert(
                "Unable to save category."
            );
        }

    }
);


// =====================================================
// EDIT
// =====================================================

async function editCategory(id) {

    try {

        const response =
            await fetch(
                `/api/categories/${id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const category =
            await response.json();


        if (!response.ok) {

            alert(category.message);

            return;
        }


        document.getElementById(
            "categoryId"
        ).value =
            category.category_id;


        document.getElementById(
            "categoryName"
        ).value =
            category.category_name;


        document.getElementById(
            "description"
        ).value =
            category.description || "";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Update Category";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load category."
        );
    }
}


// =====================================================
// DELETE
// =====================================================

async function deleteCategory(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this category?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/categories/${id}`,
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

        loadCategories();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete category."
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

            loadCategories();

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/categories/search?q=${encodeURIComponent(search)}`,
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


            displayCategories(data);


        } catch (error) {

            console.error(error);
        }

    }
);


// =====================================================
// RESET
// =====================================================

function resetForm() {

    categoryForm.reset();


    document.getElementById(
        "categoryId"
    ).value = "";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add New Category";
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

loadCategories();