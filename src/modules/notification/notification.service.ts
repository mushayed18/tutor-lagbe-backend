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
        isRead: true, // 1. UPDATE: Select this field
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

// 2. ADD NEW: Logic for the Navbar badge
const getUnreadCount = async (requester: AuthUser) => {
  const count = await prisma.notification.count({
    where: {
      userId: requester.id,
      isRead: false,
    },
  });
  return { unreadCount: count };
};

// 3. ADD NEW: Logic to clear the notifications
const markAllAsRead = async (requester: AuthUser) => {
  await prisma.notification.updateMany({
    where: {
      userId: requester.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
  return { success: true };
};

export const NotificationService = {
  getMyNotifications,
  getUnreadCount, // Export new
  markAllAsRead,  // Export new
};