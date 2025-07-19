import projectsData from './data/test-data/projects-data';

export async function getZohoProjects() {
  try {
    const response = await fetch(
      'http://127.0.0.1:5001/hodous-tools/us-central1/getZohoProjects'
    );
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    const json = await response.json();
    return { isTestData: false, data: json };
  } catch (error) {
    console.warn(
      'Falling back to test project data due to error:',
      error.message
    );
    return { isTestData: true, data: projectsData };
  }
}
