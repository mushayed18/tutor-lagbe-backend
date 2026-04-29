import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";

const applyToTuition = async (requester: AuthUser, tuitionId: string) => {
  // 1. Check tuition exists
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId },
  });

  if (!tuition) {
    throw new Error("Tuition not found");
  }

  // 2. Prevent applying to own tuition
  if (tuition.parentId === requester.id) {
    throw new Error("You cannot apply to your own tuition");
  }

  // 3. Prevent applying to CLOSED tuition
  if (tuition.status === "CLOSED") {
    throw new Error("This tuition is no longer available");
  }

  // 4. Prevent duplicate apply (extra safety)
  const existing = await prisma.application.findUnique({
    where: {
      tuitionId_tutorId: {
        tuitionId,
        tutorId: requester.id,
      },
    },
  });

  if (existing) {
    throw new Error("You have already applied to this tuition");
  }

  // 5. Create application
  const application = await prisma.application.create({
    data: {
      tuitionId,
      tutorId: requester.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: tuition.parentId,
      tuitionId: tuition.id,
      title: "New Application",
      message: "A tutor applied to your tuition",
      type: "APPLY",
    },
  });

  return application;
};

const getMyApplications = async (
  requester: AuthUser,
  query: { page?: any; limit?: any },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const applications = await prisma.application.findMany({
    where: {
      tutorId: requester.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    include: {
      tuition: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const result = applications.map((app) => ({
    id: app.id,
    tuitionId: app.tuitionId,
    tuitionTitle: app.tuition.title,
    status: app.status,
    createdAt: app.createdAt,
  }));

  const total = await prisma.application.count({
    where: {
      tutorId: requester.id,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: result.length,
    },
    data: result,
  };
};

const getApplicationsForTuition = async (
  requester: AuthUser,
  tuitionId: string,
  query: { page?: string; limit?: string },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  // 1. Check ownership
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId },
  });

  if (!tuition) {
    throw new Error("Tuition not found");
  }

  if (tuition.parentId !== requester.id) {
    throw new Error("Not authorized");
  }

  // 2. Get total count (🔥 IMPORTANT)
  const total = await prisma.application.count({
    where: { tuitionId },
  });

  // 3. Get paginated data
  const applications = await prisma.application.findMany({
    where: { tuitionId },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tutor: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },
  });

  // 4. Format
  const result = applications.map((app) => ({
    applicationId: app.id,
    tutorId: app.tutor.id,
    name: app.tutor.name,
    photo: app.tutor.photo,
    status: app.status,
  }));

  return {
    meta: {
      page,
      limit,
      total, //  total applications
      totalPages: Math.ceil(total / limit),
      count: result.length, // current page count
    },
    data: result,
  };
};

const updateApplicationStatus = async (
  requester: AuthUser,
  applicationId: string,
  status: "HIRED" | "REJECTED",
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Get application
    const application = await tx.application.findUnique({
      where: { id: applicationId },
      include: { tuition: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    // 2. Ownership check
    if (application.tuition.parentId !== requester.id) {
      throw new Error("Not authorized");
    }

    // 3. Prevent re-hiring
    const existingHire = await tx.hireRelation.findFirst({
      where: { tuitionId: application.tuitionId },
    });

    if (existingHire) {
      throw new Error("Tutor already hired for this tuition");
    }

    // 4. If REJECT → simple update
    if (status === "REJECTED") {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { status: "REJECTED" },
      });

      await tx.notification.create({
        data: {
          userId: application.tutorId,
          tuitionId: application.tuitionId,
          title: "Application Rejected",
          message: "Your application was rejected",
          type: "REJECTED",
        },
      });

      return updated;
    }

    // 5. If HIRED → full flow

    // 5.1 Hire selected tutor
    await tx.application.update({
      where: { id: applicationId },
      data: { status: "HIRED" },
    });

    // 5.2 Reject others
    await tx.application.updateMany({
      where: {
        tuitionId: application.tuitionId,
        id: { not: applicationId },
      },
      data: { status: "REJECTED" },
    });

    // 5.3 Close tuition
    await tx.tuition.update({
      where: { id: application.tuitionId },
      data: { status: "CLOSED" },
    });

    // 5.4 Create hire relation
    await tx.hireRelation.create({
      data: {
        tutorId: application.tutorId,
        parentId: requester.id,
        tuitionId: application.tuitionId,
      },
    });

    await tx.notification.create({
      data: {
        userId: application.tutorId,
        tuitionId: application.tuitionId,

        title: "You are hired 🎉",
        message: "You have been selected for a tuition",
        type: "HIRED",
      },
    });

    const rejectedApplications = await tx.application.findMany({
      where: {
        tuitionId: application.tuitionId,
        id: { not: applicationId },
      },
      select: {
        tutorId: true,
      },
    });

    const rejectedTutorIds = rejectedApplications.map((app) => app.tutorId);

    await tx.notification.createMany({
      data: rejectedTutorIds.map((id) => ({
        userId: id,
        tuitionId: application.tuitionId,

        title: "Application Rejected",
        message: "Your application was rejected",
        type: "REJECTED",
      })),
    });

    return {
      message: "Tutor hired successfully",
      hiredTutorId: application.tutorId,
    };
  });
};

export const ApplicationService = {
  applyToTuition,
  getMyApplications,
  getApplicationsForTuition,
  updateApplicationStatus,
};
