"use server";

import { cookies } from "next/headers";
import { fetchSnippet } from "./fetchSnippet";
import { createClient } from "@/utils/supabase/server";

async function addSnippet(
  entityId: string,
  snippet: string
): Promise<{
  id: string;
  entity_id: string;
  version: number;
  snippet: string;
  created_at: string;
} | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Check if this entityId exists in the database
  const latestSnippet = await fetchSnippet(entityId);

  // If entityId doesn't exist, create first version (version 1)
  // If it exists, increment to next version
  const nextVersion = latestSnippet ? latestSnippet.version + 1 : 1;

  // Insert new version
  const { data, error } = await supabase
    .from("codeversion")
    .insert({
      entity_id: entityId,
      version: nextVersion,
      snippet: snippet,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding snippet:", error);
    return null;
  }

  return data;
}

export { fetchSnippet, addSnippet };
