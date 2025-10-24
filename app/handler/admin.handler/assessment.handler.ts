import { StatusCodes } from "http-status-codes";
import { assessmentListQuerySchema, assessmentSchema, paymentDteails, updateassessmentSchema } from "../../../api/Request/assessment";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { sendErrorResponse, sendPaginationResponse, sendResponse } from "../../../utils/common/commonResponse";
import { AssServiceDomain } from "../../../domain/admin/assessmentDomain";
import { assessmentAnswerSchema, assessmentSubmitionSchema } from "../../../api/Request/questionAns";
class assessmentHandler {
   private service: AssServiceDomain

   constructor(service:AssServiceDomain){
     this.service=service
   }

   create = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = assessmentSchema.safeParse(req.body);

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

            const response = await this.service.createAssessment(result.data, userId,groupId);
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
                    'role ID is required',
                    'INVALID_PARAMS'
                );
            }

           

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid role ID format',
                    'INVALID_PARAMS'
                );
            }

            const result = updateassessmentSchema.safeParse(req.body);
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

            const response = await this.service.updateAssessment(updateData,id, userId,groupId);
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

   getroleDetails = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            if (!id) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'role ID is required',
                    'INVALID_PARAMS'
                );
            }

            if (!ObjectId.isValid(id)) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid role ID format',
                    'INVALID_PARAMS'
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

            const response = await this.service.getAssessmentById(id, userId , groupId);
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

   getroleList = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate and transform query parameters
        const queryResult = assessmentListQuerySchema.safeParse(req.query);
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
        const response = await this.service.getAllAssessment({
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
                       'role ID is required',
                       'INVALID_PARAMS'
                   );
               }
       
             
               if (!ObjectId.isValid(id)) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'Invalid role ID format',
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

             const groupId = req.user.groupingId

             if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

                   const response = await this.service.deleteAssessment(id, userId, groupId);
            
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

     sendAssessemntLink = async (req: Request, res: Response):Promise<any>=>{
           try {
               const { id } = req.params;
               
               if (!id) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'role ID is required',
                       'INVALID_PARAMS'
                   );
               }
       
             
               if (!ObjectId.isValid(id)) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'Invalid role ID format',
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

             const groupId = req.user.groupingId

             if (!groupId) {
                return sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    'User not authenticated',
                    'UNAUTHORIZED'
                );
            }

                   const response = await this.service.sendAssessemntLink(id,userId);
            
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

     assementQuestion= async (req: Request, res: Response):Promise<any>=>{
           try {
               const { token } = req.params;
               
               if (!token) {
                   return sendErrorResponse(
                       res,
                       StatusCodes.BAD_REQUEST,
                       'token is required',
                       'INVALID_PARAMS'
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

                   const response = await this.service.assementQuestion(token);
            
                   return sendPaginationResponse(res, response);
       
               }catch(err:any){
                 return sendErrorResponse(
                   res,
                   StatusCodes.INTERNAL_SERVER_ERROR,
                   'Internal server error',
                   'INTERNAL_SERVER_ERROR'
               );
               }
     }  

     questionAnswer = async (req: Request, res: Response):Promise<any>=>{
     try {
         const result = assessmentAnswerSchema.safeParse(req.body);
            if (!result.success) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid request body',
                    'INVALID_INPUT',
                    result.error.issues
                );
            }

            const response = await this.service.questionAnswer(result.data)

              return sendResponse(res,response);
     } catch (error) {
         return sendErrorResponse(
                   res,
                   StatusCodes.INTERNAL_SERVER_ERROR,
                   'Internal server error',
                   'INTERNAL_SERVER_ERROR'
               );
     }
     }

      submitAssessment = async (req: Request, res: Response):Promise<any>=>{
     try {
         const result = assessmentSubmitionSchema.safeParse(req.body);
            if (!result.success) {
                return sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Invalid request body',
                    'INVALID_INPUT',
                    result.error.issues
                );
            }

            const response = await this.service.submitAssessment(result.data)

              return sendResponse(res,response);
     } catch (error) {
         return sendErrorResponse(
                   res,
                   StatusCodes.INTERNAL_SERVER_ERROR,
                   'Internal server error',
                   'INTERNAL_SERVER_ERROR'
               );
     }
     }

}

export function NewAssessmentHandlerRegister(service:AssServiceDomain):assessmentHandler{
    return new assessmentHandler(service)
}