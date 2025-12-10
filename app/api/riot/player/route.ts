import { NextResponse } from "next/server";
import players from "@/data/players.json"; // Import JSON statique

export async function GET() {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Riot API key" },
      { status: 500 }
    );
  }

  const tierOrder = [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
    "MASTER",
    "GRANDMASTER",
    "CHALLENGER",
  ];
  const rankValueMap: Record<string, number> = {
    "I": 300,
    "II": 200,
    "III": 100,
    "IV": 0,
    "": 0,
  };

  const results = [];

  for (const p of players) {
    try {
      // 1) Get account (puuid)
      const accResp = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${p.gameName}/${p.tagLine}`,
        {
          headers: { "X-Riot-Token": apiKey },
          cache: "no-store",
        }
      );

      if (accResp.status !== 200) {
        results.push({
          gameName: p.gameName,
          tagLine: p.tagLine,
          champion: p.champion,
          lp_base: p.lp_base,
          error: "Account not found",
        });
        continue;
      }

      const account = await accResp.json();
      const puuid = account.puuid;

      // 2) Get rank by puuid
      const rankResp = await fetch(
        `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
        {
          headers: { "X-Riot-Token": apiKey },
          cache: "no-store",
        }
      );

      const rankData = rankResp.status === 200 ? await rankResp.json() : [];

      const solo = rankData.find((x: any) => x.queueType === "RANKED_SOLO_5x5");

      const tier = solo?.tier ?? "UNRANKED";
      const rank = solo?.rank ?? "";
      const lp = solo?.leaguePoints ?? 0;
      const wins = solo?.wins ?? 0;
      const losses = solo?.losses ?? 0;

      // 0-based tier index: IRON=0 ... CHALLENGER=9; UNRANKED -> 0
      const tierIdx = tierOrder.indexOf(tier.toUpperCase());
      const tierValue = tierIdx >= 0 ? tierIdx : 0;

      const rankValue = rankValueMap[rank] ?? 0;

      // Logique:
      // - Jusqu'à DIAMOND inclus: Tier*400 + Rank*100 + LP
      // - À partir de MASTER et au-delà: on garde le palier MASTER (cap),
      //   on ignore les divisions (Rank*100), et on additionne uniquement les LP.
      const masterIdx = tierOrder.indexOf("MASTER"); // 7
      const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier.toUpperCase());
      const cappedTierValue = Math.min(tierValue, masterIdx);
      const appliedRankValue = isMasterPlus ? 0 : rankValue;
      const apiTotalLP = cappedTierValue * 400 + appliedRankValue + lp;

      const lp_base = typeof p.lp_base === "number" ? p.lp_base : 0;
      const lpDiff = apiTotalLP - lp_base;

      results.push({
        gameName: p.gameName,
        tagLine: p.tagLine,
        champion: p.champion,
        icon: account.profileIconId,
        level: account.summonerLevel,
        tier,
        rank,
        lp,
        wins,
        losses,
        winrate: solo ? Math.round((wins / (wins + losses)) * 100) : 0,
        lp_base,
        lpDiff,
      });

    } catch (e) {
      results.push({
        gameName: p.gameName,
        tagLine: p.tagLine,
        champion: p.champion,
        lp_base: p.lp_base,
        error: "Error fetching Riot API",
      });
    }
  }

  return NextResponse.json(results);
}
