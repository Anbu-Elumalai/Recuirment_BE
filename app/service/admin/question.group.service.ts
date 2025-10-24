import { StatusCodes } from "http-status-codes";
import { AutoSelectInput, GroupQuestionSchemaInput, GroupUpdateQuestionInput } from "../../../api/Request/groupQuestion";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { QuestionGroupDtls, QuestionGroupForProfessionals, QuestionGroupSkillDtls } from "../../../api/response/question.group.response";
import { GroupQuestionRepositoryDomain, GroupQuestionServiceDomain, questionListParams } from "../../../domain/admin/questionGroupDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { QuestionGroupModel } from "../../model/question.group";

class QuestionGroupService implements GroupQuestionServiceDomain{
    private readonly repo: GroupQuestionRepositoryDomain
    
    constructor(repo: GroupQuestionRepositoryDomain){
        this.repo = repo
    }
    async getAutoSelectedQuestion(data: AutoSelectInput, groupId: string): Promise<ApiResponse<QuestionGroupForProfessionals[]> | ErrorResponse> {
        try {
            return await this.repo.getAutoSelectedQuestion(data, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving auto select question list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async creaGroupQuestion(data: GroupQuestionSchemaInput, userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
      try {
          const questionGroupNameExist= await this.repo.findGroupQuestionNameExist(data.questionGroupName, userId)

           // Handle potential error from repository
            if ('status' in questionGroupNameExist && questionGroupNameExist.status === 'error') {
                return questionGroupNameExist as ErrorResponse;
            }

            // At this point, existingrole must be the success response type
            const roleExists = questionGroupNameExist as { count: number; statusCode: number };
            
            // Check if role already exists
            if (roleExists.statusCode === StatusCodes.OK && roleExists.count > 0) {
                return createErrorResponse(
                    'name already exists',
                    StatusCodes.CONFLICT
                );
            }
            
            return await this.repo.creaGroupQuestion(data, userId , groupId)

      } catch (error:any) {
         return createErrorResponse(
                'Error creating question group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
      }
    }
    
   async updateGroupQuestion(data: GroupUpdateQuestionInput, id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
           const isExist = await this.repo.findGroupQuestionIdExist(id)

           if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
            return isExist as ErrorResponse;
           }

           if(!isExist){
            return createErrorResponse(
                'role not found.',
                StatusCodes.CONFLICT
            );
           }
            // Check for existing role name
            const existingrole = await this.repo.findGroupQuestionNameExistForUpdate(data.questionGroupName,userId , id );

            // Handle potential error from repository
            if ('status' in existingrole && existingrole.status === 'error') {
                return existingrole as ErrorResponse;
            }

            // At this point, existingrole must be the success response type
            const roleExists = existingrole as { count: number; statusCode: number };
            
            // Check if role already exists
            if (roleExists.statusCode === StatusCodes.OK && roleExists.count > 0) {
                return createErrorResponse(
                    'Question group name name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the role
            return await this.repo.updateGroupQuestion(data,id, userId);
        } catch (error: any) {
            return createErrorResponse(
                'Error updating question group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getGroupQuestionById(id: string, userId: string): Promise<ApiResponse<QuestionGroupDtls> | ErrorResponse> {
       try {
        const isExist = await this.repo.findGroupQuestionIdExist(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'question group not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.repo.getGroupQuestionById(id, userId)
         
       } catch (error:any) {
        return createErrorResponse(
            'Error creating role',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
   async getAllGroupQuestion(param: questionListParams, userId: string, groupId: string): Promise<ApiResponse<QuestionGroupDtls[]> | ErrorResponse> {
        try {
            return await this.repo.getAllGroupQuestion(param, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving  list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async deleteGroupQuestion(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
         try {
                   const isExist = await this.repo.findGroupQuestionIdExist(id);
       
                   if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                       return isExist as ErrorResponse;
                   }
       
                   if (!isExist) {
                       return createErrorResponse(
                           'question group not found',
                           StatusCodes.BAD_REQUEST,
                           'Error role not found'
                       );
                   }
       
                  
                   return await this.repo.deleteGroupQuestion(id, userId);
               } catch (error:any) {
                   return createErrorResponse(
                       'Error delete question group',
                       StatusCodes.INTERNAL_SERVER_ERROR,
                       error.message
                   );
               }  
    }
    async findQuestionGroupBaseSkill(id: string): Promise<ApiResponse<QuestionGroupSkillDtls[]> | ErrorResponse> {
      try {
          const isExist = await this.repo.findGroupQuestionIdExist(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'question group not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.repo.findQuestionGroupBaseSkill(id)
         
      } catch (error:any) {
         return createErrorResponse(
                       'Error delete role',
                       StatusCodes.INTERNAL_SERVER_ERROR,
                       error.message
                   );
      }
    }
}

export function newQuestionGrpServiceRegister(repo:GroupQuestionRepositoryDomain ): GroupQuestionServiceDomain{
    return new QuestionGroupService(repo)
}