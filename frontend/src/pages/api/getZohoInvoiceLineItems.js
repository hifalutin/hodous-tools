export const prerender = false;

export async function GET({ url }) {
  const invoiceId = url.searchParams.get('invoice_id');

  if (!invoiceId) {
    return new Response(JSON.stringify({ error: 'Missing invoice_id' }), {
      status: 400,
    });
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:5001/hodous-tools/us-central1/getZohoInvoiceLineItems?invoice_id=${invoiceId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloud Function error: ${errorText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500 }
    );
  }
}
