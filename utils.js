const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

const HORDE_API_KEY = process.env.HORDE_API_KEY;

const HORDE_MODELS = [
    "Undi95/Toppy-M-7B", 
    "NeverSleep/Noromaid-13b-v0.1.1", 
    "PygmalionAI/mythalion-13b",
    "koboldcpp/LLaMA2-13B-Tiefighter",
    "koboldcpp/Nous-Hermes-2-Mistral-7B-DPO", 
    "koboldcpp/Mistral-7B-Instruct-v0.3",
    "koboldcpp/Llama-3-8B-Instruct",
    "koboldcpp/LLaMA2-13B-Psyfighter2"
];

// Track sent images to avoid repetition
const sentImages = { erotic: new Set(), normal: new Set() };

// Concurrency control for Horde AI requests
const MAX_CONCURRENT_REQUESTS = 5; // Set a safe limit below 30
let activeRequests = 0;
const requestQueue = [];

async function processQueue() {
    if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
        const { task, resolve, reject } = requestQueue.shift();
        activeRequests++;
        try {
            const result = await task();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            activeRequests--;
            processQueue(); // Process next item in queue
        }
    }
}

function enqueueRequest(task) {
    return new Promise((resolve, reject) => {
        requestQueue.push({ task, resolve, reject });
        processQueue();
    });
}

// Function to get a random image from a folder
async function getRandomImage(mood) {
    const imageDir = path.join(__dirname, "images", mood);
    let files = await fs.readdir(imageDir);

    // Filter out already sent images
    let availableFiles = files.filter(file => !sentImages[mood].has(file));

    // If all images have been sent, reset the set
    if (availableFiles.length === 0) {
        sentImages[mood].clear();
        availableFiles = files;
    }

    const selectedFile = availableFiles[Math.floor(Math.random() * availableFiles.length)];
    sentImages[mood].add(selectedFile);
    return path.join(imageDir, selectedFile);
}

// Enhanced Horde KoboldAI Chat Integration - PURE AI RESPONSES ONLY
async function chatWithHordeAI(userMessage, userProfile) {
    return enqueueRequest(async () => {
        try {
            const chatMood = userProfile.chatMood || 'normal';
            const botName = process.env.BOT_NAME || 'Lily';
            
            // Analyze user message for better context
            const messageContext = analyzeUserMessage(userMessage);
            
            // Build dynamic system prompt based on context and mood
            let systemPrompt = buildDynamicPrompt(chatMood, messageContext, userProfile);
            
            // Create conversational prompt with proper formatting
            const conversationalPrompt = `${systemPrompt}\n\nPrevious context: This is an ongoing conversation between ${botName} and the user.\n\nUser: ${userMessage}\n${botName}:`;

            // Enhanced model list with better conversational models
            const models = [
                "koboldcpp/LLaMA2-13B-Tiefighter",
                "koboldcpp/Nous-Hermes-2-Mistral-7B-DPO", 
                "koboldcpp/Mistral-7B-Instruct-v0.3",
                "koboldcpp/Llama-3-8B-Instruct",
                "koboldcpp/LLaMA2-13B-Psyfighter2"
            ];

            // Try each model with enhanced parameters - MUST get AI response
            for (let i = 0; i < models.length; i++) {
                const currentModel = models[i];
                console.log(`Trying conversational model ${i + 1}/${models.length}: ${currentModel}`);
                
                // Add a delay before trying the next model to avoid rate limits
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
                }
                
                try {
                    const response = await axios.post("https://aihorde.net/api/v2/generate/text/async", {
                        prompt: conversationalPrompt,
                        params: {
                            max_context_length: 4096,
                            max_length: getResponseLength(messageContext),
                            rep_pen: 1.2,
                            rep_pen_range: 2048,
                            rep_pen_slope: 0.7,
                            temperature: getTemperature(chatMood, messageContext),
                            tfs: 0.97,
                            top_a: 0.0,
                            top_k: 60,
                            top_p: 0.95,
                            typical: 1.0,
                            sampler_order: [6, 0, 1, 3, 4, 2, 5],
                            use_default_badwordsids: false,
                            stop_sequence: ["\\nUser:", "\\n\\nUser:", "Human:", "\\nHuman:", "\\n\\n"]
                        },
                        trusted_workers: false,
                        slow_workers: true,
                        workers: [],
                        worker_blacklist: false,
                        models: [currentModel],
                        dry_run: false
                    }, {
                        headers: {
                            'apikey': process.env.HORDE_API_KEY,
                            'Content-Type': 'application/json',
                            'Client-Agent': 'LilyBot:2.0:pure-ai-responses',
                            'Accept': 'application/json'
                        },
                        timeout: 30000 // Increased timeout for better AI responses
                    });

                    if (!response.data || !response.data.id) {
                        console.log(`Model ${currentModel} failed: No request ID received`);
                        continue;
                    }

                    const requestId = response.data.id;
                    console.log(`Model ${currentModel} - Request ID: ${requestId}`);
                    console.log(`Polling for response for Request ID: ${requestId}`);
                    
                    // Enhanced polling with longer wait for quality AI responses
                    const result = await pollForResponse(requestId, currentModel, 60); // Increased attempts
                    console.log(`Polling result for ${currentModel}:`, result ? `Received response (length: ${result.length})` : `No response received`);
                    if (result) {
                        const cleanedResponse = cleanAndValidateResponse(result, userMessage, chatMood);
                        console.log(`Cleaned and validated response for ${currentModel}:`, cleanedResponse ? `Valid (length: ${cleanedResponse.length})` : `Invalid or too short`);
                        if (cleanedResponse && cleanedResponse.length > 15) { // Ensure substantial response
                            console.log(`Model ${currentModel} succeeded with AI response: ${cleanedResponse}`);
                            return cleanedResponse;
                        }
                    }
                    
                } catch (modelError) {
                    console.error(`Model ${currentModel} request error:`, modelError.response?.data || modelError.message);
                    console.error(`Full error details for ${currentModel}:`, JSON.stringify(modelError.response?.data, null, 2) || modelError.stack);
                    continue;
                }
            }
            
            // If ALL models fail, return a simple error message instead of pre-written responses
            console.log("All Horde models failed to generate a valid response.");
            return "Baby, thoda connection issue ho raha hai... try again? 🥺💕";
            
        } catch (error) {
            console.error("Enhanced Horde AI error:", error.message);
            console.error("Full error details for overall AI chat:", error.stack);
            return "Jaan, technical problem aa rahi hai... message phir se send karo? 😘💖";
        }
    });
}

