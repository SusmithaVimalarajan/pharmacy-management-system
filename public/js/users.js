const token =
    localStorage.getItem("token");

const user =
    JSON.parse(localStorage.getItem("user"));


if (!token || !user) {

    window.location.href =
        "/pages/login.html";
}


// Only Admin can access User Management

if (user.role !== "admin") {

    alert(
        "Access denied. Only Admin can manage users."
    );

    window.location.href =
        "/pages/dashboard.html";
}


document.getElementById("userName")
    .textContent = user.full_name;

document.getElementById("welcomeMessage")
    .textContent =
    `Welcome, ${user.full_name} (${user.role})`;


const userForm =
    document.getElementById("userForm");

const userTable =
    document.getElementById("userTable");

const searchInput =
    document.getElementById("searchInput");

const cancelBtn =
    document.getElementById("cancelBtn");


// =====================================================
// LOAD USERS
// =====================================================

async function loadUsers() {

    try {

        const response =
            await fetch(
                "/api/users",
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

        displayUsers(data);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load users."
        );
    }
}


// =====================================================
// DISPLAY USERS
// =====================================================

function displayUsers(users) {

    userTable.innerHTML = "";

    if (users.length === 0) {

        userTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }


    users.forEach(currentUser => {

        const row =
            document.createElement("tr");


        const statusClass =
            currentUser.status === "active"
                ? "active-status"
                : "inactive-status";


        row.innerHTML = `

            <td>
                USER${String(currentUser.user_id).padStart(3, "0")}
            </td>


            <td>
                ${currentUser.full_name}
            </td>

            <td>
                ${currentUser.username}
            </td>

            <td>
                ${currentUser.email || "-"}
            </td>

            <td>
                ${currentUser.role}
            </td>

            <td class="${statusClass}">
                ${currentUser.status}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editUser(
                        ${currentUser.user_id}
                    )"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteUser(
                        ${currentUser.user_id}
                    )"
                >
                    Delete
                </button>

            </td>
        `;

        userTable.appendChild(row);
    });
}


// =====================================================
// ADD / UPDATE USER
// =====================================================

userForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const userId =
            document.getElementById(
                "userId"
            ).value;


        const userData = {

            full_name:
                document.getElementById(
                    "fullName"
                ).value.trim(),

            username:
                document.getElementById(
                    "username"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            password:
                document.getElementById(
                    "password"
                ).value,

            role:
                document.getElementById(
                    "role"
                ).value,

            status:
                document.getElementById(
                    "status"
                ).value
        };


        if (!userId && !userData.password) {

            alert(
                "Password is required for a new user."
            );

            return;
        }


        try {

            let url =
                "/api/users";

            let method = "POST";


            if (userId) {

                url =
                    `/api/users/${userId}`;

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
                                userData
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

            loadUsers();

        } catch (error) {

            console.error(error);

            alert(
                "Unable to save user."
            );
        }

    }
);


// =====================================================
// EDIT USER
// =====================================================

async function editUser(id) {

    try {

        const response =
            await fetch(
                `/api/users/${id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const currentUser =
            await response.json();


        if (!response.ok) {

            alert(
                currentUser.message
            );

            return;
        }


        document.getElementById(
            "userId"
        ).value =
            currentUser.user_id;


        document.getElementById(
            "fullName"
        ).value =
            currentUser.full_name;


        document.getElementById(
            "username"
        ).value =
            currentUser.username;


        document.getElementById(
            "email"
        ).value =
            currentUser.email || "";


        document.getElementById(
            "password"
        ).value = "";


        document.getElementById(
            "role"
        ).value =
            currentUser.role;


        document.getElementById(
            "status"
        ).value =
            currentUser.status;


        document.getElementById(
            "formTitle"
        ).textContent =
            "Update User";


        document.getElementById(
            "passwordHint"
        ).textContent =
            "Leave blank to keep the current password.";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load user."
        );
    }
}


// =====================================================
// DELETE USER
// =====================================================

async function deleteUser(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this user?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/users/${id}`,
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

        loadUsers();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete user."
        );
    }
}


// =====================================================
// SEARCH USERS
// =====================================================

searchInput.addEventListener(
    "input",
    async function() {

        const search =
            this.value.trim();


        if (search === "") {

            loadUsers();

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/users/search?q=${encodeURIComponent(search)}`,
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


            displayUsers(data);


        } catch (error) {

            console.error(error);
        }
    }
);


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    userForm.reset();


    document.getElementById(
        "userId"
    ).value = "";


    document.getElementById(
        "status"
    ).value = "active";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add New User";


    document.getElementById(
        "passwordHint"
    ).textContent =
        "Required for new users.";
}


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

loadUsers();