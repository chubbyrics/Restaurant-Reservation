const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Sample initial data
let tables = [
    { id: 1, seats: 4, available: true },
    { id: 2, seats: 4, available: true },
    { id: 3, seats: 6, available: true },
    { id: 4, seats: 6, available: true },
    { id: 5, seats: 8, available: true }
];

let reservations = [];

// Middleware for input validation
const validateReservation = (req, res, next) => {
    const { tableNumber, customerName, guestCount, time } = req.body;
    
    if (!customerName || !guestCount) {
        return res.status(400).json({ error: "Name and guest count required" });
    }
    
    if (guestCount > 8) {
        return res.status(400).json({ error: "No available tables for 8+ guests" });
    }
    
    next();
};

// Routes
// GET /tables - Display available tables
app.get('/tables', (req, res) => {
    res.json(tables.filter(table => table.available));
});

// POST /reserve - Reserve a table
app.post('/reserve', validateReservation, (req, res) => {
    const { tableNumber, customerName, guestCount, time } = req.body;
    
    // Find the table
    const table = tables.find(t => t.id === tableNumber);
    
    if (!table || !table.available) {
        return res.status(400).json({ error: "Table not available" });
    }
    
    if (guestCount > table.seats) {
        return res.status(400).json({ error: `Table ${tableNumber} only seats ${table.seats}` });
    }
    
    // Create reservation
    const reservation = {
        id: reservations.length + 1,
        tableNumber,
        customerName,
        guestCount,
        time: time || new Date().toISOString(),
        status: 'confirmed'
    };
    
    reservations.push(reservation);
    table.available = false;
    
    res.json({ 
        success: `Table ${tableNumber} reserved for ${customerName} (${guestCount} guests)`,
        reservation
    });
});

// GET /reservations - View all reservations
app.get('/reservations', (req, res) => {
    res.json(reservations);
});

// PUT /update/:id - Modify a reservation
app.put('/update/:id', validateReservation, (req, res) => {
    const { id } = req.params;
    const { tableNumber, customerName, guestCount, time } = req.body;
    
    const reservationIndex = reservations.findIndex(r => r.id === parseInt(id));
    
    if (reservationIndex === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }
    
    // Find the original table and mark it as available
    const originalTable = tables.find(t => t.id === reservations[reservationIndex].tableNumber);
    if (originalTable) originalTable.available = true;
    
    // Find the new table
    const newTable = tables.find(t => t.id === tableNumber);
    
    if (!newTable || !newTable.available) {
        // Revert the original table status if new table isn't available
        if (originalTable) originalTable.available = false;
        return res.status(400).json({ error: "New table not available" });
    }
    
    if (guestCount > newTable.seats) {
        // Revert the original table status if new table isn't suitable
        if (originalTable) originalTable.available = false;
        return res.status(400).json({ error: `Table ${tableNumber} only seats ${newTable.seats}` });
    }
    
    // Update reservation
    reservations[reservationIndex] = {
        ...reservations[reservationIndex],
        tableNumber,
        customerName,
        guestCount,
        time: time || reservations[reservationIndex].time
    };
    
    newTable.available = false;
    
    res.json({ 
        success: `Reservation updated for ${customerName} (${guestCount} guests)`,
        reservation: reservations[reservationIndex]
    });
});

// DELETE /cancel/:id - Cancel a reservation
app.delete('/cancel/:id', (req, res) => {
    const { id } = req.params;
    
    const reservationIndex = reservations.findIndex(r => r.id === parseInt(id));
    
    if (reservationIndex === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }
    
    const reservation = reservations[reservationIndex];
    const table = tables.find(t => t.id === reservation.tableNumber);
    
    if (table) {
        table.available = true;
    }
    
    reservations.splice(reservationIndex, 1);
    
    res.json({ 
        success: `Reservation ${id} cancelled`,
        cancelledReservation: reservation
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});