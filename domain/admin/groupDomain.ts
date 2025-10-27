import { CreategroupInput, UpdategroupInput } from "../../api/Request/group"
import { groupDtls } from "../../api/response/group.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";
import { CandidateDtls } from "../../api/response/candidate.response";

export interface groupListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type: string
}

export interface groupDomainRepository {
    findLasttest(id: string): Promise<ApiResponse<{ count: number; statusCode: number }> | ErrorResponse>;

    findgroupNameExist(name: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    creategroup(groupInput: CreategroupInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updategroup(groupInput: UpdategroupInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findgroupId(id: string): Promise<Boolean | ErrorResponse>;
    findgroupNameForUpdate(name: string, id: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findgroupById(id: string): Promise<ApiResponse<groupDtls> | ErrorResponse>;
    getgroupList(params: groupListParams, userId: string, groupId: string): Promise<PaginationResult<groupDtls> | ErrorResponse>;
    deletegroup(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}

export interface groupDomainService {
    findLasttest(id: string): Promise<ApiResponse<{ count: number; statusCode: number }> | ErrorResponse>;

    creategroup(groupInput: CreategroupInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updategroup(groupInput: UpdategroupInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findgroupById(id: string): Promise<ApiResponse<groupDtls> | ErrorResponse>;
    getgroupList(params: groupListParams, userId: string, groupId: string): Promise<PaginationResult<groupDtls> | ErrorResponse>;
    deletegroup(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}