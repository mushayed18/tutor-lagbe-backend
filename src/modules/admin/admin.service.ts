import { prisma } from "../../lib/prisma";

const getUsers = async (query: { page?: any; limit?: any }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  // total count (for pagination UI)
  const total = await prisma.user.count();

  // fetch users
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isBanned: true,
      isVerified: true,
      createdAt: true,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: users.length,
    },
    data: users,
  };
};

const getSingleUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isBanned: true,
      isVerified: true,
      subscriptionType: true,
      subscriptionExpiresAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const AdminService = {
  getUsers,
  getSingleUser,
};