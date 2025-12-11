"use client";

import { useEffect, useState } from "react";
import config from "@/data/config.json";

export default function Leaderboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    fetch("/api/riot/player", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        console.log("/api/riot/player payload", data);
        setPlayers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch players", err);
        setLoading(false);
      });
  }, []);

  // Countdown setup
  useEffect(() => {
    const end = new Date(config.endDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, end - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (diff === 0) {
        setTimeLeft("Challenge Terminé !");
      } else {
        setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);


const getTierColor = (tier?: string) => {
  switch ((tier ?? "").toLowerCase()) {
    case "challenger": return "bg-blue-500 text-white";
    case "grandmaster": return "bg-red-600 text-white";
    case "master": return "bg-purple-600 text-white";
    case "diamond": return "bg-indigo-500 text-white";
    case "emerald": return "bg-green-500 text-white";
    case "platinum": return "bg-teal-500 text-white";
    default: return "bg-gray-700 text-white";
  }
};
  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">DoggoQueue Challenge</h1>
        {/* Countdown Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl px-6 py-4 shadow-md w-[280px]">
          <div className="text-gray-300 text-xs">Fin dans</div>
          <div className="text-white text-lg font-semibold tracking-wide whitespace-nowrap">{timeLeft}</div>
        </div>
      </div>

      <button onClick={resetChallenge} className="bg-red-600 px-4 py-2 rounded text-white">Reset win lose </button>

      {/* Separator */}
      <div className="border-t border-gray-800 mb-6" />

      <div className="overflow-hidden rounded-xl border border-gray-800 shadow-xl w-full">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-4 bg-gray-900 border border-gray-700 rounded-xl px-6 py-4">
              <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="text-white font-medium">Comptage de tous ces LP… (ça en fait beaucoup)</span>
            </div>
          </div>
        ) : (
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              {/* Colonne splash intégrée au Player */}
              <th className="p-4 text-left w-[32%]">Player</th>
              {/* Nouvelle colonne Rank (position by lpDiff) */}
              <th className="p-4 text-center w-[2%]">Rank</th>
              {/* Rank (tier + LP) */}
              <th className="p-4 text-center w-[14%]">Solo Queue Rank</th>
              <th className="p-4 text-center w-[4%]">Δ LP</th>
              <th className="p-4 text-center w-[14%]">Winrate</th>
              <th className="p-4 text-center w-[4%]">DPM</th>
            </tr>
          </thead>

          <tbody className="bg-gray-950">
            {([...players]
              .sort((a: any, b: any) => Number(b.lpDiff || 0) - Number(a.lpDiff || 0))
            ).map((p: any, i) => (
              <tr
                key={i}
                className="relative border-b border-gray-800"
                style={{ height: "130px" }}
              >
                {/* Player: background splash limité à la cellule */}
                <td className="relative p-6 overflow-hidden">
                  {(() => {
                    const champ = (p.champion || "Aatrox").replace(/\s+/g, "");
                    const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ}_0.jpg`;
                    return (
                      <>
                        <img
                          src={splashUrl}
                          alt={`${champ} splash`}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            // Crop plus prononcé à gauche
                            transform: "scale(1.12) translateX(-40px)",
                            transformOrigin: "40% center",
                            objectPosition: "40% 15%",
                            filter: "brightness(0.9)",
                          }}
                          loading="lazy"
                        />
                        {/* Dégradé gauche -> droite */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.9) 14%, rgba(0,0,0,0.82) 24%, rgba(0,0,0,0.7) 34%, rgba(0,0,0,0.55) 44%, rgba(0,0,0,0.4) 52%, rgba(0,0,0,0.26) 60%, rgba(0,0,0,0.14) 68%, rgba(0,0,0,0.06) 74%, rgba(0,0,0,0.02) 80%, rgba(0,0,0,0) 88%, rgba(0,0,0,0) 100%)",
                          }}
                        />
                        {/* Dégradé droite -> gauche ajouté */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(270deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 10%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0) 40%)",
                          }}
                        />
                      </>
                    );
                  })()}
                  <div className="relative z-10">
                    {/* ...removed backdrop-blur-[3px]... */}
                    <div className="font-semibold text-white drop-shadow-md text-xl">
                      {p.gameName}
                    </div>
                    <div className="text-gray-300 text-sm drop-shadow-md">#{p.tagLine}</div>
                  </div>
                </td>


                  {/* Position Rank by lpDiff (descending) */}
                  <td className="relative p-6 text-center">
                    {(() => {
                      const base = "inline-flex items-center justify-center w-10 h-10 rounded-md font-semibold";
                      const bg = i === 0
                        ? "bg-yellow-500 text-black"
                        : i === 1
                        ? "bg-gray-300 text-black"
                        : i === 2
                        ? "bg-orange-500 text-black"
                        : "bg-gray-800 text-white";
                      return (
                        <span className={`${base} ${bg}`}>{i + 1}</span>
                      );
                    })()}
                  </td>

                {/* Rank (tier + LP) with medal for top lpDiff */}
                <td className="relative p-6 text-center">
                  <div className="inline-flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-md ${getTierColor(p.tier)} font-semibold`}>
                      {p.tier} {p.rank} {typeof p.lp === "number" ? `${p.lp}LP` : ""}
                    </span>
                  </div>
                </td>

                {/* Δ LP */}
                {/* Δ LP */}
                <td className="relative p-6 text-white text-center">
                  <div className="inline-flex items-center justify-center w-full">
                    {(() => {
                      const diff = Number(p.lpDiff);
                      if (isNaN(diff)) {
                        return <span className="text-gray-600 inline-block text-center">0</span>;
                      }
                      return (
                        <span className={(diff >= 0 ? "text-green-400" : "text-red-400") + " inline-block text-center"}>
                          {diff >= 0 ? "+" : ""}{diff}
                        </span>
                      );
                    })()}
                  </div>
                </td>

                {/* Winrate as semi-circle gauge */}
                <td className="relative p-6 text-center">
                  {(() => {
                    const wins = Number(p.wins || 0);
                    const losses = Number(p.losses || 0);
                    const matches = wins + losses;
                    const rate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
                    const radius = 40;
                    const circumference = Math.PI * radius; // semi-circle length
                    const offset = circumference * (1 - rate / 100);
                    
                    return (
                      <div className="inline-flex items-center justify-center">
                        <svg width="120" height="70" viewBox={`0 0 ${radius * 3} ${radius * 1.75}`}>
                          {/* Base red arc */}
                          <path
                            d={`M 20 ${radius+5} A ${radius} ${radius} 0 0 1 ${20 + 2*radius} ${radius+5}`}
                            stroke="#7f1d1d" strokeWidth="12" fill="none" strokeLinecap="round"
                          />
                          {/* Green progress arc */}
                          <path
                            d={`M 20 ${radius+5} A ${radius} ${radius} 0 0 1 ${20 + 2*radius} ${radius+5}`}
                            stroke="#16a34a" strokeWidth="12" fill="none" strokeLinecap="round"
                            style={{ strokeDasharray: `${circumference}px`, strokeDashoffset: `${offset}px` }}
                          />
                          {/* Percentage text */}
                          <text x="50%" y="60" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600">{rate}%</text>
                        </svg>
                        <div className="ml-4">
                          <div className="text-white font-semibold text-sm">{wins}W </div>
                          <div className="text-white font-semibold text-sm">{losses}L</div>
                          <div className="text-gray-400 text-xs">{matches} matchs</div>
                        </div>
                      </div>
                    );
                  })()}
                </td>

                {/* DPM link icon only */}
                <td className="relative p-6 text-center pr-6">
                  <a
                    href={`https://dpm.lol/${encodeURIComponent(p.gameName)}-${encodeURIComponent(p.tagLine)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300"
                    title="Voir sur dpm.lol"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z" />
                    </svg>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

