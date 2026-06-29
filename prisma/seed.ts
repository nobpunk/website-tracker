import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "trader@example.com" },
    update: {},
    create: {
      id: "seed_user_1",
      name: "Seed Trader",
      email: "trader@example.com",
    },
  });

  await prisma.watchlist.upsert({
    where: {
      userId_symbol: {
        userId: user.id,
        symbol: "BTCUSDT",
      },
    },
    update: {},
    create: {
      userId: user.id,
      symbol: "BTCUSDT",
      name: "Bitcoin",
    },
  });

  await prisma.watchlist.upsert({
    where: {
      userId_symbol: {
        userId: user.id,
        symbol: "ETHUSDT",
      },
    },
    update: {},
    create: {
      userId: user.id,
      symbol: "ETHUSDT",
      name: "Ethereum",
    },
  });

  console.log("Seeding complete! Seeded user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
