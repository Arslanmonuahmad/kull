require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const database = require('./database');
const { formatUserStats } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ message: 'Authentication required' });
    }
}

// Routes

// Serve login page
app.get('/admin/login', (req, res) => {
    if (req.session.authenticated) {
        return res.redirect('/admin/dashboard');
    }
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Handle login
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            req.session.authenticated = true;
            req.session.username = username;
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Serve admin dashboard
app.get('/admin/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Get dashboard stats
app.get('/admin/stats', requireAuth, async (req, res) => {
    try {
        const stats = await database.getUserStats();
        const payments = await database.getPayments();
        const pendingPayments = payments.filter(p => p.status === 'pending').length;
        
        res.json({
            ...stats,
            pendingPayments
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Get all users
app.get('/admin/users', requireAuth, async (req, res) => {
    try {
        const users = await database.getUsers();
        const formattedUsers = Object.values(users).map(formatUserStats);
        res.json(formattedUsers);
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Update user
app.put('/admin/users/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        
        const updatedUser = await database.updateUser(userId, updates);
        if (updatedUser) {
            res.json({ success: true, user: formatUserStats(updatedUser) });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
app.delete('/admin/users/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const users = await database.getUsers();
        
        if (users[userId]) {
            delete users[userId];
            await database.init(); // This will save the updated users
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all payments
app.get('/admin/payments', requireAuth, async (req, res) => {
    try {
        const payments = await database.getPayments();
        res.json(payments);
    } catch (error) {
        console.error('Payments error:', error);
        res.status(500).json({ error: 'Failed to get payments' });
    }
});

// Approve payment
app.post('/admin/payments/:paymentId/approve', requireAuth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await database.updatePayment(paymentId, { status: 'approved' });
        
        if (payment) {
            // Add credits to user
            const user = await database.getUser(payment.userId);
            if (user) {
                await database.updateUser(payment.userId, {
                    messagesLeft: user.messagesLeft + parseInt(payment.messages),
                    imagesLeft: user.imagesLeft + parseInt(payment.images),
                    premiumStatus: true,
                    totalSpent: (user.totalSpent || 0) + parseInt(payment.amount)
                });
            }
            
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Payment not found' });
        }
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({ error: 'Failed to approve payment' });
    }
});

// Reject payment
app.post('/admin/payments/:paymentId/reject', requireAuth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await database.updatePayment(paymentId, { status: 'rejected' });
        
        if (payment) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Payment not found' });
        }
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({ error: 'Failed to reject payment' });
    }
});

// Logout
app.post('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            res.status(500).json({ error: 'Failed to logout' });
        } else {
            res.json({ success: true });
        }
    });
});

// Redirect root to admin login
app.get('/', (req, res) => {
    res.redirect('/admin/login');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Admin server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;

