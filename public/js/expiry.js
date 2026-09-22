
const token =
    localStorage.getItem("token");


const user =
    JSON.parse(localStorage.getItem("user"));



/* =========================
   AUTHENTICATION CHECK
========================= */

if (!token || !user) {

    window.location.href =
        "/pages/login.html";

}



/* =========================
   USER INFORMATION
========================= */

document.getElementById(
    "userName"
).textContent =
    user.full_name;


document.getElementById(
    "welcomeMessage"
).textContent =
    `Welcome, ${user.full_name} (${user.role})`;



/* =========================
   VARIABLES
========================= */

let expiryMedicines = [];



/* =========================
   LOAD SUMMARY
========================= */

async function loadSummary() {

    try {

        const response =
            await fetch(
                "/api/expiry/summary",
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


        document.getElementById(
            "totalWithExpiry"
        ).textContent =
            data.totalWithExpiry;


        document.getElementById(
            "expired"
        ).textContent =
            data.expired;


        document.getElementById(
            "expiringSoon"
        ).textContent =
            data.expiringSoon;


        document.getElementById(
            "valid"
        ).textContent =
            data.valid;


    } catch (error) {

        console.error(
            "Summary error:",
            error
        );

    }

}



/* =========================
   LOAD EXPIRY MEDICINES
========================= */

async function loadExpiryMedicines() {

    try {

        const response =
            await fetch(
                "/api/expiry",
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


        expiryMedicines = data;


        displayMedicines();


    } catch (error) {

        console.error(
            "Expiry loading error:",
            error
        );

    }

}



/* =========================
   DISPLAY MEDICINES
========================= */

function displayMedicines() {

    const table =
        document.getElementById(
            "expiryTable"
        );


    table.innerHTML = "";



    const searchValue =
        document.getElementById(
            "searchInput"
        ).value
        .toLowerCase()
        .trim();


    const statusValue =
        document.getElementById(
            "statusFilter"
        ).value;



    const filteredMedicines =
        expiryMedicines.filter(
            medicine => {


                const medicineName =
                    (
                        medicine.medicine_name
                        || ""
                    )
                    .toLowerCase();


                const batchNumber =
                    (
                        medicine.batch_number
                        || ""
                    )
                    .toLowerCase();


                const matchesSearch =
                    medicineName.includes(
                        searchValue
                    ) ||
                    batchNumber.includes(
                        searchValue
                    );


                const matchesStatus =
                    statusValue === "all" ||
                    medicine.status ===
                        statusValue;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );



    if (
        filteredMedicines.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-message"
                >

                    No expiry records found.

                </td>

            </tr>

        `;

        return;

    }



    filteredMedicines.forEach(
        medicine => {

            const row =
                document.createElement(
                    "tr"
                );


            let statusClass =
                "status-no-expiry";


            if (
                medicine.status ===
                "Expired"
            ) {

                statusClass =
                    "status-expired";

            }


            else if (
                medicine.status ===
                "Expiring Soon"
            ) {

                statusClass =
                    "status-expiring";

            }


            else if (
                medicine.status ===
                "Valid"
            ) {

                statusClass =
                    "status-valid";

            }



            let daysRemaining =
                "-";


            if (
                medicine.days_remaining !==
                null
            ) {

                daysRemaining =
                    medicine.days_remaining;

            }



            let expiryDate =
                "-";


            if (
                medicine.expiry_date
            ) {

                const date =
                    new Date(
                        medicine.expiry_date
                    );


                expiryDate =
                    date.toLocaleDateString(
                        "en-GB"
                    );

            }



            row.innerHTML = `

                <td>
                    ${medicine.medicine_id}
                </td>

                <td>
                    ${medicine.medicine_name}
                </td>

                <td>
                    ${medicine.batch_number || "-"}
                </td>

                <td>
                    ${expiryDate}
                </td>

                <td>
                    ${medicine.quantity}
                </td>

                <td>

                    <span
                        class="status ${statusClass}"
                    >

                        ${medicine.status}

                    </span>

                </td>

                <td>
                    ${daysRemaining}
                </td>

            `;


            table.appendChild(row);

        }
    );

}



/* =========================
   SEARCH
========================= */

document.getElementById(
    "searchInput"
).addEventListener(
    "input",
    displayMedicines
);



/* =========================
   STATUS FILTER
========================= */

document.getElementById(
    "statusFilter"
).addEventListener(
    "change",
    displayMedicines
);



/* =========================
   LOGOUT
========================= */

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



/* =========================
   LOAD DATA
========================= */

loadSummary();

loadExpiryMedicines();
