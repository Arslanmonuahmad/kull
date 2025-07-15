# 🤖 Lily - AI Telegram Bot

A sophisticated Telegram bot with AI personality, admin panel, and payment system.

## ✨ Features

### 🤖 Bot Features
- **Channel Verification**: Prompts users to join @drewdevelops (bot proceeds after user clicks "I Joined" without API verification)
- **Image Generation**: Anime girl images using PiAPI Flux
- **Referral System**: Earn credits by inviting friends
- **Premium Plans**: Two-tier payment system via UPI
- **Credit Management**: Messages and image credits tracking

### 🎯 Bot Buttons
1. **Get Referral Link** - Generate unique referral links
2. **Send Me a Picture** - AI-generated anime images
3. **Credits** - View remaining messages/images
4. **Premium Plan** - Purchase premium credits

### 💰 Credit System
- **Starting Credits**: 40 messages + 6 images
- **Referral Bonus**: +45 messages + 5 images per referral
- **Premium Tier 1**: ₹50 → 100 messages + 25 images
- **Premium Tier 2**: ₹100 → 210 messages + 62 images

### 💳 Payment Process
1. User selects a premium plan
2. Bot provides UPI ID and payment instructions
3. User makes payment via UPI
4. **User sends UTR ID (12-digit transaction ID)**
5. User sends payment screenshot
6. Admin approves/rejects the payment
7. Credits are automatically added upon approval

### 🛠️ Admin Panel
- **User Management**: View, edit, delete users
- **Payment Approval**: Approve/reject premium purchases
- **Analytics Dashboard**: User stats and growth charts
- **Credit Management**: Manually adjust user balances

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Telegram Bot Token
- DeepSeek API Key
- PiAPI Key

### Installation

1. **Extract the ZIP file** to your CPanel file manager
2. **Navigate to the project directory**
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Configure environment** (edit .env file):
   ```env
   BOT_TOKEN=your_telegram_bot_token
   DEEPSEEK_API_KEY=your_deepseek_api_key
   IMAGE_API_KEY=your_piapi_key
   ```
5. **Start the application**:
   ```bash
   npm start
   ```

### CPanel Deployment

1. Upload the ZIP file to your CPanel File Manager
2. Extract in your domain's public_html folder
3. Open Terminal in CPanel
4. Navigate to the project folder
5. Run: `npm install`
6. Run: `npm start`
7. Set up a Node.js app in CPanel pointing to index.js

## 🔧 Configuration

### Environment Variables (.env)
```env
# Bot Configuration
BOT_TOKEN=7981613211:AAGAth1UIT5c6gJXM88qXa1wdX8mfijHdh8
CHANNEL_ID=@drewdevelops
BOT_NAME=Lily

# API Keys
DEEPSEEK_API_KEY=sk-b91de9802d8c401480297b059c082d5a
IMAGE_API_KEY=fac5319370a86485c1c938da4aaf800142906e33624c749abf4b8425f9cb54d1

# Admin Credentials
ADMIN_USERNAME=monekyspeed
ADMIN_PASSWORD=monkeyspeed

# Payment Settings
UPI_ID=srkisking@ibl

# Credit Settings
STARTING_MESSAGES=40
STARTING_IMAGES=6
REFERRAL_BONUS_MESSAGES=45
REFERRAL_BONUS_IMAGES=5

# Premium Plans
TIER_1_PRICE=50
TIER_1_MESSAGES=100
TIER_1_IMAGES=25
TIER_2_PRICE=100
TIER_2_MESSAGES=210
TIER_2_IMAGES=62

# Server Settings
PORT=3000
SESSION_SECRET=jh4A!v9XZ9#Dp3L
```

## 🎮 Usage

### For Users
1. Start the bot: `/start`
2. Join the required channel
3. Use the 4 main buttons for different features
4. Chat naturally with Lily in Hinglish
5. Refer friends to earn credits
6. Purchase premium plans for more credits

### For Admins
1. Visit: `http://yourdomain.com/admin/login`
2. Login with: `monekyspeed` / `monkeyspeed`
3. Manage users, approve payments, view analytics

## 🏗️ Project Structure

```
lily-telegram-bot/
├── index.js          # Main entry point
├── bot.js            # Telegram bot logic
├── server.js         # Express web server
├── database.js       # JSON database management
├── utils.js          # AI chat & image generation
├── package.json      # Dependencies & scripts
├── .env              # Environment configuration
├── views/            # HTML templates
│   ├── login.html    # Admin login page
│   └── admin.html    # Admin dashboard
├── public/           # Static assets
├── data/             # JSON database files
└── README.md         # This file
```

## 🔒 Security Features

- Session-based admin authentication
- Environment variable protection
- CORS enabled for cross-origin requests
- Input validation and sanitization
- Secure payment verification process

## 🎨 Customization

### Bot Personality
Edit the system prompt in `utils.js` to change Lily's personality, language style, or behavior.

### UI Styling
The admin panel uses Tailwind CSS. Modify `views/admin.html` and `views/login.html` for custom styling.

### Credit System
Adjust credit amounts and pricing in the `.env` file.

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check BOT_TOKEN in .env
   - Verify bot is started with `/start`
   - Check console for errors

2. **AI not working**
   - Verify DEEPSEEK_API_KEY is valid
   - Check API quota and billing
   - Review console logs for API errors

3. **Images not generating**
   - Verify IMAGE_API_KEY is valid
   - Check PiAPI account status
   - Review network connectivity

4. **Admin panel not loading**
   - Check if server is running on correct port
   - Verify admin credentials
   - Check browser console for errors

### Logs
Check console output for detailed error messages and debugging information.

## 📞 Support

For technical support or customization requests, please contact the development team.

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for Telegram Bot enthusiasts**

