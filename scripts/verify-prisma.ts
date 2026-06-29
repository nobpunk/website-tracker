import "dotenv/config";
import { prisma } from "../lib/prisma";

async function verify() {
  try {
    const user = await prisma.user.findFirst();
    console.log("✅ Connected");
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verify();
