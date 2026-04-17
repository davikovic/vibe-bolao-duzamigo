import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";
import db from "@/lib/db";

const FLAGS: any = {
  "México": "🇲🇽", "África do Sul": "🇿🇦", "Coreia do Sul": "🇰🇷", "Tchéquia": "🇨🇿",
  "Canadá": "🇨🇦", "Bósnia e Herzegovina": "🇧🇦", "Catar": "🇶🇦", "Suíça": "🇨🇭",
  "Brasil": "🇧🇷", "Marrocos": "🇲🇦", "Haiti": "🇭🇹", "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "EUA": "🇺🇸", "Paraguai": "🇵🇾", "Austrália": "🇦🇺", "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪", "Curaçao": "🇨🇼", "Costa do Marfim": "🇨🇮", "Equador": "🇪🇨",
  "Holanda": "🇳🇱", "Japão": "🇯🇵", "Suécia": "🇸🇪", "Tunísia": "🇹🇳",
  "Bélgica": "🇧🇪", "Egito": "🇪🇬", "Irã": "🇮🇷", "Nova Zelândia": "🇳🇿",
  "Espanha": "🇪🇸", "Cabo Verde": "🇨🇻", "Arábia Saudita": "🇸🇦", "Uruguai": "🇺🇾",
  "França": "🇫🇷", "Senegal": "🇸🇳", "Iraque": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argélia": "🇩🇿", "Áustria": "🇦🇹", "Jordânia": "🇯🇴",
  "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Uzbequistão": "🇺🇿", "Colômbia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croácia": "🇭🇷", "Gana": "🇬🇭", "Panamá": "🇵🇦"
};

const getFlag = (team: string) => FLAGS[team] || "🏳️";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawData = fs.readFileSync(path.join(process.cwd(), "base-mock-jogos.js"), "utf-8");
    const games = eval('(' + rawData + ')');

    let rounds: any = {};
    let currentRoundIndex = 1;
    let countInRound = 0;
    
    const existingMatches = await db("matches").select("team_a", "team_b");

    for (const game of games) {
      if (countInRound >= 12) {
        currentRoundIndex++;
        countInRound = 0;
      }
      const roundName = `Rodada ${currentRoundIndex}`;
      if (!rounds[roundName]) rounds[roundName] = [];
      
      const teamA = game.homeTeam.name;
      const teamB = game.awayTeam.name;
      
      const isNew = !existingMatches.some((m: any) => m.team_a === teamA && m.team_b === teamB);
      
      rounds[roundName].push({
        team_a: teamA,
        team_b: teamB,
        date: game.startDate,
        location: game.location.name,
        team_a_flag: getFlag(teamA),
        team_b_flag: getFlag(teamB),
        group_name: roundName,
        isNew,
      });
      
      countInRound++;
    }

    return NextResponse.json({ rounds });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to parse data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      const { matches } = await req.json();
      let insertedCount = 0;

      for (const match of matches) {
          const exists = await db("matches").where({
              team_a: match.team_a,
              team_b: match.team_b
          }).first();
          
          if (!exists) {
              await db("matches").insert({
                  team_a: match.team_a,
                  team_b: match.team_b,
                  date: new Date(match.date),
                  location: match.location,
                  team_a_flag: match.team_a_flag,
                  team_b_flag: match.team_b_flag,
                  group_name: match.group_name
              });
              insertedCount++;
          }
      }
  
      return NextResponse.json({ success: true, inserted: insertedCount });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
