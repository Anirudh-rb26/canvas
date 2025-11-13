// CLIENT-SIDE ONLY - calls API routes via fetch

async function fetchSnippet(
  entityId: string,
  version?: number
): Promise<{
  id: string;
  entity_id: string;
  version: number;
  snippet: string;
  created_at: string;
} | null> {
  try {
    const url = version
      ? `/api/snippets?entityId=${entityId}&version=${version}`
      : `/api/snippets?entityId=${entityId}`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return null;
  }
}

async function addSnippet(
  entityId: string,
  snippet: string
): Promise<{ success: boolean; version?: number; error?: string }> {
  try {
    const response = await fetch("/api/snippets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entityId, snippet }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error };
    }

    const data = await response.json();
    return { success: true, version: data.version };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function getAllVersions(entityId: string): Promise<number[]> {
  try {
    const response = await fetch(`/api/snippets/versions?entityId=${entityId}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.versions || [];
  } catch (error) {
    return [];
  }
}

export { fetchSnippet, addSnippet, getAllVersions };
