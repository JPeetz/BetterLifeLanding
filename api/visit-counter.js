module.exports = async (req, res) => {
    // Allow GET requests only
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method Not Allowed' 
        });
    }

    try {
        let visitCount = 10523; // High-status base visit count fallback

        // Connect to Vercel KV edge database if configured
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            try {
                const { createClient } = require('@vercel/kv');
                const kv = createClient({
                    url: process.env.KV_REST_API_URL,
                    token: process.env.KV_REST_API_TOKEN,
                });
                // Atomic increment of the page_visits key in Vercel KV Redis
                visitCount = await kv.incr('page_visits');
            } catch (kvError) {
                console.error('❌ Vercel KV Counter Error:', kvError);
            }
        } else {
            // Dev in-memory session counter simulator
            if (!global.devVisitCount) {
                global.devVisitCount = 10523;
            }
            global.devVisitCount += 1;
            visitCount = global.devVisitCount;
        }

        // Return counter response
        return res.status(200).json({ 
            success: true, 
            count: visitCount 
        });

    } catch (error) {
        console.error('💥 Crash in visit-counter API handler:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'An internal counter database error occurred.' 
        });
    }
};
