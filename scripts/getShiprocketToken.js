require('dotenv').config({ path: '.env.local' }); // Specify the correct env file
const https = require('https');

async function getToken() {
    // Verify environment variables are loaded
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
        throw new Error('Missing Shiprocket credentials in .env.local file');
    }

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        });

        const options = {
            hostname: 'apiv2.shiprocket.in',
            path: '/v1/external/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    
                    if (res.statusCode !== 200) {
                        console.error('API Error:', parsedData);
                        reject(new Error(parsedData.message || 'Failed to get token'));
                        return;
                    }

                    if (!parsedData.token) {
                        console.error('Invalid response:', parsedData);
                        reject(new Error('Token not found in response'));
                        return;
                    }

                    console.log('Your Shiprocket Token:', parsedData.token);
                    resolve(parsedData.token);
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Network Error:', error);
            reject(error);
        });

        // Log request data for debugging
        console.log('Sending request with credentials:', {
            email: process.env.SHIPROCKET_EMAIL,
            passwordLength: process.env.SHIPROCKET_PASSWORD?.length || 0
        });

        req.write(data);
        req.end();
    });
}

getToken()
    .then(token => {
        if (token) {
            console.log('Successfully retrieved token');
        }
    })
    .catch(error => {
        console.error('Failed to get token:', error.message);
        process.exit(1);
    });