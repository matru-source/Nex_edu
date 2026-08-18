import { Request, Response } from 'express';
import {
    getWorkflowHistoryService,
    getAllWorkflowsService,
    getWorkflowStatsService,
    getEntityDetailsService,
} from '@/services/workflowTracking.service';
import { EntityType, CourseStatus } from '@prisma/client';

export async function getWorkflowHistoryController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { entityType, entityId } = req.params;

        if (!Object.values(EntityType).includes(entityType as EntityType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid entity type',
            });
        }

        const history = await getWorkflowHistoryService({
            entityType: entityType as EntityType,
            entityId,
        });

        return res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflow history',
        });
    }
}

export async function getAllWorkflowsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const {
            entityType,
            status,
            contributorId,
            startDate,
            endDate,
            page,
            limit,
        } = req.query;

        const filters: any = {};

        if (entityType) {
            if (!Object.values(EntityType).includes(entityType as EntityType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid entity type',
                });
            }
            filters.entityType = entityType as EntityType;
        }

        if (status) {
            if (!Object.values(CourseStatus).includes(status as CourseStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }
            filters.status = status as CourseStatus;
        }

        if (contributorId) {
            filters.contributorId = contributorId as string;
        }

        if (startDate) {
            filters.startDate = new Date(startDate as string);
        }

        if (endDate) {
            filters.endDate = new Date(endDate as string);
        }

        if (page) {
            filters.page = parseInt(page as string);
        }

        if (limit) {
            filters.limit = parseInt(limit as string);
        }

        const result = await getAllWorkflowsService(filters);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflows',
        });
    }
}

export async function getWorkflowStatsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const stats = await getWorkflowStatsService();

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get workflow stats',
        });
    }
}

export async function getEntityDetailsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { entityType, entityId } = req.params;

        if (!Object.values(EntityType).includes(entityType as EntityType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid entity type',
            });
        }

        const entity = await getEntityDetailsService(
            entityType as EntityType,
            entityId
        );

        if (!entity) {
            return res.status(404).json({
                success: false,
                message: 'Entity not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: entity,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get entity details',
        });
    }
}