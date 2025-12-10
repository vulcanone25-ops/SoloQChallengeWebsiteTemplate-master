import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: "Missing Riot API key" }, { status: 500 });

  const gameName = req.nextUrl.searchParams.get("gameName");
  const tagLine = req.nextUrl.searchParams.get("tagLine");

  if (!gameName || !tagLine)
    return NextResponse.json({ error: "Missing gameName or tagLine" }, { status: 400 });

  const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

  try {
    const resp = await fetch(url, {
      headers: { "X-Riot-Token": apiKey },
      cache: "no-store"
    });

    // Success
    if (resp.status === 200) return NextResponse.json(await resp.json());

    // Errors matching your Python version
    if (resp.status === 404)
      return NextResponse.json({ error: "Player not found (404)" }, { status: 404 });

    if (resp.status === 401)
      return NextResponse.json({ error: "Invalid API key (401)" }, { status: 401 });

    if (resp.status === 429)
      return NextResponse.json({ error: "Too many requests (429)" }, { status: 429 });

    return NextResponse.json(
      { error: `Riot API error ${resp.status}` },
      { status: resp.status }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Network error contacting Riot API", details: String(e) },
      { status: 500 }
    );
  }
}
