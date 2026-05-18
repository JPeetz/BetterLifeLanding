const crypto = require('crypto');

// Fallback key for local development (32 bytes)
const LOCAL_DEV_KEY = 'betterlife_secure_local_dev_key_32bytes_len';

module.exports = async (req, res) => {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method Not Allowed' 
        });
    }

    try {
        const { q1, q2, q3, q4, q5, email, consent, honeypot } = req.body;

        // 2. Anti-spam honeypot check
        if (honeypot && honeypot.trim() !== '') {
            return res.status(200).json({ 
                success: true, 
                message: 'Quiz processed successfully (filtered).' 
            });
        }

        // 3. User consent verification
        if (consent !== true && consent !== 'true') {
            return res.status(400).json({ 
                success: false, 
                error: 'Consent to the secure Privacy Policy is required to capture diagnostic results.' 
            });
        }

        // 4. Server-Side Email Validation
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'A valid email address is required to lock in your diagnostic code.' 
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide a valid email format.' 
            });
        }

        // 5. Symmetric AES-256 Encryption at Rest (GDPR compliance)
        const cryptoKeyRaw = process.env.SUBSCRIBE_CRYPTO_KEY || LOCAL_DEV_KEY;
        const key = crypto.createHash('sha256').update(cryptoKeyRaw).digest();
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(cleanEmail, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const diagnosticId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex');
        
        // 6. Rule-Based Diagnostic Profile Calculator (Option A)
        let primaryCoach = 'Aria (Empathetic Catalyst)';
        let secondaryCoach = 'Aeron (Pragmatic Challenger)';
        let primaryDescription = 'Focuses on compassionate reflection, stress-reframing, and cognitive-behavioral restructuring to relieve executive fatigue.';
        let secondaryDescription = 'Focuses on structured metrics, strict accountability tracking, and cognitive friction mitigation.';
        
        // Coach Toggle logic based on Q4 preference
        if (parseInt(q4) === 2) {
            primaryCoach = 'Aeron (Pragmatic Challenger)';
            secondaryCoach = 'Aria (Empathetic Catalyst)';
            primaryDescription = 'Focuses on structured metrics, strict accountability tracking, and cognitive friction mitigation.';
            secondaryDescription = 'Focuses on compassionate reflection, stress-reframing, and cognitive-behavioral restructuring.';
        }

        // Focus suscetibility level based on Q1
        let fatigueTier = 'Moderate Procrastination Vulnerability';
        let customToolTip = 'We recommend setting up daily gentle check-ins to prevent doomscrolling loops.';
        if (parseInt(q1) >= 3) {
            fatigueTier = 'Critical Executive Focus Freeze';
            customToolTip = 'Highly vulnerable to algorithmic attention traps. The ADHD SOS circular countdown widget is critical for your recovery.';
        }

        // Shame loop susceptibility based on Q3
        let shameTriggerStatus = 'Resilient Recovery Profile';
        let streakStrategy = 'Standard active daily check-in streak mode.';
        if (parseInt(q3) === 2) {
            shameTriggerStatus = 'High Shame Loop Trigger Susceptibility';
            streakStrategy = 'Prone to anxiety-driven avoidance after missing targets. The Compassionate Streak Freeze is recommended to preserve momentum.';
        }

        const diagnosticRecord = {
            id: diagnosticId,
            iv: iv.toString('hex'),
            encryptedEmail: encrypted,
            scores: { q1, q2, q3, q4, q5 },
            archetype: {
                primaryCoach,
                secondaryCoach,
                fatigueTier,
                shameTriggerStatus
            },
            timestamp: new Date().toISOString()
        };

        // 7. Persist to Vercel KV Edge Redis if active
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            try {
                const { createClient } = require('@vercel/kv');
                const kv = createClient({
                    url: process.env.KV_REST_API_URL,
                    token: process.env.KV_REST_API_TOKEN,
                });
                await kv.set(`diagnostic:${diagnosticId}`, diagnosticRecord);
                // Also log email to subscription database so they get registered!
                await kv.set(`subscribe:quiz:${diagnosticId}`, {
                    id: diagnosticId,
                    iv: iv.toString('hex'),
                    encryptedData: encrypted,
                    timestamp: diagnosticRecord.timestamp
                });
            } catch (kvError) {
                console.error('❌ Vercel KV Quiz writing error:', kvError);
            }
        }

        // 8. Return customized preview profiles
        return res.status(200).json({
            success: true,
            diagnosticId: diagnosticId,
            primaryCoach: primaryCoach,
            primaryDescription: primaryDescription,
            secondaryCoach: secondaryCoach,
            secondaryDescription: secondaryDescription,
            fatigueTier: fatigueTier,
            customTool: customToolTip,
            shameTrigger: shameTriggerStatus,
            streakStrategy: streakStrategy
        });

    } catch (error) {
        console.error('💥 Crash in diagnostic quiz API:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'An internal validation or database fault occurred.' 
        });
    }
};
