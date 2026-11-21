import { NextResponse, type NextRequest } from "next/server";

// "/" → "/it" or "/en", based on the browser's Accept-Language header.
export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase())
    .find((code) => code === "it" || code === "en");

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred ?? "it"}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: "/" };
