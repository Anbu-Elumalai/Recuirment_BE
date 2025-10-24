import { StatusCodes } from "http-status-codes";
import { jobApplicCreateSchema,JobApplicUpdateSchema,jobApplicListQuerySchema } from "../../../api/Request/testApplication";
import { jobApplicDomainService } from "../../../domain/admin/jobapplicationDomain";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { sendErrorResponse, sendPaginationResponse, sendResponse } from "../../../utils/common/commonResponse";
class JobApplicHandler {
   private service: jobApplicDomainService

   constructor(service:jobApplicDomainService){
     this.service=service
   }

   generateCode= async (req: Request, res: Response): Promise<any> => {
       try {
             const groupId = req.user.groupingId

             if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const response = await this.service.generateJobApplicationCode( groupId);
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
   create = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = jobApplicCreateSchema.safeParse(req.body);

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

            const response = await this.service.createJobApplic(result.data, userId,groupId);
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
                    'JobApplic ID is required',
                    'INVALID_PARAMS'
                );
            }

           

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid JobApplic ID format',
                    'INVALID_PARAMS'
                );
            }

            const result = JobApplicUpdateSchema.safeParse(req.body);
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

            const response = await this.service.updateJobApplic(updateData,id, userId,groupId);
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

   getJobApplicDetails = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'JobApplic ID is required',
                    'INVALID_PARAMS'
                );
            }

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid JobApplic ID format',
                    'INVALID_PARAMS'
                );
            }

            const response = await this.service.findJobApplicById(id);
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

   getJobApplicList = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate and transform query parameters
        const queryResult = jobApplicListQuerySchema.safeParse(req.query);
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
        const { page, limit, search, sort ,type} = queryResult.data;
        
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

             const userId = req.user?.id;
            if (!userId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }
        // Call service method with validated params
        const response = await this.service.getJobApplicList({
            page:finalPage,
            limit:finalLimit,
            search,
            sort,
            type
        },userId,groupId);

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
    delete= async (req: Request, res: Response): Promise<any> =>{
       
           try {
               const { id } = req.params;
               
               if (!id) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'JobApplic ID is required',
                       'INVALID_PARAMS'
                   );
               }
       
             
               if (!ObjectId.isValid(id)) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'Invalid JobApplic ID format',
                       'INVALID_PARAMS'
                   );}
       
               const userId = req.user?.id;
                   if (!userId) {
                       return sendErrorResponse(
                           res,
                           StatusCodes.UNAUTHORIZED,
                           'User not authenticated',
                           'UNAUTHORIZED'
                       );
                   }
           
                   const response = await this.service.deleteJobApplic(id, userId);
            
                   return sendResponse(res,response);
       
               }catch(err:any){
                 return sendErrorResponse(
                   res,
                   StatusCodes.INTERNAL_SERVER_ERROR,
                   'Internal server error',
                   'INTERNAL_SERVER_ERROR'
               );
               }
           }
}

export function NewJobApplicHandlerRegister(service:jobApplicDomainService):JobApplicHandler{
    return new JobApplicHandler(service)
}