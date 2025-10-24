import { CreatecategoryInput, UpdatecategoryInput } from "../../api/Request/category"
import { Category, CategoryDtls } from "../../api/response/category.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";

export interface categoryListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface categoryDomainRepository {
    findcategoryNameExist(name: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    createcategory(categoryInput: CreatecategoryInput,  userId: string, groupId: string): Promise<ApiResponse<Category> | ErrorResponse>;
    updatecategory(categoryInput: UpdatecategoryInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findcategoryId(id: string): Promise<Boolean | ErrorResponse>;
    findcategoryNameForUpdate(name: string, id: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findcategoryById(id: string): Promise<ApiResponse<CategoryDtls> | ErrorResponse>;
    getcategoryList(params: categoryListParams, groupId:string): Promise<PaginationResult<CategoryDtls> | ErrorResponse>;
    deletecategory(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>; 
}

export interface categoryDomainService {
    createcategory(categoryInput: CreatecategoryInput,userId: string, groupId: string): Promise<ApiResponse<Category> | ErrorResponse>;
    updatecategory(categoryInput: UpdatecategoryInput,  userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findcategoryById(id: string): Promise<ApiResponse<CategoryDtls> | ErrorResponse>;
    getcategoryList(params: categoryListParams, groupId:string): Promise<PaginationResult<CategoryDtls> | ErrorResponse>;
    deletecategory(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}