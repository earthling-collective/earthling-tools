import type { NextRequest } from "next/server";
import { renderOg } from "@/lib/og";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return renderOg({
    title: params.get("title")?.slice(0, 80) || "Earthling Tools",
    description: params.get("description")?.slice(0, 160) || undefined,
  });
}
