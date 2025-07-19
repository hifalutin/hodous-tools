import invoicesData from './data/test-data/invoices-data';

export async function getZohoInvoices() {
  try {
    const response = await fetch(
      'http://127.0.0.1:5001/hodous-tools/us-central1/getZohoInvoices'
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
    return { isTestData: true, data: invoicesData };
  }
}
