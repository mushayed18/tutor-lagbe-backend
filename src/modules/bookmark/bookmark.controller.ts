import { Request, Response } from "express";
import { BookmarkService } from "./bookmark.service";

const addBookmark = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const { tuitionId } = req.body;

    const result = await BookmarkService.addBookmark(
      requester,
      tuitionId
    );

    res.status(201).json({
      success: true,
      message: "Bookmarked successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const removeBookmark = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const tuitionId = req.params.tuitionId as string;

    const result = await BookmarkService.removeBookmark(
      requester,
      tuitionId
    );

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBookmarks = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const query = req.query;

    const result = await BookmarkService.getMyBookmarks(requester, query);

    res.status(200).json({
      success: true,
      message: "Bookmarks fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { addBookmark, removeBookmark, getMyBookmarks };