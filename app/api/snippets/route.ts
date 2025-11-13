import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entityId = searchParams.get("entityId");
  const version = searchParams.get("version");

  if (!entityId) {
    return NextResponse.json({ error: "entityId required" }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase.from("codeversion").select("*").eq("entity_id", entityId);

  if (version) {
    query = query.eq("version", parseInt(version));
  } else {
    query = query.order("version", { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { entityId, snippet } = await request.json();

  if (!entityId || !snippet) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get latest version
  const { data: latestData } = await supabase
    .from("codeversion")
    .select("version")
    .eq("entity_id", entityId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const newVersion = (latestData?.version || 0) + 1;

  // Insert new version
  const { data, error } = await supabase
    .from("codeversion")
    .insert({ entity_id: entityId, version: newVersion, snippet })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ version: data.version });
}
