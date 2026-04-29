import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";

const getMyNotifications = async (
  requester: AuthUser,
  query: { page?: any; limit?: any }
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const [total, notifications] = await Promise.all([
    prisma.notification.count({
      where: { userId: requester.id },
    }),

    prisma.notification.findMany({
      where: { userId: requester.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        tuitionId: true, 
        createdAt: true,
      },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: notifications,
  };
};

export const NotificationService = {
  getMyNotifications,
};