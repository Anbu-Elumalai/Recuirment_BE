import { CreateskillInput, UpdateskillInput } from "../../api/Request/skill"
import { skill, skillDtls } from "../../api/response/skill.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";

export interface skillListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface skillDomainRepository {
    findskillNameExist(name: string,groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    createskill(skillInput: CreateskillInput,  userId: string,groupId: string): Promise<ApiResponse<skill> | ErrorResponse>;
    updateskill(skillInput: UpdateskillInput, userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findskillId(id: string): Promise<Boolean | ErrorResponse>;
    findskillNameForUpdate(name: string, id: string,groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findskillById(id: string): Promise<ApiResponse<skillDtls> | ErrorResponse>;
    getskillList(params: skillListParams, groupId: string): Promise<PaginationResult<skillDtls> | ErrorResponse>;
    deleteskill(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>; 
}

export interface skillDomainService {
    createskill(skillInput: CreateskillInput,userId: string,groupId: string): Promise<ApiResponse<skill> | ErrorResponse>;
    updateskill(skillInput: UpdateskillInput,  userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findskillById(id: string): Promise<ApiResponse<skillDtls> | ErrorResponse>;
    getskillList(params: skillListParams, groupId: string): Promise<PaginationResult<skillDtls> | ErrorResponse>;
    deleteskill(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}