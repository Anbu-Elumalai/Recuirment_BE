import { StatusCodes } from "http-status-codes";
import { planSchema, updatePlanSchema, planListQuerySchema } from "../../../api/Request/plan.mode";
import { PlanModeDomainService } from "../../../domain/admin/plan.modeDomain";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { sendErrorResponse, sendPaginationResponse, sendResponse } from "../../../utils/common/commonResponse";
import { paymentDteails } from "../../../api/Request/assessment";
import crypto, { sign } from "crypto";
import { _config } from "../../../config/config";
import { Webhook } from "standardwebhooks";

class PlanModeHandler {

    private service: PlanModeDomainService

    constructor(service: PlanModeDomainService) {
        this.service = service
    }

    create = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = planSchema.safeParse(req.body);

            if (!result.success) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid request body',
                    'INVALID_INPUT',
                    result.error.issues
                );
            }
            const type = req.user?.userType

            // if (type !== "SuperAdmin") {
            //     return sendErrorResponse(
            //         res,
            //         StatusCodes.UNAUTHORIZED,
            //         'User not have permission to access this route',
            //         'UNAUTHORIZED'
            //     );
            // }
            const userId = req.user?.id;
            if (!userId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const groupId = req.user.groupingId

            if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const response = await this.service.createPlanMode(result.data, userId, groupId);
            return sendResponse(res, response);

        } catch (error: any) {
            return sendErrorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Internal server error',
                'INTERNAL_SERVER_ERROR'
            );
        }
    }

    update = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;

            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'PlanMode ID is required',
                    'INVALID_PARAMS'
                );
            }



            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid PlanMode ID format',
                    'INVALID_PARAMS'
                );
            }

            const type = req.user?.userType

            if (type !== "SuperAdmin") {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not have permission to access this route',
                    'UNAUTHORIZED'
                );
            }

            const result = updatePlanSchema.safeParse(req.body);
            if (!result.success) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid request body',
                    'INVALID_INPUT',
                    result.error.issues
                );
            }

            const updateData = {
                ...result.data,
                id
            };

            const userId = req.user?.id;
            if (!userId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const groupId = req.user.groupingId

            if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const response = await this.service.updatePlanMode(updateData, id, userId, groupId);
            return sendResponse(res, response);

        } catch (error: any) {
            return sendErrorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Internal server error',
                'INTERNAL_SERVER_ERROR'
            );
        }
    }

    getPlanModeDetails = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'PlanMode ID is required',
                    'INVALID_PARAMS'
                );
            }

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid PlanMode ID format',
                    'INVALID_PARAMS'
                );
            }

            const type = req.user?.userType

            if (type !== "SuperAdmin") {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not have permission to access this route',
                    'UNAUTHORIZED'
                );
            }

            const response = await this.service.findPlanModeById(id);
            return sendResponse(res, response);

        } catch (error: any) {
            return sendErrorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Internal server error',
                'INTERNAL_SERVER_ERROR'
            );
        }
    }

    getPlanModeList = async (req: Request, res: Response): Promise<any> => {
        try {
            // Validate and transform query parameters
            const queryResult = planListQuerySchema.safeParse(req.query);
            if (!queryResult.success) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid query parameters',
                    'INVALID_QUERY_PARAMS',
                    queryResult.error.issues
                );
            }

            // Get validated and transformed query params
            const { page, limit, search, sort, type } = queryResult.data;

            const finalPage = parseInt(page as string) || 0;
            const finalLimit = parseInt(limit as string) || 100;

            const groupId = req.user.groupingId

            if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            // Call service method with validated params
            const response = await this.service.getPlanModeList({
                page: finalPage,
                limit: finalLimit,
                search,
                sort,
                type
            }, groupId);

            return sendPaginationResponse(res, response);
        } catch (error) {
            return sendErrorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Internal server error',
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
    delete = async (req: Request, res: Response): Promise<any> => {

        try {
            const { id } = req.params;

            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'PlanMode ID is required',
                    'INVALID_PARAMS'
                );
            }


            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid PlanMode ID format',
                    'INVALID_PARAMS'
                );
            }

            const usertype = req.user?.userType

            if (usertype !== "SuperAdmin") {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not have permission to access this route',
                    'UNAUTHORIZED'
                );
            }

            const userId = req.user?.id;
            if (!userId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const response = await this.service.deletePlanMode(id, userId);

            return sendResponse(res, response);

        } catch (err: any) {
            return sendErrorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Internal server error',
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
}
export function NewPlanModeHandlerRegister(service: PlanModeDomainService): PlanModeHandler {
    return new PlanModeHandler(service)
}