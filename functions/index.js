/**
 * Import function triggers from their respective submodules:
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require('firebase-functions');
const { onRequest } = require('firebase-functions/https');
const logger = require('firebase-functions/logger');
const axios = require('axios');
require('dotenv').config();
const { handleZohoRequestWithRetry } = require('./helpers/zoho');

const org_id = process.env.ZOHO_ORG_ID;

setGlobalOptions({ maxInstances: 10 });

exports.getZohoContacts = onRequest(async (req, res) => {
  try {
    const data = await handleZohoRequestWithRetry(async (accessToken) => {
      const response = await axios.get(
        `https://www.zohoapis.com/books/v3/contacts?organization_id=${org_id}`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );
      return response.data;
    });

    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    console.error('Zoho API error:', errMsg);
    res.status(500).send({
      success: false,
      error: errMsg,
    });
  }
});

exports.getZohoCustomers = onRequest(async (req, res) => {
  try {
    const data = await handleZohoRequestWithRetry(async (accessToken) => {
      const response = await axios.get(
        `https://www.zohoapis.com/books/v3/customers?organization_id=${org_id}`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );
      return response.data;
    });

    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    console.error('Zoho API error:', errMsg);
    res.status(500).send({
      success: false,
      error: errMsg,
    });
  }
});

exports.getZohoProjects = onRequest(async (req, res) => {
  try {
    const data = await handleZohoRequestWithRetry(async (accessToken) => {
      const response = await axios.get(
        `https://www.zohoapis.com/books/v3/projects?organization_id=${org_id}`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );
      return response.data;
    });

    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    console.error('Zoho API error:', errMsg);
    res.status(500).send({
      success: false,
      error: errMsg,
    });
  }
});

// Post Functions
exports.createZohoProject = onRequest(async (req, res) => {
  const { project_name, customer_id, billing_type, rate } = req.body;

  if (!project_name || !customer_id || !billing_type || !rate) {
    return res.status(400).send({
      success: false,
      error:
        'Missing required fields: project_name, project_type, customer_id, billing_type, rate',
    });
  }

  try {
    const data = await handleZohoRequestWithRetry(async (accessToken) => {
      const response = await axios.post(
        `https://www.zohoapis.com/books/v3/projects?organization_id=${process.env.ZOHO_ORG_ID}`,
        {
          project_name,
          customer_id,
          billing_type,
          rate,
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    });

    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    console.error('Create project error:', errMsg);
    res.status(500).send({
      success: false,
      error: errMsg,
    });
  }
});
