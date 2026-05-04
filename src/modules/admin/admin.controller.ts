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

const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    if (typeof isBanned !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isBanned must be true or false",
      });
    }

    const result = await AdminService.toggleUserBan(id as string, isBanned);

    res.status(200).json({
      success: true,
      message: isBanned
        ? "User banned successfully"
        : "User unbanned successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTuitions = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAllTuitions(req.query);

    res.status(200).json({
      success: true,
      message: "Tuitions fetched successfully",
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTuition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AdminService.deleteTuition(id as string);

    res.status(200).json({
      success: true,
      message: result.message,
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
  toggleUserBan,
  getAllTuitions,
  deleteTuition,
};