export async function createZohoProject(newProject) {
  const response = await fetch(
    'http://127.0.0.1:5001/hodous-tools/us-central1/createZohoProject',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject),
    }
  );

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }

  return await response.json();
}
