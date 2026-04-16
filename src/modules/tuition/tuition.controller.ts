import { Request, Response } from "express";
import { createTuitionSchema } from "./tuition.validation";
import { TuitionService } from "./tuition.service";

const createTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user;

    // validate body
    const validatedData = createTuitionSchema.parse(req.body);

    const result = await TuitionService.createTuition(
      requester,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Tuition created successfully",
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
    const result = await TuitionService.getAllTuitions(req.query);

    res.status(200).json({
      success: true,
      message: "Tuitions fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user; // from auth middleware
    const tuitionId = req.params.id as string;

    const result = await TuitionService.getSingleTuition(
      requester,
      tuitionId
    );

    res.status(200).json({
      success: true,
      message: "Tuition fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyTuitions = async (req: Request, res: Response) => {
  try {
    const requester = req.user;

    const query = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await TuitionService.getMyTuitions(
      requester,
      query
    );

    res.status(200).json({
      success: true,
      message: "My tuitions fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const tuitionId = req.params.id as string;
    const payload = req.body;

    const result = await TuitionService.updateTuition(
      requester,
      tuitionId,
      payload
    );

    res.status(200).json({
      success: true,
      message: "Tuition updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const tuitionId = req.params.id as string;

    const result = await TuitionService.deleteTuition(
      requester,
      tuitionId
    );

    res.status(200).json({
      success: true,
      message: "Tuition deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { createTuition, getAllTuitions, getSingleTuition, getMyTuitions, updateTuition, deleteTuition };