document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const tablesList = document.getElementById('tables-list');
    const tableSelect = document.getElementById('tableNumber');
    const reservationForm = document.getElementById('reservation-form');
    const reservationMessage = document.getElementById('reservation-message');
    const reservationsList = document.getElementById('reservations-list');
    
    // Load initial data
    loadTables();
    loadReservations();
    
    // Event listeners
    reservationForm.addEventListener('submit', handleReservationSubmit);
    
    // Functions
    async function loadTables() {
        try {
            const response = await fetch('/tables');
            const tables = await response.json();
            
            // Display available tables
            let html = '<table><tr><th>Table #</th><th>Seats</th><th>Status</th></tr>';
            
            tables.forEach(table => {
                html += `<tr>
                    <td>${table.id}</td>
                    <td>${table.seats}</td>
                    <td>${table.available ? 'Available' : 'Reserved'}</td>
                </tr>`;
            });
            
            html += '</table>';
            tablesList.innerHTML = html;
            
            // Update table select options
            tableSelect.innerHTML = '<option value="">Select a table</option>';
            tables.forEach(table => {
                if (table.available) {
                    const option = document.createElement('option');
                    option.value = table.id;
                    option.textContent = `Table ${table.id} (${table.seats} seats)`;
                    tableSelect.appendChild(option);
                }
            });
            
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    }
    
    async function loadReservations() {
        try {
            const response = await fetch('/reservations');
            const reservations = await response.json();
            
            let html = '<table><tr><th>ID</th><th>Table #</th><th>Name</th><th>Guests</th><th>Time</th><th>Action</th></tr>';
            
            reservations.forEach(reservation => {
                html += `<tr>
                    <td>${reservation.id}</td>
                    <td>${reservation.tableNumber}</td>
                    <td>${reservation.customerName}</td>
                    <td>${reservation.guestCount}</td>
                    <td>${new Date(reservation.time).toLocaleString()}</td>
                    <td>
                        <button onclick="cancelReservation(${reservation.id})">Cancel</button>
                        <button onclick="showUpdateForm(${reservation.id})">Update</button>
                    </td>
                </tr>`;
            });
            
            html += '</table>';
            reservationsList.innerHTML = html;
            
        } catch (error) {
            console.error('Error loading reservations:', error);
        }
    }
    
    async function handleReservationSubmit(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customerName').value;
        const guestCount = parseInt(document.getElementById('guestCount').value);
        const time = document.getElementById('time').value;
        const tableNumber = parseInt(document.getElementById('tableNumber').value);
        
        try {
            const response = await fetch('/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tableNumber,
                    customerName,
                    guestCount,
                    time: time || new Date().toISOString()
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                reservationMessage.innerHTML = `<p class="success">${data.success}</p>`;
                reservationForm.reset();
                loadTables();
                loadReservations();
            } else {
                reservationMessage.innerHTML = `<p class="error">${data.error}</p>`;
            }
            
        } catch (error) {
            console.error('Error making reservation:', error);
            reservationMessage.innerHTML = `<p class="error">Error making reservation</p>`;
        }
    }
    
    window.cancelReservation = async function(id) {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            try {
                const response = await fetch(`/cancel/${id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert(data.success);
                    loadTables();
                    loadReservations();
                } else {
                    alert(data.error);
                }
                
            } catch (error) {
                console.error('Error cancelling reservation:', error);
                alert('Error cancelling reservation');
            }
        }
    };
    
    window.showUpdateForm = async function(id) {
        // Find the reservation
        const response = await fetch('/reservations');
        const reservations = await response.json();
        const reservation = reservations.find(r => r.id === id);
        
        if (!reservation) {
            alert('Reservation not found');
            return;
        }
        
        // Create update form
        const formHtml = `
            <div id="update-form">
                <h3>Update Reservation #${id}</h3>
                <form onsubmit="handleUpdateSubmit(event, ${id})">
                    <label>Name:</label>
                    <input type="text" id="update-name" value="${reservation.customerName}" required>
                    
                    <label>Guest Count:</label>
                    <input type="number" id="update-guests" value="${reservation.guestCount}" min="1" max="8" required>
                    
                    <label>Time:</label>
                    <input type="datetime-local" id="update-time" value="${reservation.time.slice(0, 16)}">
                    
                    <label>Table Number:</label>
                    <select id="update-table" required>
                        <option value="">Select a table</option>
                    </select>
                    
                    <button type="submit">Update</button>
                    <button type="button" onclick="document.getElementById('update-form').remove()">Cancel</button>
                </form>
            </div>
        `;
        
        // Add form to page
        const existingForm = document.getElementById('update-form');
        if (existingForm) existingForm.remove();
        
        reservationsList.insertAdjacentHTML('afterend', formHtml);
        
        // Load tables for the select
        const tableSelect = document.getElementById('update-table');
        const tablesResponse = await fetch('/tables');
        const tables = await tablesResponse.json();
        
        tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table.id;
            option.textContent = `Table ${table.id} (${table.seats} seats)`;
            option.selected = table.id === reservation.tableNumber;
            tableSelect.appendChild(option);
        });
    };
    
    window.handleUpdateSubmit = async function(e, id) {
        e.preventDefault();
        
        const customerName = document.getElementById('update-name').value;
        const guestCount = parseInt(document.getElementById('update-guests').value);
        const time = document.getElementById('update-time').value;
        const tableNumber = parseInt(document.getElementById('update-table').value);
        
        try {
            const response = await fetch(`/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tableNumber,
                    customerName,
                    guestCount,
                    time: time || new Date().toISOString()
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(data.success);
                document.getElementById('update-form').remove();
                loadTables();
                loadReservations();
            } else {
                alert(data.error);
            }
            
        } catch (error) {
            console.error('Error updating reservation:', error);
            alert('Error updating reservation');
        }
    };
});