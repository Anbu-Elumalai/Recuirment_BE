import { StatusCodes } from "http-status-codes";
import {  updatetestConfigSchema } from "../../../api/Request/testConfig";
import { testConfigDomainService } from "../../../domain/admin/test.configDomain";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { sendErrorResponse, sendResponse } from "../../../utils/common/commonResponse";
class testConfigHandler {
   private service: testConfigDomainService

   constructor(service:testConfigDomainService){
     this.service=service
   }

   update = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'testConfig ID is required',
                    'INVALID_PARAMS'
                );
            }

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid testConfig ID format',
                    'INVALID_PARAMS'
                );
            }

            const result = updatetestConfigSchema.safeParse(req.body);
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
             if(req.user.userType === "Admin"){
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'Admin User only able to edit the testConfig',
                     'Admin User only able to edit the testConfig',
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

            const response = await this.service.updatetestConfig(updateData, userId,groupId);
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

   gettestConfigDetails = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'testConfig ID is required',
                    'INVALID_PARAMS'
                );
            }

            if(req.user.userType === "Admin"){
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'Admin User only able to edit the testConfig',
                     'Admin User only able to edit the testConfig',
                );
             }

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid testConfig ID format',
                    'INVALID_PARAMS'
                );
            }

            const response = await this.service.findtestConfigById(id);
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
}

export function NewtestConfigHandlerRegister(service:testConfigDomainService):testConfigHandler{
    return new testConfigHandler(service)
}