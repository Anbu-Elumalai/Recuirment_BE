import { StatusCodes } from "http-status-codes";
import { JobApplicCreateInput, JobApplicUpdateInput } from "../../../api/Request/testApplication";
import {  JobAppCOde, JobApplicDtls } from "../../../api/response/testapplication.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";
import { jobApplicDomainRepository, jobApplicDomainService, jobAppListParams } from "../../../domain/admin/jobapplicationDomain";
import { CreateAdminInput } from "../../../api/Request/admin";

class JobApplicService implements jobApplicDomainService {
    private readonly JobApplicRepo: jobApplicDomainRepository;

    constructor(repo: jobApplicDomainRepository) {
        this.JobApplicRepo = repo;
    }
    async generateJobApplicationCode(groupId: string): Promise<ApiResponse<JobAppCOde> | ErrorResponse> {
        try {
            return await this.JobApplicRepo.generateJobApplicationCode(groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating app code',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteJobApplic(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.JobApplicRepo.findJobApplicIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'JobApplic not found',
                    StatusCodes.BAD_REQUEST,
                    'Error JobApplic not found'
                );
            }

           
            return await this.JobApplicRepo.deleteJobApplic(id, userId);
        } catch (error:any) {
            return createErrorResponse(
                'Error delete JobApplic',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }    }
    async getJobApplicList(params:jobAppListParams, userId: string , groupId:string): Promise<PaginationResult<JobApplicDtls> | ErrorResponse> {
        try {
            return await this.JobApplicRepo.getJobApplicList(params,userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving JobApplic list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async findJobApplicById(id: string): Promise<ApiResponse<JobApplicDtls> | ErrorResponse> {
       try {
        const isExist = await this.JobApplicRepo.findJobApplicIdExist(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'JobApplic not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.JobApplicRepo.findJobApplicById(id)
         
       } catch (error:any) {
        return createErrorResponse(
            'Error creating JobApplic',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async updateJobApplic(JobApplicInput: JobApplicUpdateInput,id: string,userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
           const isExist = await this.JobApplicRepo.findJobApplicIdExist(JobApplicInput.id)

           if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
            return isExist as ErrorResponse;
           }

           if(!isExist){
            return createErrorResponse(
                'JobApplic not found.',
                StatusCodes.CONFLICT
            );
           }
            
            // Create the JobApplic
            return await this.JobApplicRepo.updateJobApplic(JobApplicInput,id, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating JobApplic',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new JobApplic after validating input and checking for duplicates
     * @param JobApplicInput - The JobApplic data to create
     * @returns ApiResponse containing the created JobApplic, or error response
     */
    async createJobApplic(JobApplicInput: JobApplicCreateInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
             
            const isExist = await this.JobApplicRepo.checkCodeExist(JobApplicInput.jobAppCode, groupId)

             if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                        return isExist as ErrorResponse;
                       }
            
                       if(!isExist){
                        return createErrorResponse(
                            'code already found.',
                            StatusCodes.CONFLICT
                        );
                       }

            return await this.JobApplicRepo.createJobApplic(JobApplicInput, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating JobApplic',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function NewJobApplicServiceRegister(JobApplicRepo: jobApplicDomainRepository): jobApplicDomainService {
    return new JobApplicService(JobApplicRepo)
}