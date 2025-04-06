const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Added for cross-origin support
const app = express();
const PORT = process.env.PORT || 3000; // Allow environment variable configuration

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage (in-memory for this example)
let tables = [
    { id: 1, seats: 4, available: true },
    { id: 2, seats: 4, available: true },
    { id: 3, seats: 6, available: true },
    { id: 4, seats: 6, available: true },
    { id: 5, seats: 8, available: true }
];

let reservations = [];
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
    }
    
    next();
};

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
        tableNumber,
        customerName,
        guestCount,
        time: time || new Date().toISOString(),
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    reservations.push(reservation);
    table.available = false;
    
    res.status(201).json({
        success: true,
        message: `Table ${tableNumber} reserved for ${customerName}`,
        reservation
    });
});

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
    
    if (table) {
        table.available = true;
    }
    
    reservations.splice(index, 1);
    
    res.json({
        success: true,
        message: `Reservation #${id} cancelled`,
        cancelledReservation: reservation
    });
});

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
});