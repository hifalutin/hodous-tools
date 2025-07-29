const fetch = require('node-fetch');

async function getZohoUsage() {
  try {
    const response = await fetch(
      'https://us-central1-hodous-tools.cloudfunctions.net/getZohoUsage'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from cloud function');
    }

    const data = await response.json();

    return {
      used: data.used,
      limit: data.limit,
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = { getZohoUsage };
