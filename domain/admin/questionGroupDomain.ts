import { AutoSelectInput, GroupQuestionSchemaInput, GroupUpdateQuestionInput } from "../../api/Request/groupQuestion";
import { ApiResponse, ErrorResponse, SuccessMessage } from "../../api/response/commonResponse";
import { QuestionGroupDtls, QuestionGroupForProfessionals, QuestionGroupSkillDtls } from "../../api/response/question.group.response";

export interface questionListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface GroupQuestionRepositoryDomain{
   creaGroupQuestion(data : GroupQuestionSchemaInput, userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
   findGroupQuestionNameExist(name:string,userId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
   findGroupQuestionNameExistForUpdate(name:string,userId: string , id: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
   findGroupQuestionIdExist(id: string): Promise<Boolean | ErrorResponse>;
   updateGroupQuestion(data : GroupUpdateQuestionInput,id: string ,userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
   getGroupQuestionById(id:string,userId: string): Promise<ApiResponse<QuestionGroupDtls> | ErrorResponse>;
   getAllGroupQuestion(param:questionListParams, userId: string, groupId: string): Promise<ApiResponse<QuestionGroupDtls[]> | ErrorResponse>;
   deleteGroupQuestion(id: string , userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
   findQuestionGroupBaseSkill(id: string): Promise<ApiResponse<QuestionGroupSkillDtls[]> | ErrorResponse>
   getAutoSelectedQuestion(data:AutoSelectInput, groupId: string): Promise<ApiResponse<QuestionGroupForProfessionals[]> | ErrorResponse>
}

export interface GroupQuestionServiceDomain{
   creaGroupQuestion(data : GroupQuestionSchemaInput, userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
   updateGroupQuestion(data : GroupUpdateQuestionInput,id: string ,userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
   getGroupQuestionById(id:string,userId: string): Promise<ApiResponse<QuestionGroupDtls> | ErrorResponse>;
   getAllGroupQuestion(param:questionListParams, userId: string, groupId: string): Promise<ApiResponse<QuestionGroupDtls[]> | ErrorResponse>;
   deleteGroupQuestion(id: string , userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
   findQuestionGroupBaseSkill(id: string): Promise<ApiResponse<QuestionGroupSkillDtls[]> | ErrorResponse>
   getAutoSelectedQuestion(data:AutoSelectInput, groupId: string): Promise<ApiResponse<QuestionGroupForProfessionals[]> | ErrorResponse>

}