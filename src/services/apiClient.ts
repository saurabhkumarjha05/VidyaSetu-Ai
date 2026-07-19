export function getAuthHeaders(): Record<string, string> {
  const sessionStr = localStorage.getItem("vidyasetu_session");
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session.user) {
        headers["x-school-code"] = session.user.schoolCode || "";
        headers["x-user-role"] = session.user.role || "";
        headers["x-user-id"] = session.user.id || "";
      }
    } catch (err) {
      console.error("Failed to parse auth session headers:", err);
    }
  }
  return headers;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // Ignored
    }
    throw new Error(errorJson?.error || errorJson?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
