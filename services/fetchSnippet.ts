import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let query = supabase.from("codeversion").select("*").eq("entity_id", entityId);

  if (version !== undefined) {
    // Fetch specific version
    query = query.eq("version", version);
  } else {
    // Fetch latest version
    query = query.order("version", { ascending: false }).limit(1);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching snippet:", error);
    return null;
  }

  return data;
}

export { fetchSnippet };
