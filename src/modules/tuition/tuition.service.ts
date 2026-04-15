import { prisma } from "../../lib/prisma";

const createTuition = async (requester: any, payload: any) => {
  // requester = logged in user (from auth middleware)

  const tuition = await prisma.tuition.create({
    data: {
      parentId: requester.id,

      title: payload.title,
      description: payload.description,
      subject: payload.subject,
      classLevel: payload.classLevel,
      salary: payload.salary,
      location: payload.location,
      daysPerWeek: payload.daysPerWeek,
      timeSlot: payload.timeSlot,
    },
  });

  return tuition;
};

export const TuitionService = {
  createTuition,
};