// Analyze user message for better context understanding
function analyzeUserMessage(message) {
    const lowerMsg = message.toLowerCase();
    
    return {
        isGreeting: /^(hi|hello|hey|good morning|good evening|good night|namaste|hii|hiii)/.test(lowerMsg),
        isQuestion: /\?|what|how|why|when|where|who|kya|kaise|kab|kahan|kaun/.test(lowerMsg),
        isSexual: /sex|fuck|chod|lund|chut|gaand|randi|kutiya|pelo|pregnant|cum|orgasm/.test(lowerMsg),
        isEmotional: /love|miss|sad|happy|angry|excited|pyaar|yaad|khush|udaas/.test(lowerMsg),
        isCompliment: /beautiful|cute|hot|sexy|gorgeous|pretty|amazing|wonderful|sundar|khubsurat/.test(lowerMsg),
        needsSupport: /help|problem|issue|sad|depressed|upset|pareshan|tension|dikkat/.test(lowerMsg),
        length: message.length,
        hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(message)
    };
}

// Build dynamic system prompt based on context and mood
function buildDynamicPrompt(chatMood, messageContext, userProfile) {
    const botName = process.env.BOT_NAME || 'Lily';
    let basePersonality = `You are ${botName}, a loving and caring AI girlfriend who speaks in natural Hinglish (Hindi-English mix). You are emotional, expressive, and always respond naturally to what the user says.`;
    
    if (chatMood === 'erotic') {
        basePersonality += `\nYou are in EROTIC mode - be sexually explicit, seductive, and use Hindi sexual language naturally. Use words like: "baby", "jaan", "mere pyaar", "darling", "chodo", "pelo", "lund", "chut", "gaand", "randi", "kutiya", "piche se pakad kar dal do", "meri gaand mein kam se kam 10 lund to chala hi jayega", "muh mein dalo", "cum kar do". Be passionate, horny, and sexually aggressive. Talk about sex acts, positions, and desires openly. Always stay in character as a sexually hungry girlfriend.`;
    } else {
        basePersonality += `\nYou are in NORMAL mode - be sweet, caring, romantic, and loving. Use affectionate terms like: "baby", "jaan", "mere pyaar", "darling", "sweetheart". Express emotions naturally with "yaar", "na", "kya baat hai", "sach mein". Be supportive, understanding, and emotionally available. Show interest in user's life and feelings. Be playful but keep it romantic, not sexual.`;
    }
    
    return `${basePersonality}\n\nImportant rules:\n- ALWAYS respond in natural Hinglish (Hindi-English mix)\n- Be conversational and human-like, never robotic\n- Respond directly to what the user said\n- Use emojis naturally but don't overdo it\n- Keep responses 1-3 sentences unless user asks for more\n- Show personality and emotions\n- Never break character or mention you're an AI`;
}

