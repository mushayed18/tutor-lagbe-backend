import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getUsers(req.query);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AdminService.getSingleUser(id as string);

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const AdminController = {
  getUsers,
  getSingleUser,
};