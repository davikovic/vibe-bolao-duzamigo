import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";
import db from "@/lib/db";

const FLAG_CODES: any = {
  // PT
  "México": "mx", "África do Sul": "za", "Coreia do Sul": "kr", "Tchéquia": "cz",
  "Canadá": "ca", "Bósnia e Herzegovina": "ba", "Catar": "qa", "Suíça": "ch",
  "Brasil": "br", "Marrocos": "ma", "Haiti": "ht", "Escócia": "gb-sct",
  "EUA": "us", "Paraguai": "py", "Austrália": "au", "Turquia": "tr",
  "Alemanha": "de", "Curaçao": "cw", "Costa do Marfim": "ci", "Equador": "ec",
  "Holanda": "nl", "Japão": "jp", "Suécia": "se", "Tunísia": "tn",
  "Bélgica": "be", "Egito": "eg", "Irã": "ir", "Nova Zelândia": "nz",
  "Espanha": "es", "Cabo Verde": "cv", "Arábia Saudita": "sa", "Uruguai": "uy",
  "França": "fr", "Senegal": "sn", "Iraque": "iq", "Noruega": "no",
  "Argentina": "ar", "Argélia": "dz", "Áustria": "at", "Jordânia": "jo",
  "Portugal": "pt", "RD Congo": "cd", "Uzbequistão": "uz", "Colômbia": "co",
  "Inglaterra": "gb-eng", "Croácia": "hr", "Gana": "gh", "Panamá": "pa",
  
  // EN fallbacks
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czech Republic": "cz",
  "Canada": "ca", "Bosnia and Herzegovina": "ba", "Qatar": "qa", "Switzerland": "ch",
  "Brazil": "br", "Morocco": "ma", "Scotland": "gb-sct", "United States": "us",
  "Paraguay": "py", "Australia": "au", "Turkey": "tr", "Germany": "de",
  "Curacao": "cw", "Ivory Coast": "ci", "Ecuador": "ec", "Netherlands": "nl",
  "Japan": "jp", "Sweden": "se", "Tunisia": "tn", "Belgium": "be",
  "Egypt": "eg", "Iran": "ir", "New Zealand": "nz", "Spain": "es",
  "Cape Verde": "cv", "Saudi Arabia": "sa", "Uruguay": "uy",
  "France": "fr", "Norway": "no",
  "Algeria": "dz", "Austria": "at", "Jordan": "jo",
  "DR Congo": "cd", "Uzbekistan": "uz", "Colombia": "co", "England": "gb-eng",
  "Croatia": "hr", "Ghana": "gh", "Panama": "pa", "Playoff Winner 2": "xx",
  "Iraq": "iq"
};

const getFlag = (team: string) => {
  const code = FLAG_CODES[team];
  if (!code || code === "xx") return "https://upload.wikimedia.org/wikipedia/commons/2/2f/Missing_flag.png";
  return `https://flagcdn.com/w80/${code}.png`;
};

const EN_TO_PT: any = {
  "Mexico": "México", "South Africa": "África do Sul", "South Korea": "Coreia do Sul", "Czech Republic": "Tchéquia",
  "Canada": "Canadá", "Bosnia and Herzegovina": "Bósnia e Herzegovina", "Qatar": "Catar", "Switzerland": "Suíça",
  "Brazil": "Brasil", "Morocco": "Marrocos", "Scotland": "Escócia", "United States": "EUA",
  "Paraguay": "Paraguai", "Australia": "Austrália", "Turkey": "Turquia", "Germany": "Alemanha",
  "Curacao": "Curaçao", "Ivory Coast": "Costa do Marfim", "Ecuador": "Equador", "Netherlands": "Holanda",
  "Japan": "Japão", "Sweden": "Suécia", "Tunisia": "Tunísia", "Belgium": "Bélgica",
  "Egypt": "Egito", "Iran": "Irã", "New Zealand": "Nova Zelândia", "Spain": "Espanha",
  "Cape Verde": "Cabo Verde", "Saudi Arabia": "Arábia Saudita", "Uruguay": "Uruguai",
  "France": "França", "Senegal": "Senegal", "Norway": "Noruega", "Argentina": "Argentina",
  "Algeria": "Argélia", "Austria": "Áustria", "Jordan": "Jordânia", "Portugal": "Portugal",
  "DR Congo": "RD Congo", "Uzbekistan": "Uzbequistão", "Colombia": "Colômbia", "England": "Inglaterra",
  "Croatia": "Croácia", "Ghana": "Gana", "Panama": "Panamá", "Playoff Winner 2": "Vencedor da Repescagem 2",
  "Iraq": "Iraque"
};

const translateTeam = (team: string) => EN_TO_PT[team] || team;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawData = fs.readFileSync(path.join(process.cwd(), "base-mock-jogos.js"), "utf-8");

    if (!rawData || rawData.trim() === "") {
      return NextResponse.json({ error: "O arquivo base-mock-jogos.js está vazio. Você salvou o arquivo (Ctrl+S) no seu editor?" }, { status: 400 });
    }

    let games = [];
    try {
      games = eval('(' + rawData + ')');
    } catch (parseError) {
      return NextResponse.json({ error: "Erro de sintaxe no base-mock-jogos.js. Verifique se o formato está correto." }, { status: 400 });
    }

    let rounds: any = {};
    const existingMatches = await db("matches").select("team_a", "team_b");

    const futureFallback = new Date();
    futureFallback.setDate(futureFallback.getDate() + 10);

    for (const game of games) {
      if (!game.round) continue;

      const roundName = `Rodada ${game.round}`;
      if (!rounds[roundName]) rounds[roundName] = [];

      const rawTeamA = game.homeTeam?.name || "Desconhecido";
      const rawTeamB = game.awayTeam?.name || "Desconhecido";
      const teamA = translateTeam(rawTeamA);
      const teamB = translateTeam(rawTeamB);

      const isNew = !existingMatches.some((m: any) => m.team_a === teamA && m.team_b === teamB);

      const locCity = game.location?.city || "";
      const locName = game.location?.name || "";
      const locationStr = [locCity, locName].filter(Boolean).join(" - ") || "A Definir";

      rounds[roundName].push({
        team_a: teamA,
        team_b: teamB,
        date: game.startDate || futureFallback.toISOString(),
        location: locationStr,
        team_a_flag: getFlag(rawTeamA),
        team_b_flag: getFlag(rawTeamB),
        group_name: roundName,
        isNew,
      });
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
      } else {
        await db("matches").where({ id: exists.id }).update({
          team_a_flag: match.team_a_flag,
          team_b_flag: match.team_b_flag,
          date: new Date(match.date),
          location: match.location
        });
      }
    }

    return NextResponse.json({ success: true, inserted: insertedCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
