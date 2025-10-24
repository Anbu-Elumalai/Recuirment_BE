import { StatusCodes } from "http-status-codes";
import { questionListQuerySchema, questionSchema, updateQuestionSchema } from "../../../api/Request/question";
import { QuestionServiceDomain } from "../../../domain/admin/questionDomain";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { sendErrorResponse, sendPaginationResponse, sendResponse } from "../../../utils/common/commonResponse";

class questionHandler {
   private service: QuestionServiceDomain

   constructor(service:QuestionServiceDomain){
     this.service=service
   }

   create = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = questionSchema.safeParse(req.body);

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

            const response = await this.service.createQuestion(result.data, userId,groupId);
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
                    'question ID is required',
                    'INVALID_PARAMS'
                );
            }

           

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid question ID format',
                    'INVALID_PARAMS'
                );
            }

            const result = updateQuestionSchema.safeParse(req.body);
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

            const response = await this.service.updateQuestion(updateData,id, userId,groupId);
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

   getquestionDetails = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'question ID is required',
                    'INVALID_PARAMS'
                );
            }

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid question ID format',
                    'INVALID_PARAMS'
                );
            }

            const response = await this.service.getQuestionById(id);
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

   getquestionList = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate and transform query parameters
        const queryResult = questionListQuerySchema.safeParse(req.query);
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
        const response = await this.service.getAllQuestion({
            page:finalPage,
            limit:finalLimit,
            search,
            sort,
            type
        }, userId,groupId);

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
                       'question ID is required',
                       'INVALID_PARAMS'
                   );
               }
       
             
               if (!ObjectId.isValid(id)) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'Invalid question ID format',
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
           
                   const response = await this.service.deleteQuestion(id, userId);
            
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

export function NewquestionHandlerRegister(service:QuestionServiceDomain):questionHandler{
    return new questionHandler(service)
}