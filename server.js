const express = require('express');
const bodyParser = require('body-parser');
<<<<<<< HEAD
const cors = require('cors'); // Added for cross-origin support
const app = express();
const PORT = process.env.PORT || 3000; // Allow environment variable configuration

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage (in-memory for this example)
=======
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Sample initial data
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
let tables = [
    { id: 1, seats: 4, available: true },
    { id: 2, seats: 4, available: true },
    { id: 3, seats: 6, available: true },
    { id: 4, seats: 6, available: true },
    { id: 5, seats: 8, available: true }
];

let reservations = [];
<<<<<<< HEAD
let nextReservationId = 1;

// Enhanced validation middleware
const validateReservation = (req, res, next) => {
    const { tableNumber, customerName, guestCount, time } = req.body;
    
    if (!customerName?.trim()) {
        return res.status(400).json({ error: "Customer name is required" });
    }
    
    if (!guestCount || isNaN(guestCount) || guestCount < 1) {
        return res.status(400).json({ error: "Valid guest count is required" });
    }
    
    if (guestCount > 8) {
        return res.status(400).json({ error: "No available tables for more than 8 guests" });
=======

// Middleware for input validation
const validateReservation = (req, res, next) => {
    const { tableNumber, customerName, guestCount, time } = req.body;
    
    if (!customerName || !guestCount) {
        return res.status(400).json({ error: "Name and guest count required" });
    }
    
    if (guestCount > 8) {
        return res.status(400).json({ error: "No available tables for 8+ guests" });
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
    }
    
    next();
};

<<<<<<< HEAD
// Helper function to find a table
const findTable = (id) => tables.find(t => t.id === id);

// Routes
app.get('/tables', (req, res) => {
    res.json({
        available: tables.filter(table => table.available),
        all: tables
    });
});

app.post('/reserve', validateReservation, (req, res) => {
    const { tableNumber, customerName, guestCount, time } = req.body;
    const table = findTable(tableNumber);
    
    if (!table) {
        return res.status(404).json({ error: "Table not found" });
    }
    
    if (!table.available) {
        return res.status(400).json({ error: "Table is already reserved" });
    }
    
    if (guestCount > table.seats) {
        return res.status(400).json({ 
            error: `Table ${tableNumber} only seats ${table.seats}`,
            suggestedTables: tables.filter(t => t.seats >= guestCount && t.available)
        });
    }
    
    const reservation = {
        id: nextReservationId++,
=======
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
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
        tableNumber,
        customerName,
        guestCount,
        time: time || new Date().toISOString(),
<<<<<<< HEAD
        status: 'confirmed',
        createdAt: new Date().toISOString()
=======
        status: 'confirmed'
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
    };
    
    reservations.push(reservation);
    table.available = false;
    
<<<<<<< HEAD
    res.status(201).json({
        success: true,
        message: `Table ${tableNumber} reserved for ${customerName}`,
=======
    res.json({ 
        success: `Table ${tableNumber} reserved for ${customerName} (${guestCount} guests)`,
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
        reservation
    });
});

<<<<<<< HEAD
app.get('/reservations', (req, res) => {
    res.json({
        count: reservations.length,
        reservations
    });
});

app.put('/reservations/:id', validateReservation, (req, res) => {
    const { id } = req.params;
    const { tableNumber, customerName, guestCount, time } = req.body;
    
    const reservation = reservations.find(r => r.id === parseInt(id));
    
    if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
    }
    
    // Handle table change if needed
    if (tableNumber && tableNumber !== reservation.tableNumber) {
        const oldTable = findTable(reservation.tableNumber);
        if (oldTable) oldTable.available = true;
        
        const newTable = findTable(tableNumber);
        if (!newTable || !newTable.available) {
            if (oldTable) oldTable.available = false;
            return res.status(400).json({ error: "New table not available" });
        }
        
        if (guestCount > newTable.seats) {
            if (oldTable) oldTable.available = false;
            return res.status(400).json({ error: `Table ${tableNumber} only seats ${newTable.seats}` });
        }
        
        newTable.available = false;
        reservation.tableNumber = tableNumber;
    }
    
    // Update reservation details
    reservation.customerName = customerName || reservation.customerName;
    reservation.guestCount = guestCount || reservation.guestCount;
    reservation.time = time || reservation.time;
    reservation.updatedAt = new Date().toISOString();
    
    res.json({
        success: true,
        message: "Reservation updated successfully",
        reservation
    });
});

app.delete('/reservations/:id', (req, res) => {
    const { id } = req.params;
    const index = reservations.findIndex(r => r.id === parseInt(id));
    
    if (index === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }
    
    const reservation = reservations[index];
    const table = findTable(reservation.tableNumber);
=======
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
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
    
    if (table) {
        table.available = true;
    }
    
<<<<<<< HEAD
    reservations.splice(index, 1);
    
    res.json({
        success: true,
        message: `Reservation #${id} cancelled`,
=======
    reservations.splice(reservationIndex, 1);
    
    res.json({ 
        success: `Reservation ${id} cancelled`,
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
        cancelledReservation: reservation
    });
});

<<<<<<< HEAD
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`- GET /tables`);
    console.log(`- POST /reserve`);
    console.log(`- GET /reservations`);
    console.log(`- PUT /reservations/:id`);
    console.log(`- DELETE /reservations/:id`);
=======
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
>>>>>>> 4a644d0c61e1ae161cd23b79e2a9edf56f8c9f50
});