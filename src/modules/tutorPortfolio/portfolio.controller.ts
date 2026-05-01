import { Request, Response } from "express";
import { PortfolioService } from "./portfolio.service";

const createPortfolio = async (req: Request, res: Response) => {
  try {
    const result = await PortfolioService.createPortfolio(
      req.user,
      req.body
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

const updatePortfolio = async (req: Request, res: Response) => {
  try {
    const result = await PortfolioService.updatePortfolio(
      req.user,
      req.body
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

const getMyPortfolio = async (req: Request, res: Response) => {
  try {
    const result = await PortfolioService.getMyPortfolio(req.user);

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

const getPortfolioByUserId = async (req: Request, res: Response) => {
  try {
    const result = await PortfolioService.getPortfolioByUserId(
      req.params.userId as string
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

export const PortfolioController = {
  createPortfolio,
  updatePortfolio,
  getMyPortfolio,
  getPortfolioByUserId,
};