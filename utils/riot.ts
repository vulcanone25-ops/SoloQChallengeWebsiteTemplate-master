export async function fetchAccount(gameName: string, tagLine: string) {
  const url = `/api/riot/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`;

  const resp = await fetch(url);
  const data = await resp.json();

  if (!resp.ok) throw new Error(data.error || "Failed to fetch account");

  return data; // { puuid, gameName, tagLine, ... }
}

export async function fetchRank(puuid: string) {
  const url = `/api/riot/rank?puuid=${encodeURIComponent(puuid)}`;

  const resp = await fetch(url);
  const data = await resp.json();

  if (!resp.ok) throw new Error(data.error || "Failed to fetch rank");

  return data; // Riot rank array
}
