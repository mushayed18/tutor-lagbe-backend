import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";

const getMyConnections = async (
  requester: AuthUser,
  query: { page?: any; limit?: any }
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  // 🎯 TUTOR → show parents
  if (requester.role === "TUTOR") {
    const [total, relations] = await Promise.all([
      prisma.hireRelation.count({
        where: { tutorId: requester.id },
      }),

      prisma.hireRelation.findMany({
        where: { tutorId: requester.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
        },
      }),
    ]);

    const data = relations.map((rel) => ({
      userId: rel.parent.id,
      name: rel.parent.name,
      photo: rel.parent.photo,
      tuitionId: rel.tuitionId, // optional but useful
    }));

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  // 🎯 PARENT → show tutors
  if (requester.role === "PARENT") {
    const [total, relations] = await Promise.all([
      prisma.hireRelation.count({
        where: { parentId: requester.id },
      }),

      prisma.hireRelation.findMany({
        where: { parentId: requester.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
        },
      }),
    ]);

    const data = relations.map((rel) => ({
      userId: rel.tutor.id,
      name: rel.tutor.name,
      photo: rel.tutor.photo,
      tuitionId: rel.tuitionId,
    }));

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  // ADMIN (optional)
  throw new Error("Invalid role");
};

export const HireRelationService = {
  getMyConnections,
};