export async function deleteZohoProject(projectId) {
  try {
    const response = await fetch(
      `http://127.0.0.1:5001/hodous-tools/us-central1/deleteZohoProject?id=${projectId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Zoho Delete Error:', error);
    throw error;
  }
}
