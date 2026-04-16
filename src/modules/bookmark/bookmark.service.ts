import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";

const addBookmark = async (requester: AuthUser, tuitionId: string) => {
  // 1. Check tuition exists
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId },
  });

  if (!tuition) {
    throw new Error("Tuition not found");
  }

  // 2. Prevent duplicate (optional, DB already handles)
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_tuitionId: {
        userId: requester.id,
        tuitionId,
      },
    },
  });

  if (existing) {
    throw new Error("Already bookmarked");
  }

  // 3. Create bookmark
  const bookmark = await prisma.bookmark.create({
    data: {
      userId: requester.id,
      tuitionId,
    },
  });

  return bookmark;
};

const removeBookmark = async (requester: AuthUser, tuitionId: string) => {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_tuitionId: {
        userId: requester.id,
        tuitionId,
      },
    },
  });

  if (!bookmark) {
    throw new Error("Bookmark not found");
  }

  await prisma.bookmark.delete({
    where: {
      userId_tuitionId: {
        userId: requester.id,
        tuitionId,
      },
    },
  });

  return { tuitionId };
};

const getMyBookmarks = async (
  requester: AuthUser,
  query: { page?: any; limit?: any }
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: requester.id,
    },
    orderBy: {
      createdAt: "desc", // ⚠️ we need this field (see note below)
    },
    skip,
    take: limit,
    include: {
      tuition: {
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              photo: true,
              subscriptionType: true,
              subscriptionRole: true,
            },
          },
        },
      },
    },
  });

  // Format like feed
  const result = bookmarks.map((b) => ({
    id: b.id,

    tuition: {
      id: b.tuition.id,
      title: b.tuition.title,
      description: b.tuition.description,
      subject: b.tuition.subject,
      classLevel: b.tuition.classLevel,
      salary: b.tuition.salary,
      location: b.tuition.location,
      daysPerWeek: b.tuition.daysPerWeek,
      timeSlot: b.tuition.timeSlot,
      status: b.tuition.status,
      createdAt: b.tuition.createdAt,

      parent: b.tuition.parent,
    },
  }));

  return {
    meta: {
      page,
      limit,
      count: result.length,
    },
    data: result,
  };
};

export const BookmarkService = {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
};
