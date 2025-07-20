import invoicesData from './data/test-data/invoices-data';

export async function getZohoInvoices(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `http://127.0.0.1:5001/hodous-tools/us-central1/getZohoInvoices?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    const json = await response.json();
    return { isTestData: false, data: json };
  } catch (error) {
    console.warn(
      'Falling back to test invoice data due to error:',
      error.message
    );
    // Apply limit to fallback test data
    const start = (page - 1) * limit;
    const end = start + limit;
    const limitedData = {
      invoices: invoicesData.invoices.slice(start, end),
    };
    return { isTestData: true, data: limitedData };
  }
}