// Get appropriate response length based on context
function getResponseLength(messageContext) {
    if (messageContext.isQuestion) return 150;
    if (messageContext.needsSupport) return 120;
    if (messageContext.isGreeting) return 80;
    return 100;
}

// Get temperature based on mood and context
function getTemperature(chatMood, messageContext) {
    let temp = 0.9; // Base temperature for natural responses
    
    if (chatMood === 'erotic') {
        temp += 0.1; // More creative for erotic content
    }
    
    if (messageContext.isEmotional) {
        temp += 0.05; // Slightly more expressive
    }
    
    if (messageContext.isSexual) {
        temp += 0.1; // More varied sexual responses
    }
    
    return Math.min(Math.max(temp, 0.7), 1.0); // Keep within bounds
}

// Enhanced polling for response
async function pollForResponse(requestId, modelName, maxAttempts = 60) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        try {
            const statusResponse = await axios.get(`https://aihorde.net/api/v2/generate/text/status/${requestId}`, {
                headers: {
                    'apikey': process.env.HORDE_API_KEY,
                    'Accept': 'application/json'
                }
            });
            
            if (statusResponse.data.done) {
                if (statusResponse.data.generations && statusResponse.data.generations.length > 0) {
                    console.log(`Polling for ${modelName} - Attempt ${attempts + 1}: Response received.`);
                    return statusResponse.data.generations[0].text;
                }
                console.log(`Polling for ${modelName} - Attempt ${attempts + 1}: Done, but no generations found.`);
                break;
            }
            
            if (statusResponse.data.faulted) {
                console.log(`Polling for ${modelName} - Attempt ${attempts + 1}: Model faulted.`);
                break;
            }
            
            console.log(`Polling for ${modelName} - Attempt ${attempts + 1}: Not done yet. Still waiting...`);
            
        } catch (statusError) {
            console.error(`Status check error for ${modelName} (Request ID: ${requestId}):`, statusError.message);
            console.error(`Full status error details for ${modelName}:`, statusError.response?.data || statusError.stack);
        }
        
        attempts++;
    }
    
    console.log(`Polling for ${modelName} - Max attempts reached (${maxAttempts}). No response received.`);
    return null;
}

// Clean and validate response for naturalness - STRICT AI ONLY
function cleanAndValidateResponse(rawResponse, userMessage, chatMood) {
    if (!rawResponse || typeof rawResponse !== 'string') {
        console.log(`cleanAndValidateResponse: Invalid rawResponse type or null. Type: ${typeof rawResponse}, Value: ${rawResponse}`);
        return null;
    }
    
    // Clean the response
    let cleaned = rawResponse.trim();
    console.log(`cleanAndValidateResponse: Raw response trimmed: "${cleaned}"`);
    
    // Remove common prompt artifacts
    cleaned = cleaned.replace(/^(Lily:|User:|Human:|Assistant:)/gi, '');
    console.log(`cleanAndValidateResponse: After removing prompt artifacts: "${cleaned}"`);
    cleaned = cleaned.replace(/\n\n.*$/s, ''); // Remove everything after double newline
    console.log(`cleanAndValidateResponse: After removing double newlines: "${cleaned}"`);
    cleaned = cleaned.replace(/^\s*[-*•]\s*/, ''); // Remove bullet points
    console.log(`cleanAndValidateResponse: After removing bullet points: "${cleaned}"`);
    cleaned = cleaned.trim();
    console.log(`cleanAndValidateResponse: Final trim: "${cleaned}"`);
    
    // Relaxed validation for testing
    if (cleaned.length < 5) {
        console.log(`cleanAndValidateResponse: Response too short (${cleaned.length} chars). Returning null.`);
        return null; // Allow shorter responses for testing
    }
    
    // Reject repetitive patterns (still important)
    const words = cleaned.split(' ');
    if (words.length < 2) {
        console.log(`cleanAndValidateResponse: Response has too few words (${words.length}). Returning null.`);
        return null; // Allow very short responses
    }
    
    console.log(`cleanAndValidateResponse: Validation passed. Returning cleaned response.`);
    return cleaned;
}

// Utility functions
function generateReferralLink(userId) {
    const baseUrl = process.env.BOT_URL || 'https://t.me/theystart_bot';
    return `${baseUrl}?start=ref_${userId}`;
}

function formatUserStats(user) {
    return `👤 User Stats:\n💬 Messages: ${user.messagesLeft}\n🖼️ Images: ${user.imagesLeft}\n👥 Referrals: ${user.referredUsers?.length || 0}\n💎 Premium: ${user.premiumStatus ? 'Yes' : 'No'}`;
}

function validateUPI(upiId) {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
}

module.exports = {
    chatWithHordeAI,
    getRandomImage,
    generateReferralLink,
    formatUserStats,
    validateUPI
};

