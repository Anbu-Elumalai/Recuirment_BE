import { CreateRoleInput, UpdateRoleInput } from "../../api/Request/role"
import { Role, RoleDtls } from "../../api/response/role.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";

export interface roleListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface roleDomainRepository {
    findroleNameExist(name: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    createrole(roleInput: CreateRoleInput,  userId: string, groupId: string): Promise<ApiResponse<Role> | ErrorResponse>;
    updaterole(roleInput: UpdateRoleInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findroleId(id: string): Promise<Boolean | ErrorResponse>;
    findroleNameForUpdate(name: string, id: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findroleById(id: string): Promise<ApiResponse<RoleDtls> | ErrorResponse>;
    getroleList(params: roleListParams, groupId:string): Promise<PaginationResult<RoleDtls> | ErrorResponse>;
    deleterole(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>; 
}

export interface roleDomainService {
    createrole(roleInput: CreateRoleInput,userId: string, groupId: string): Promise<ApiResponse<Role> | ErrorResponse>;
    updaterole(roleInput: UpdateRoleInput,  userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findroleById(id: string): Promise<ApiResponse<RoleDtls> | ErrorResponse>;
    getroleList(params: roleListParams, groupId:string): Promise<PaginationResult<RoleDtls> | ErrorResponse>;
    deleterole(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}