import { CreateUSerInput, UpdateuserInput } from "../../api/Request/user"
import { User } from "../../api/response/user.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";

export interface userListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type: string
}

export interface UserDomainRepository {
    findPhoneNoisExist(ph: string, groupId: string): Promise<Boolean | ErrorResponse>;
    findEmailisExist(email: string, groupId: string): Promise<Boolean | ErrorResponse>;
    createuser(userInput: CreateUSerInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updateuser(userInput: UpdateuserInput,id:string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    finduserIdExist(id: string): Promise<Boolean | ErrorResponse>;
    findEmailisExistForUpdate(email: string, userId: string, id: string, groupId: string): Promise<Boolean | ErrorResponse>
    findPhNoisExistForUpdate(ph: string, userId: string, id: string, groupId: string): Promise<Boolean | ErrorResponse>
    finduserById(id: string): Promise<ApiResponse<User> | ErrorResponse>;
    getuserList(params: userListParams,userId:string, groupId: string): Promise<PaginationResult<User> | ErrorResponse>;
    deleteuser(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}

export interface UserDomainService {
    createuser(userInput: CreateUSerInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updateuser(userInput: UpdateuserInput,id:string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    finduserById(id: string): Promise<ApiResponse<User> | ErrorResponse>;
    getuserList(params: userListParams,userId:string, groupId: string): Promise<PaginationResult<User> | ErrorResponse>;
    deleteuser(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}