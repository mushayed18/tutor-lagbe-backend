import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";
import { CreatePortfolioInput, UpdatePortfolioInput } from "./portfolio.validation";

const createPortfolio = async (
  requester: AuthUser,
  payload: CreatePortfolioInput
) => {
  // 1. Only tutor allowed
  if (requester.role !== "TUTOR") {
    throw new Error("Only tutors can create portfolio");
  }

  // 2. Prevent duplicate
  const existing = await prisma.tutorPortfolio.findUnique({
    where: { userId: requester.id },
  });

  if (existing) {
    throw new Error("Portfolio already exists");
  }

  // 3. Create
  const portfolio = await prisma.tutorPortfolio.create({
    data: {
      userId: requester.id,
      ...payload,
    },
  });

  return portfolio;
};

const updatePortfolio = async (
  requester: AuthUser,
  payload: UpdatePortfolioInput
) => {
  // 1. Only tutor
  if (requester.role !== "TUTOR") {
    throw new Error("Only tutors can update portfolio");
  }

  // 2. Check exists
  const existing = await prisma.tutorPortfolio.findUnique({
    where: { userId: requester.id },
  });

  if (!existing) {
    throw new Error("Portfolio not found");
  }

  // 3. Update
  const updated = await prisma.tutorPortfolio.update({
    where: { userId: requester.id },
    data: payload,
  });

  return updated;
};

const getMyPortfolio = async (requester: AuthUser) => {
  const portfolio = await prisma.tutorPortfolio.findUnique({
    where: { userId: requester.id },
  });

  return portfolio;
};

const getPortfolioByUserId = async (userId: string) => {
  const portfolio = await prisma.tutorPortfolio.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },
  });

  if (!portfolio) {
    return null; // clean response
  }

  return portfolio;
};

export const PortfolioService = {
  createPortfolio,
  updatePortfolio,
  getMyPortfolio,
  getPortfolioByUserId,
};