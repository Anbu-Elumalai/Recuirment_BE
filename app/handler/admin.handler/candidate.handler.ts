import { StatusCodes } from "http-status-codes";
import { candidateListQuerySchema, candidateSchema, CreatecandidateInput, updatecandidateSchema  } from "../../../api/Request/candidate";
import { CandidateServiceDomain } from "../../../domain/admin/candidateDomain";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { sendErrorResponse, sendPaginationResponse, sendResponse } from "../../../utils/common/commonResponse";
class candidateHandler {
   private service: CandidateServiceDomain

   constructor(service:CandidateServiceDomain){
     this.service=service
   }

   create = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = candidateSchema.safeParse(req.body);

            if (!result.success) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid request body',
                    'INVALID_INPUT',
                    result.error.issues
                );
            }

            console.log(req.user,';;;;;');
            
            const userId = req.user?.id;
            if (!userId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not found',
                    'UNAUTHORIZED'
                );
            }

             const groupId = req.user.groupingId

             if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'Group Id not authenticated',
                    'UNAUTHORIZED'
                );
            }

            const response = await this.service.createCandidate(result.data, userId,groupId);
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
            console.log(id,'llll')
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'candidate ID is required',
                    'INVALID_PARAMS'
                );
            }

           

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid candidate ID format',
                    'INVALID_PARAMS'
                );
            }

            const result = updatecandidateSchema.safeParse(req.body);
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

            const response = await this.service.updateCandidate(updateData,id, userId ,groupId);
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

   getcandidateDetails = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'candidate ID is required',
                    'INVALID_PARAMS'
                );
            }

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid candidate ID format',
                    'INVALID_PARAMS'
                );
            }

            const response = await this.service.findCandidateById(id);
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

   getcandidateList = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate and transform query parameters
        const queryResult = candidateListQuerySchema.safeParse(req.query);
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
        const response = await this.service.findAllCandidate({
            page:finalPage,
            limit:finalLimit,
            search,
            sort,
            type
        }, userId);

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
                       'candidate ID is required',
                       'INVALID_PARAMS'
                   );
               }
       
             
               if (!ObjectId.isValid(id)) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'Invalid candidate ID format',
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
           
                   const response = await this.service.deleteCandidate(id, userId);
            
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

export function NewcandidateHandlerRegister(service:CandidateServiceDomain):candidateHandler{
    return new candidateHandler(service)
}