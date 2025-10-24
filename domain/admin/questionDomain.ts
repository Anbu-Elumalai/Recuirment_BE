import { QuestionSchemaInput, UpdateQuestionInput } from "../../api/Request/question";
import { ApiResponse, ErrorResponse, SuccessMessage } from "../../api/response/commonResponse";
import { PaginationResult } from "../../api/response/paginationResponse";
import { QuestionDtls } from "../../api/response/question.response";

export interface questionListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface QuestionRepositoryDomain{
    createQuestion(data : QuestionSchemaInput, userId: string , groupId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findQuestionExist( questionText: string,skills: string[], categories: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findQuestionByIdExist(id:string): Promise<Boolean | ErrorResponse>;
    updateQuestion(data : UpdateQuestionInput, id: string,userId: string , groupId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    getQuestionById(id:string): Promise<ApiResponse<QuestionDtls> | ErrorResponse>;
    getAllQuestion(params: questionListParams, userId: string, groupId: string):Promise<PaginationResult<QuestionDtls[]> | ErrorResponse>;
    deleteQuestion(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}

export interface QuestionServiceDomain{
    createQuestion(data : QuestionSchemaInput, userId: string , groupId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updateQuestion(data : UpdateQuestionInput,id: string, userId: string , groupId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    getQuestionById(id:string): Promise<ApiResponse<QuestionDtls> | ErrorResponse>;
    getAllQuestion(params: questionListParams, userId: string, groupId: string):Promise<PaginationResult<QuestionDtls[]> | ErrorResponse>;
    deleteQuestion(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}