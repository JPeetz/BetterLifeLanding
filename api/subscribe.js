const crypto = require('crypto');

// Fallback key for local development (32 bytes)
const LOCAL_DEV_KEY = 'betterlife_secure_local_dev_key_32bytes_len';

module.exports = async (req, res) => {
    // 1. Strict Method Checking
    if (req.method !== 'POST') {
        return res.status(455).json({ 
            success: false, 
            error: 'Method Not Allowed' 
        });
    }

    try {
        const { email, honeypot, consent } = req.body;

        // 2. Spam Honeypot Check (Silently drop if honeypot is filled)
        if (honeypot && honeypot.trim() !== '') {
            console.log('🤖 Spam attempt blocked via honeypot.');
            return res.status(200).json({ 
                success: true, 
                message: 'Subscription logged successfully (spam-filter).' 
            });
        }

        // 3. User Consent Check
        if (consent !== true && consent !== 'true') {
            return res.status(400).json({ 
                success: false, 
                error: 'Consent to privacy policy is required.' 
            });
        }

        // 4. Server-Side Email Validation
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'Email address is required.' 
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail.length > 150) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email address exceeds maximum allowed length.' 
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please enter a valid email address.' 
            });
        }

        // 5. Symmetric AES-256 Encryption at Rest (GDPR-Compliant)
        // Retrieve key from Vercel env var, fallback to local development key
        const cryptoKeyRaw = process.env.SUBSCRIBE_CRYPTO_KEY || LOCAL_DEV_KEY;
        
        // Ensure key is exactly 32 bytes for AES-256
        const key = crypto.createHash('sha256').update(cryptoKeyRaw).digest();
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(cleanEmail, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const subscriptionRecord = {
            id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
            iv: iv.toString('hex'),
            encryptedData: encrypted,
            timestamp: new Date().toISOString()
        };

        // 6. Secure Processing & Storage hooks
        console.log(`🔒 SECURE SUBSCRIPTION REGISTERED:`);
        console.log(`Record ID: ${subscriptionRecord.id}`);
        console.log(`Encrypted Payload: ${subscriptionRecord.encryptedData}`);
        console.log(`IV Hash: ${subscriptionRecord.iv}`);
        console.log(`Time: ${subscriptionRecord.timestamp}`);

        // DB Integrations:
        // A. Vercel KV Hook (if configured):
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            try {
                const { createClient } = require('@vercel/kv');
                const kv = createClient({
                    url: process.env.KV_REST_API_URL,
                    token: process.env.KV_REST_API_TOKEN,
                });
                // Save record mapped to unique subscription ID
                await kv.set(`subscribe:${subscriptionRecord.id}`, subscriptionRecord);
                console.log('✅ Successfully persisted encrypted record to Vercel KV Edge Redis!');
            } catch (kvError) {
                console.error('❌ Vercel KV writing error (attempted edge pipeline):', kvError);
            }
        }

        // B. Custom API Webhook (e.g. Resend or internal CRM):
        if (process.env.CRM_WEBHOOK_URL) {
            try {
                await fetch(process.env.CRM_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscriptionRecord)
                });
                console.log('📬 Dispatched encrypted record to corporate CRM webhook.');
            } catch (webhookError) {
                console.error('❌ CRM webhook dispatch failed:', webhookError);
            }
        }

        // 7. Successful Response
        return res.status(200).json({ 
            success: true, 
            message: 'Thank you! Your secure release notification registration is complete.' 
        });

    } catch (error) {
        console.error('💥 Crash in subscribe API handler:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'An internal gateway or encryption fault occurred.' 
        });
    }
};
