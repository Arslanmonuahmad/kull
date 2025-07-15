require('dotenv').config();

// Start both the Telegram bot and web server
console.log('🚀 Starting Lily Bot System...');

// Initialize database first
const database = require('./database');

// Start the web server
require('./server');

// Start the Telegram bot
require('./bot');

console.log('✅ Lily Bot System is fully operational!');
console.log('📱 Telegram Bot: Active');
console.log('🌐 Admin Panel: http://localhost:' + (process.env.PORT || 3000));
console.log('🔐 Admin Login: monekyspeed / monkeyspeed');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Lily Bot System...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Lily Bot System...');
    process.exit(0);
});

