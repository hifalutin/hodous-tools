const axios = require('axios');
require('dotenv').config();

const client_id = process.env.ZOHO_CLIENT_ID;
const client_secret = process.env.ZOHO_CLIENT_SECRET;
const refresh_token = process.env.ZOHO_REFRESH_TOKEN;

const getFreshAccessToken = async () => {
  const res = await axios.post(
    'https://accounts.zoho.com/oauth/v2/token',
    new URLSearchParams({
      refresh_token,
      client_id,
      client_secret,
      grant_type: 'refresh_token',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return res.data.access_token;
};

// ⛑ Error handler wrapper
const handleZohoRequestWithRetry = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await getFreshAccessToken();
      return await requestFn(newToken); // retry with new token
    }
    throw error;
  }
};

module.exports = {
  getFreshAccessToken,
  handleZohoRequestWithRetry,
};
