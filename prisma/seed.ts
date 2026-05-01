import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

const seedAdmin = async () => {
  try {
    // 1. Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists. Skipping seed.");
      return;
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash("admin1234", 10);

    // 3. Create admin user
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        phone: "00000000000",
        role: "ADMIN",
        isVerified: true,
        isBanned: false,
      },
    });

    console.log("✅ Admin created successfully:", admin.email);
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();