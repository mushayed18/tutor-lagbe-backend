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

export const UserService = {
  updateProfile,
};