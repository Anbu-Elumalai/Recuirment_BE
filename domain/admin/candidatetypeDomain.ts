import { CreatecandidateTypeInput, UpdatecandidateTypeInput } from "../../api/Request/candidateType"
import { candidateType, candidateTypeDtls } from "../../api/response/candidateType.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";

export interface candidateTypeListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface candidateTypeDomainRepository {
    findcandidateTypeNameExist(name: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    createcandidateType(candidateTypeInput: CreatecandidateTypeInput,  userId: string, groupId: string): Promise<ApiResponse<candidateType> | ErrorResponse>;
    updatecandidateType(candidateTypeInput: UpdatecandidateTypeInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findcandidateTypeId(id: string): Promise<Boolean | ErrorResponse>;
    findcandidateTypeNameForUpdate(name: string, id: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findcandidateTypeById(id: string): Promise<ApiResponse<candidateTypeDtls> | ErrorResponse>;
    getcandidateTypeList(params: candidateTypeListParams, groupId:string): Promise<PaginationResult<candidateTypeDtls> | ErrorResponse>;
    deletecandidateType(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>; 
}

export interface candidateTypeDomainService {
    createcandidateType(candidateTypeInput: CreatecandidateTypeInput,userId: string, groupId: string): Promise<ApiResponse<candidateType> | ErrorResponse>;
    updatecandidateType(candidateTypeInput: UpdatecandidateTypeInput,  userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findcandidateTypeById(id: string): Promise<ApiResponse<candidateTypeDtls> | ErrorResponse>;
    getcandidateTypeList(params: candidateTypeListParams, groupId:string): Promise<PaginationResult<candidateTypeDtls> | ErrorResponse>;
    deletecandidateType(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}