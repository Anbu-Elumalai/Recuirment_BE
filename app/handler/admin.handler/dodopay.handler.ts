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
import { DODOpaymentDomainService } from "../../../domain/admin/dodoPaymentDomain";

class DodoPayHandler {

    private service: DODOpaymentDomainService

    constructor(service: DODOpaymentDomainService) {
        this.service = service
    }
  subcription = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = paymentDteails.safeParse(req.body);

            if (!result.success) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid request body',
                    'INVALID_INPUT',
                    result.error.issues
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

            const groupId = req.user.groupingId

            if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const response = await this.service.paymentSubcription(result.data, userId, groupId);
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
    paymentSubscriptionAction = async (req: Request, res: Response): Promise<any> => {
        try {
            const { action, reason } = req.body;

            if (!action || (action !== 'cancelled')) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid action. Must be either "cancel" or "hold".',
                    'INVALID_INPUT'
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

            const groupId = req.user.groupingId

            if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }


            const result = await this.service.paymentSubscriptionAction(
                action,
                reason || "",
                userId,
                groupId
            );

            return sendResponse(res, result);
        } catch (error: any) {
            return sendErrorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Internal server error',
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
}
export function NewDodopayHandlerRegister(service: DODOpaymentDomainService): DodoPayHandler {
    return new DodoPayHandler(service)
}