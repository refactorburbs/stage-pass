import { PrismaClient, Prisma, UserRole } from "../app/generated/prisma";

const prisma = new PrismaClient();

// The first teams we're working with
const teamData: Prisma.TeamCreateInput[] = [
  { name: "Refactor Games" },
  { name: "Team From Earth" },
  { name: "Delphi" },
  { name: "Netflix" },
  { name: "FIFA" },
];

// The first game we're working on (Project Aragorn)
const gameData: Prisma.GameCreateInput[] = [
  {
    name: "Project Aragorn",
    assetCategories: [
      "Heads",
      "Cleats",
      "Clothing",
      "Tattoos",
      "Full Asset"
    ]
  }
];

export async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data for a fresh start every time you run this seed script
    await prisma.inviteCode.deleteMany();
    await prisma.gameTeam.deleteMany();
    await prisma.game.deleteMany();
    await prisma.team.deleteMany();
    console.log("🗑️  Cleared existing data");

    console.log("📁 Creating teams...");
    const createdTeams = [];
    for (const team of teamData) {
      const createdTeam = await prisma.team.create({ data: team });
      createdTeams.push(createdTeam);
      console.log(`✅ Created team: ${createdTeam.name} (ID: ${createdTeam.id})`);
    }

    console.log("🎮 Creating games...");
    const createdGames = [];
    for (const game of gameData) {
      const createdGame = await prisma.game.create({ data: game });
      createdGames.push(createdGame);
      console.log(`✅ Created game: ${createdGame.name} (ID: ${createdGame.id})`);
    }

    const refactorTeam = createdTeams.find(team => team.name === "Refactor Games");
    const tfeTeam = createdTeams.find(team => team.name === "Team From Earth");
    const delphiTeam = createdTeams.find(team => team.name === "Delphi");
    const netflixTeam = createdTeams.find(team => team.name === "Netflix");
    const fifaTeam = createdTeams.find(team => team.name === "FIFA");

    console.log("🔗 Creating team-game associations...");
    const gameTeamData =[
      { game_id: createdGames[0].id, team_id: refactorTeam!.id, startedAt: new Date("2024-11-03T00:00:00.000Z") }, // Nov 3, 2024
      { game_id: createdGames[0].id, team_id: tfeTeam!.id },
      { game_id: createdGames[0].id, team_id: delphiTeam!.id, startedAt: new Date("2025-04-01T00:00:00.000Z") }, // April 1, 2025
      { game_id: createdGames[0].id, team_id: netflixTeam!.id },
      { game_id: createdGames[0].id, team_id: fifaTeam!.id },
    ];

    for (const association of gameTeamData) {
      await prisma.gameTeam.create({
        data: association
      });
      const team = createdTeams.find(t => t.id === association.team_id);
      const game = createdGames.find(g => g.id === association.game_id);
      console.log(`   ✅ Associated team "${team?.name}" with "${game?.name}"`);
    }

    console.log("🎫 Creating invite codes...");
    const inviteCodeData = [
      {
        code: "YEQzbd", // could have all Refactor codes be 6 characters
        team_id: refactorTeam!.id,
        role: UserRole.LEAD,
        description: "Refactor Games LEAD role permissions",
        ownedGameIds: [] // Not an IP owner, just a lead
      },
      {
        code: "esXBsL",
        team_id: refactorTeam!.id,
        role: UserRole.ARTIST,
        description: "Refactor Games ARTIST role permissions",
        ownedGameIds: [] // Not an IP owner, just an uploader
      },
      {
        code: "PvBdzSLV", // Could have outsourcers be 8 characters
        team_id: tfeTeam!.id,
        role: UserRole.ARTIST,
        description: "Team From Earth ARTIST role permissions",
        ownedGameIds: [] // Not an IP owner, just an uploader
      },
      {
        code: "cQpiXHus",
        team_id: delphiTeam!.id,
        role: UserRole.VOTER,
        description: "Delphi Interactive VOTER role permissions",
        ownedGameIds: [] // Not an IP owner, just a regular voter
      },
      {
        code: "uBVDtolzLX", // Owners can have 10 characters
        team_id: netflixTeam!.id,
        role: UserRole.VOTER,
        description: "Netflix FINAL SAY VOTER for Project Aragorn",
        ownedGameIds: [createdGames[0].id]
      },
      {
        code: "xNUDyJvcbL",
        team_id: fifaTeam!.id,
        role: UserRole.VOTER,
        description: "FIFA FINAL SAY VOTER for Project Aragorn",
        ownedGameIds: [createdGames[0].id]
      },
    ];

    for (const inviteCode of inviteCodeData) {
      const createdCode = await prisma.inviteCode.create({
        data: inviteCode
      });
      const team = createdTeams.find(t => t.id === inviteCode.team_id);
      console.log(`   ✅ Created invite code: ${createdCode.code} for ${team?.name} (${inviteCode.role})`);
    }

    console.log("🎉 Database seeded successfully!");
    console.log("📋 Summary:");
    console.log(`   Teams: ${createdTeams.length}`);
    console.log(`   Games: ${createdGames.length}`);
    console.log(`   Invite Codes: ${inviteCodeData.length}`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();