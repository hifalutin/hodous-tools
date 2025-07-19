import { setGlobalOptions } from 'firebase-functions';
import logger from 'firebase-functions/logger';
import axios from 'axios';
import dotenv from 'dotenv';
import { handleZohoRequestWithRetry } from './helpers/zoho.js';
import { onRequest } from 'firebase-functions/v2/https';

dotenv.config();

const org_id = process.env.ZOHO_ORG_ID;
setGlobalOptions({ maxInstances: 10 });

export const getZohoContacts = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const response = await axios.get(
          `https://www.zohoapis.com/books/v3/contacts?organization_id=${org_id}&per_page=10`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        );
        return response.data;
      });

      res.status(200).send({ success: true, data });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Zoho API error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const getZohoCustomers = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const response = await axios.get(
          `https://www.zohoapis.com/books/v3/customers?organization_id=${org_id}&per_page=10`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        );
        return response.data;
      });

      res.status(200).send({ success: true, data });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Zoho API error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const getZohoProjects = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const response = await axios.get(
          `https://www.zohoapis.com/books/v3/projects?organization_id=${org_id}&per_page=10`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        );
        return response.data;
      });

      res.status(200).send({ success: true, data });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Zoho API error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const createZohoProject = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    const { project_name, billing_type, rate } = req.body;

    if (!project_name || !billing_type || !rate) {
      return res.status(400).send({
        success: false,
        error: 'Missing required fields: project_name, billing_type, rate',
      });
    }

    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const response = await axios.post(
          `https://www.zohoapis.com/books/v3/projects?organization_id=${org_id}`,
          {
            project_name,
            customer_id: process.env.ZOHO_HODOUS_CUSTOMER_ID,
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

      res.status(200).send({ success: true, data });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Create project error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const deleteZohoProject = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).send({
        success: false,
        error: 'Missing required field: project_id',
      });
    }

    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const response = await axios.delete(
          `https://www.zohoapis.com/books/v3/projects/${project_id}?organization_id=${org_id}`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        );
        return response.data;
      });

      res.status(200).send({ success: true, data });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Delete project error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const getZohoInvoices = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const response = await axios.get(
          `https://www.zohoapis.com/books/v3/invoices?organization_id=${org_id}&per_page=10`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        );
        return response.data;
      });

      res.status(200).send({ success: true, data });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Zoho API error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);
