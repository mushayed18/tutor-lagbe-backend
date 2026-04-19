import { Request, Response } from "express";
import { ApplicationService } from "./application.service";

const applyToTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const { tuitionId } = req.body;

    const result = await ApplicationService.applyToTuition(
      requester,
      tuitionId,
    );

    res.status(201).json({
      success: true,
      message: "Applied successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyApplications = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const { page, limit } = req.query;

    const result = await ApplicationService.getMyApplications(requester, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Applications fetched",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getApplicationsForTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const { tuitionId } = req.params as { tuitionId: string };
    const { page, limit } = req.query as { page?: string; limit?: string };

    const result = await ApplicationService.getApplicationsForTuition(
      requester,
      tuitionId,
      { page, limit },
    );

    res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const { id } = req.params as { id: string };
    const { status } = req.body;

    const result = await ApplicationService.updateApplicationStatus(
      requester,
      id,
      status,
    );

    res.status(200).json({
      success: true,
      message: "Application status updated",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  applyToTuition,
  getMyApplications,
  getApplicationsForTuition,
  updateApplicationStatus,
};
