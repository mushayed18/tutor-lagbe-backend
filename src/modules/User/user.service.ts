import { prisma } from "../../lib/prisma";
import cloudinary from "../../utils/cloudinary";
import fs from "fs";

const updateProfile = async (userId: string, req: any) => {
  const { name, phone, location } = req.body;

  let photoUrl: string | undefined;

  // 🔥 1. If image exists → upload to cloudinary
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tutor-lagbe/users",
    });

    photoUrl = result.secure_url;

    // 🔥 2. delete local file
    fs.unlinkSync(req.file.path);
  }

  // 🔥 3. update data
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(photoUrl && { photo: photoUrl }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      photo: true,
      role: true,
    },
  });

  return updatedUser;
};

const getUserProfile = async (requester: any, targetUserId: string) => {
  // 1. Get target user
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photo: true,
      location: true,
      role: true,
      subscriptionType: true,
      subscriptionRole: true,
      subscriptionExpiresAt: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      password: false, // explicit safety

      reviewsReceived: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: {
            select: {
              id: true,
              name: true,
              photo: true, 
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. If ADMIN → full access
  if (requester.role === "ADMIN") {
    return user;
  }

  // 3. If own profile → full access
  if (requester.id === targetUserId) {
    return user;
  }

  // 4. If requester is TUTOR & target is PARENT → hide phone
  if (requester.role === "TUTOR" && user.role === "PARENT") {
    return {
      ...user,
      phone: null,
      email: null,
    };
  }

  // 5. If requester is PARENT & target is TUTOR
  if (requester.role === "PARENT" && user.role === "TUTOR") {
    // Check if tutor applied to any of parent's tuitions
    const hasApplied = await prisma.application.findFirst({
      where: {
        tutorId: targetUserId,
        tuition: {
          parentId: requester.id,
        },
      },
    });

    if (hasApplied) {
      return user; // allow phone
    } else {
      return {
        ...user,
        phone: null,
        email: null,
      };
    }
  }

  // 6. Default fallback → hide phone
  return {
    ...user,
    phone: null,
    email: null,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photo: true,
      location: true,
      role: true,
      subscriptionType: true,
      subscriptionRole: true,
      subscriptionExpiresAt: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const UserService = {
  updateProfile,
  getUserProfile,
  getMe,
};
