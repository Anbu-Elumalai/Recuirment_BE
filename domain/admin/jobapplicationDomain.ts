import {JobApplicCreateInput , JobApplicUpdateInput } from "../../api/Request/testApplication"
import {  JobAppCOde, JobApplicDtls } from "../../api/response/testapplication.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";

export interface jobAppListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface jobApplicDomainRepository {
    generateJobApplicationCode(groupId: string): Promise<ApiResponse<JobAppCOde> | ErrorResponse>
    checkCodeExist(code: string , groupId: string): Promise<Boolean | ErrorResponse>
    createJobApplic(JobApplicInput: JobApplicCreateInput,  userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updateJobApplic(JobApplicInput: JobApplicUpdateInput,id:string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findJobApplicById(id: string): Promise<ApiResponse<JobApplicDtls> | ErrorResponse>;
    findJobApplicIdExist(id: string): Promise<Boolean | ErrorResponse> 
    getJobApplicList(params: jobAppListParams,userId: string, groupId:string): Promise<PaginationResult<JobApplicDtls> | ErrorResponse>;
    deleteJobApplic(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>; 
}

export interface jobApplicDomainService {
    generateJobApplicationCode(groupId: string): Promise<ApiResponse<JobAppCOde> | ErrorResponse>
    createJobApplic(JobApplicInput: JobApplicCreateInput,userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updateJobApplic(JobApplicInput: JobApplicUpdateInput,id:string,  userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findJobApplicById(id: string): Promise<ApiResponse<JobApplicDtls> | ErrorResponse>;
    getJobApplicList(params: jobAppListParams,userId: string, groupId:string): Promise<PaginationResult<JobApplicDtls> | ErrorResponse>;
    deleteJobApplic(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
}