import { setGlobalOptions } from 'firebase-functions';
import axios from 'axios';
import dotenv from 'dotenv';
import { handleZohoRequestWithRetry } from './helpers/zoho.js';
import { logApiCall } from './helpers/api-usage-logger.js';
import { onRequest } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Set environment variables for Google Cloud authentication before Firebase Admin initialization
process.env.GOOGLE_CLOUD_PROJECT = 'hodous-tools';
if (process.env.FUNCTIONS_EMULATOR) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = `${process.env.HOME}/credentials/hodous-tools/service-account.json`;
}

const serviceAccount = JSON.parse(
  readFileSync(
    `${process.env.HOME}/credentials/hodous-tools/service-account.json`
  )
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

dotenv.config();

const org_id = process.env.ZOHO_ORG_ID;
setGlobalOptions({ maxInstances: 10 });

export const getZohoContacts = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const endpoint = `https://www.zohoapis.com/books/v3/contacts?organization_id=${org_id}`;
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        });
        await logApiCall({
          api: 'zoho',
          endpoint: `https://www.zohoapis.com/books/v3/contacts`,
          status: response.status,
          headers: response.headers,
        });
        return response.data;
      });
      const contacts = data.contacts || [];

      res.status(200).send({ success: true, data: { contacts } });
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
        const endpoint = `https://www.zohoapis.com/books/v3/customers?organization_id=${org_id}`;
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        });
        await logApiCall({
          api: 'zoho',
          endpoint: `https://www.zohoapis.com/books/v3/customers`,
          status: response.status,
          headers: response.headers,
        });
        return response.data;
      });
      const customers = data.customers || [];

      res.status(200).send({ success: true, data: { customers } });
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
        const endpoint = `https://www.zohoapis.com/books/v3/projects?organization_id=${org_id}`;
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        });
        await logApiCall({
          api: 'zoho',
          endpoint: `https://www.zohoapis.com/books/v3/projects`,
          status: response.status,
          headers: response.headers,
        });
        return response.data;
      });
      const projects = data.projects || [];

      res.status(200).send({ success: true, data: { projects } });
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
        const endpoint = `https://www.zohoapis.com/books/v3/projects?organization_id=${org_id}`;
        const response = await axios.post(
          endpoint,
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
        await logApiCall({
          api: 'zoho',
          endpoint: `https://www.zohoapis.com/books/v3/projects`,
          status: response.status,
          headers: response.headers,
        });
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
        const endpoint = `https://www.zohoapis.com/books/v3/projects/${project_id}?organization_id=${org_id}`;
        const response = await axios.delete(endpoint, {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        });
        await logApiCall({
          api: 'zoho',
          endpoint: `https://www.zohoapis.com/books/v3/projects/${project_id}`,
          status: response.status,
          headers: response.headers,
        });
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
        const endpoint = `https://www.zohoapis.com/books/v3/invoices?organization_id=${org_id}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        });
        await logApiCall({
          api: 'zoho',
          endpoint: `https://www.zohoapis.com/books/v3/invoices`,
          status: response.status,
          headers: response.headers,
        });
        return response.data;
      });
      const invoices = data.invoices || [];

      res.status(200).send({ success: true, data: { invoices } });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Zoho API error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const getZohoInvoiceLineItems = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    const { invoice_id } = req.query;
    if (!invoice_id) {
      return res
        .status(400)
        .send({ success: false, error: 'Missing invoice_id' });
    }

    try {
      const data = await handleZohoRequestWithRetry(async (accessToken) => {
        const endpoint = `https://www.zohoapis.com/books/v3/invoices/${invoice_id}?organization_id=${org_id}`;
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        });
        await logApiCall({
          api: 'zoho',
          endpoint: `https://www.zohoapis.com/books/v3/invoices/${invoice_id}`,
          status: response.status,
          headers: response.headers,
        });
        return response.data;
      });

      const line_items = data?.invoice?.line_items || [];
      res.status(200).send({ success: true, line_items });
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error('Zoho line items error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const getZohoApiUsage = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // e.g., '2025-07-26'
      const usageSnapshot = await db
        .collection('apiUsage')
        .doc('zoho')
        .collection(today)
        .get();
      const usageCount = usageSnapshot.size;

      res.status(200).send({
        success: true,
        data: {
          used: usageCount,
        },
      });
    } catch (error) {
      const errMsg = error.message;
      console.error('API usage fetch error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);

export const getZohoApiUsageSummary = onRequest(
  { allowInvalidAppCheckToken: true },
  async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // e.g., '2025-07-26'
      console.log('Looking for usage at:', `apiUsage/zoho/${today}`);
      const snapshot = await db
        .collection('apiUsage')
        .doc('zoho')
        .collection(today)
        .get();

      const usageCount = snapshot.size;

      let latestTimestamp = null;
      let latestPath = null;

      snapshot.forEach((doc) => {
        const docData = doc.data();
        const ts =
          typeof docData.timestamp === 'string'
            ? new Date(docData.timestamp)
            : docData.timestamp?.toDate?.();
        if (ts && (!latestTimestamp || ts > latestTimestamp)) {
          latestTimestamp = ts;
          latestPath = docData.endpoint || null;
        }
      });

      res.status(200).send({
        success: true,
        data: {
          usageCount,
          date: today,
          latestRequestTime: latestTimestamp,
          latestRequestPath: latestPath,
          dailyLimit: 5000,
        },
      });
    } catch (error) {
      const errMsg = error.message;
      console.error('API usage summary fetch error:', errMsg);
      res.status(500).send({ success: false, error: errMsg });
    }
  }
);
