// netlify/functions/perplexity-search.js

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse the request body
        const { query, systemPrompt } = JSON.parse(event.body);

        if (!query) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Query is required' })
            };
        }

        // API key is stored securely in Netlify environment variables
        const API_KEY = process.env.PERPLEXITY_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        // Make request to Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt || 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                search_domain_filter: ['idriesshahfoundation.org'],
                temperature: 0.7,
                max_tokens: 2000,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorData.error?.message || 'API request failed' })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Adjust for production
            },
            body: JSON.stringify({
                content: data.choices[0].message.content,
                usage: data.usage
            })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
