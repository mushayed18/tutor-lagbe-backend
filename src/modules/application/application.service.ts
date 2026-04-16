import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";

const applyToTuition = async (
  requester: AuthUser,
  tuitionId: string
) => {
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

  return application;
};

export const ApplicationService = {
  applyToTuition,
};