// Configuration for external API endpoint
// Set this to your backend API URL (e.g., "https://api.yourdomain.com" or "http://localhost:3001")
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.happypaws.com";

// Helper function to make API calls
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.statusText}`);
  }
  
  return data;
}

