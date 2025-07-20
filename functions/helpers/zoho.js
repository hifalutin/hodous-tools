// helpers/zoho.js

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client_id = process.env.ZOHO_CLIENT_ID;
const client_secret = process.env.ZOHO_CLIENT_SECRET;
const refresh_token = process.env.ZOHO_REFRESH_TOKEN;

export const getFreshAccessToken = async () => {
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
export const handleZohoRequestWithRetry = async (requestFn) => {
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

/**
 * Paginates an array of items
 * @param {Array} items - The full array of items to paginate
 * @param {number} page - Current page number (1-based)
 * @param {number} limit - Number of items per page
 * @returns {Object} An object with paginated items and pagination metadata
 */
export const paginate = (items, page = 1, limit = 10) => {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = page * limit;
  const paginatedItems = items.slice(start, end);

  return {
    items: paginatedItems,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};
