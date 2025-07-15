# 🚀 CPanel Deployment Guide

Complete step-by-step guide to deploy Lily Bot on CPanel hosting.

## 📋 Prerequisites

- CPanel hosting account with Node.js support
- Domain or subdomain configured
- SSH/Terminal access (optional but recommended)
- File Manager access

## 🔧 Step 1: Upload Files

1. **Download the ZIP file** provided
2. **Login to CPanel** → File Manager
3. **Navigate** to your domain's `public_html` folder
4. **Upload** the `lily-telegram-bot.zip` file
5. **Extract** the ZIP file
6. **Move contents** from extracted folder to your desired location

## 📁 Step 2: File Structure

After extraction, your directory should look like:
```
your-domain.com/
├── index.js
├── bot.js
├── server.js
├── database.js
├── utils.js
├── package.json
├── .env
├── views/
├── public/
├── data/
└── README.md
```

## ⚙️ Step 3: Configure Environment

1. **Edit .env file** using File Manager editor
2. **Update the following values**:
   ```env
   BOT_TOKEN=YOUR_ACTUAL_BOT_TOKEN
   DEEPSEEK_API_KEY=YOUR_ACTUAL_DEEPSEEK_KEY
   IMAGE_API_KEY=YOUR_ACTUAL_PIAPI_KEY
   PORT=3000
   ```
3. **Save the file**

## 🔧 Step 4: Install Dependencies

### Option A: Using CPanel Terminal
1. **Open Terminal** in CPanel
2. **Navigate** to your project directory:
   ```bash
   cd public_html/your-project-folder
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

### Option B: Using SSH
1. **Connect via SSH**:
   ```bash
   ssh username@your-domain.com
   ```
2. **Navigate and install**:
   ```bash
   cd public_html/your-project-folder
   npm install
   ```

## 🚀 Step 5: Setup Node.js App

1. **Go to CPanel** → Software → Node.js Selector
2. **Create Node.js App**:
   - **Node.js Version**: 14.x or higher
   - **Application Mode**: Production
   - **Application Root**: your-project-folder
   - **Application URL**: your-domain.com or subdomain
   - **Application Startup File**: index.js
3. **Click "Create"**

## 🔄 Step 6: Configure App Settings

1. **Set Environment Variables** in Node.js app settings:
   ```
   BOT_TOKEN=your_bot_token
   DEEPSEEK_API_KEY=your_deepseek_key
   IMAGE_API_KEY=your_piapi_key
   PORT=3000
   ```

2. **Install NPM Modules** (if not done in Step 4):
   - Click "Run NPM Install"

## ▶️ Step 7: Start the Application

1. **Click "Start App"** in Node.js Selector
2. **Verify Status**: Should show "Running"
3. **Check Logs** for any errors

## 🌐 Step 8: Access Admin Panel

1. **Visit**: `https://your-domain.com/admin/login`
2. **Login with**:
   - Username: `monekyspeed`
   - Password: `monkeyspeed`
3. **Verify** dashboard loads correctly

## 🤖 Step 9: Test Telegram Bot

1. **Open Telegram**
2. **Search** for your bot: `@your_bot_username`
3. **Send** `/start` command
4. **Test** all features:
   - Channel verification
   - Button responses
   - AI chat
   - Image generation
   - Referral system

## 🔧 Troubleshooting

### Bot Not Responding
```bash
# Check if app is running
ps aux | grep node

# Restart the app
# Go to CPanel → Node.js Selector → Restart
```

### Port Issues
- Ensure PORT in .env matches CPanel Node.js app port
- Default CPanel ports: 3000, 3001, 3002, etc.

### Permission Errors
```bash
# Fix file permissions
chmod 755 index.js
chmod 644 package.json
chmod 600 .env
```

### Database Issues
```bash
# Create data directory if missing
mkdir -p data
chmod 755 data
```

### Memory Issues
- Upgrade hosting plan if needed
- Optimize code for lower memory usage
- Use PM2 for process management (if available)

## 📊 Monitoring

### Check Application Status
1. **CPanel** → Node.js Selector
2. **View** application status and logs
3. **Monitor** resource usage

### Log Files
- Application logs: Available in Node.js app interface
- Error logs: Check CPanel Error Logs section
- Access logs: Check CPanel Raw Access Logs

## 🔄 Updates & Maintenance

### Updating the Bot
1. **Stop** the Node.js application
2. **Upload** new files (backup old ones first)
3. **Run** `npm install` if dependencies changed
4. **Restart** the application

### Backup Strategy
1. **Regular backups** of the entire project folder
2. **Export** user data from `data/` folder
3. **Save** environment configuration

## 🆘 Common Issues & Solutions

### Issue: "Module not found"
**Solution**: Run `npm install` in the project directory

### Issue: "Port already in use"
**Solution**: Change PORT in .env or restart the Node.js app

### Issue: "Permission denied"
**Solution**: Check file permissions and ownership

### Issue: "API key invalid"
**Solution**: Verify API keys in .env file

### Issue: "Database error"
**Solution**: Check data/ folder permissions and ensure it exists

## 📞 Support

If you encounter issues:
1. **Check logs** in CPanel Node.js interface
2. **Verify** all environment variables
3. **Test** API keys independently
4. **Contact** hosting support for server-specific issues

## 🎯 Performance Tips

1. **Enable** Node.js production mode
2. **Use** PM2 for process management (if available)
3. **Monitor** memory and CPU usage
4. **Optimize** database queries
5. **Cache** frequently accessed data

---

**🎉 Congratulations! Your Lily Bot is now live on CPanel!**

