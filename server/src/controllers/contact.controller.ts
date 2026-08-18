import { Request, Response } from "express";
import {
    createContactSubmission,
    getAllContactSubmissions,
    markContactAsRead,
    deleteContactSubmission,
} from "@/services/contact.service";
import { CreateContactSubmissionRequest } from "@/types/zod";

export const createContactSubmissionController = async (req: Request, res: Response) => {
    try {
        const validatedData = CreateContactSubmissionRequest.parse(req.body);

        const submission = await createContactSubmission(validatedData);

        res.status(201).json({
            success: true,
            message: "Thank you for contacting us! We will get back to you soon.",
            data: submission,
        });
    } catch (error: any) {
        console.error("Create contact submission error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to submit contact form",
        });
    }
};

export const getAllContactSubmissionsController = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await getAllContactSubmissions(page, limit);

        res.status(200).json({
            success: true,
            message: "Contact submissions fetched successfully",
            data: result.submissions,
            pagination: result.pagination,
        });
    } catch (error: any) {
        console.error("Get contact submissions error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch contact submissions",
        });
    }
};

export const markContactAsReadController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const submission = await markContactAsRead(id);

        res.status(200).json({
            success: true,
            message: "Contact marked as read",
            data: submission,
        });
    } catch (error: any) {
        console.error("Mark contact as read error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to mark contact as read",
        });
    }
};

export const deleteContactSubmissionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await deleteContactSubmission(id);

        res.status(200).json({
            success: true,
            message: "Contact submission deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete contact submission error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete contact submission",
        });
    }
};
