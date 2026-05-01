import { Request, Response } from "express";
import { HireRelationService } from "./hireRelation.service";

const getMyConnections = async (req: Request, res: Response) => {
  try {
    const result = await HireRelationService.getMyConnections(
      req.user,
      req.query,
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { getMyConnections };
