const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
    constructor() {
        this.dataDir = path.join(__dirname, 'data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.paymentsFile = path.join(this.dataDir, 'payments.json');
        this.init();
    }

    async init() {
        await fs.ensureDir(this.dataDir);
        
        if (!await fs.pathExists(this.usersFile)) {
            await fs.writeJson(this.usersFile, {});
        }
        
        if (!await fs.pathExists(this.paymentsFile)) {
            await fs.writeJson(this.paymentsFile, {});
        }
    }

    async getUsers() {
        return await fs.readJson(this.usersFile);
    }

    async getUser(telegramId) {
        const users = await this.getUsers();
        return users[telegramId] || null;
    }

    async createUser(telegramId, userData = {}) {
        const users = await this.getUsers();
        const referralCode = uuidv4().substring(0, 8);
        
        const newUser = {
            telegramId,
            referralCode,
            messagesLeft: parseInt(process.env.STARTING_MESSAGES),
            imagesLeft: parseInt(process.env.STARTING_IMAGES),
            premiumStatus: 'free',
            referredUsers: [],
            joinedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            totalSpent: 0,
            chatMood: 'normal',
            hasJoinedChannel: false,
            ...userData
        };

        users[telegramId] = newUser;
        await fs.writeJson(this.usersFile, users, { spaces: 2 });
        
        return newUser;
    }

    async updateUser(telegramId, updates) {
        const users = await this.getUsers();
        if (users[telegramId]) {
            users[telegramId] = { ...users[telegramId], ...updates };
            await fs.writeJson(this.usersFile, users, { spaces: 2 });
            return users[telegramId];
        }
        return null;
    }

    async deleteUser(telegramId) {
        const users = await this.getUsers();
        delete users[telegramId];
        await fs.writeJson(this.usersFile, users, { spaces: 2 });
    }

    async decrementMessages(telegramId) {
        const users = await this.getUsers();
        if (users[telegramId] && users[telegramId].messagesLeft > 0) {
            users[telegramId].messagesLeft--;
            users[telegramId].lastActive = new Date().toISOString();
            await fs.writeJson(this.usersFile, users, { spaces: 2 });
        }
    }

    async decrementImages(telegramId) {
        const users = await this.getUsers();
        if (users[telegramId] && users[telegramId].imagesLeft > 0) {
            users[telegramId].imagesLeft--;
            users[telegramId].lastActive = new Date().toISOString();
            await fs.writeJson(this.usersFile, users, { spaces: 2 });
        }
    }

    async addReferral(referralCode, newUserId) {
        const users = await this.getUsers();
        
        // Find the referrer
        const referrer = Object.values(users).find(user => user.referralCode === referralCode);
        
        if (referrer && !referrer.referredUsers.includes(newUserId)) {
            referrer.referredUsers.push(newUserId);
            referrer.messagesLeft += parseInt(process.env.REFERRAL_BONUS_MESSAGES);
            referrer.imagesLeft += parseInt(process.env.REFERRAL_BONUS_IMAGES);
            
            await fs.writeJson(this.usersFile, users, { spaces: 2 });
            return true;
        }
        
        return false;
    }

    // Payment methods
    async getPayments() {
        return await fs.readJson(this.paymentsFile);
    }

    async createPayment(paymentData) {
        const payments = await this.getPayments();
        const paymentId = uuidv4();
        
        const newPayment = {
            id: paymentId,
            createdAt: new Date().toISOString(),
            status: 'pending',
            ...paymentData
        };

        payments[paymentId] = newPayment;
        await fs.writeJson(this.paymentsFile, payments, { spaces: 2 });
        
        return newPayment;
    }

    async updatePayment(paymentId, updates) {
        const payments = await this.getPayments();
        if (payments[paymentId]) {
            payments[paymentId] = { ...payments[paymentId], ...updates };
            await fs.writeJson(this.paymentsFile, payments, { spaces: 2 });
            return payments[paymentId];
        }
        return null;
    }

    async getPayment(paymentId) {
        const payments = await this.getPayments();
        return payments[paymentId] || null;
    }

    async approvePayment(paymentId) {
        const payment = await this.updatePayment(paymentId, { 
            status: 'approved',
            approvedAt: new Date().toISOString()
        });
        
        if (payment) {
            // Add credits to user
            const users = await this.getUsers();
            const user = users[payment.userId];
            
            if (user) {
                user.messagesLeft += payment.messages;
                user.imagesLeft += payment.images;
                user.premiumStatus = 'premium';
                user.totalSpent += payment.amount;
                
                await fs.writeJson(this.usersFile, users, { spaces: 2 });
            }
        }
        
        return payment;
    }

    async rejectPayment(paymentId) {
        return await this.updatePayment(paymentId, { 
            status: 'rejected',
            rejectedAt: new Date().toISOString()
        });
    }

    // Stats methods
    async getStats() {
        const users = await this.getUsers();
        const payments = await this.getPayments();
        
        const totalUsers = Object.keys(users).length;
        const activeUsers = Object.values(users).filter(user => {
            const lastActive = new Date(user.lastActive);
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return lastActive > dayAgo;
        }).length;
        
        const premiumUsers = Object.values(users).filter(user => user.premiumStatus === 'premium').length;
        const pendingPayments = Object.values(payments).filter(payment => payment.status === 'pending').length;
        
        const totalRevenue = Object.values(payments)
            .filter(payment => payment.status === 'approved')
            .reduce((sum, payment) => sum + payment.amount, 0);

        return {
            totalUsers,
            activeUsers,
            premiumUsers,
            pendingPayments,
            totalRevenue
        };
    }
}

module.exports = new Database();

