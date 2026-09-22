
const token = 
    localStorage.getItem("token"); 
 
const user = 
    JSON.parse(localStorage.getItem("user")); 
 
 
if (!token || !user) { 
 
    window.location.href = 
        "/pages/login.html"; 
 
} 
 
 
document.getElementById("userName").textContent = 
    user.full_name; 
 
 
document.getElementById("welcomeMessage").textContent = 
    `Welcome, ${user.full_name} (${user.role})`; 
 
 
async function loadDashboard() { 
 
    try { 
 
        const response = await fetch( 
            "/api/dashboard/summary", 
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
            "totalMedicines" 
        ).textContent = 
            data.totalMedicines; 
 
 
        document.getElementById( 
            "totalStock" 
        ).textContent = 
            data.totalStock; 
 
 
        document.getElementById( 
            "lowStock" 
        ).textContent = 
            data.lowStock; 
 
 
        document.getElementById( 
            "totalSales" 
        ).textContent = 
            Number(data.totalSales).toFixed(2); 


        // ==============================
        // LOW STOCK MEDICINES TABLE
        // ==============================

        const lowStockTable =
            document.getElementById("lowStockTable");

        lowStockTable.innerHTML = "";

        if (
            !data.lowStockMedicines ||
            data.lowStockMedicines.length === 0
        ) {

            lowStockTable.innerHTML = `
                <tr>
                    <td colspan="3">
                        No low stock medicines.
                    </td>
                </tr>
            `;

        } else {

            data.lowStockMedicines.forEach(
                medicine => {

                    const row =
                        document.createElement("tr");

                    row.innerHTML = `
                        <td>
                            ${medicine.medicine_name}
                        </td>

                        <td>
                            ${medicine.quantity}
                        </td>

                        <td>
                            ${medicine.reorder_level}
                        </td>
                    `;

                    lowStockTable.appendChild(row);

                }
            );

        }
 
 
    } catch (error) { 
 
        console.error(error); 
 
    } 
 
} 
 
 
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
 
 
loadDashboard();

