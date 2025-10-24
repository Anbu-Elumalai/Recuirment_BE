import { StatusCodes } from "http-status-codes";
import { CreatecandidateTypeInput, UpdatecandidateTypeInput } from "../../../api/Request/candidateType";
import { candidateType, candidateTypeDtls } from "../../../api/response/candidateType.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { candidateTypeDomainRepository, candidateTypeDomainService, candidateTypeListParams } from "../../../domain/admin/candidatetypeDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";

class candidateTypeService implements candidateTypeDomainService {
    private readonly candidateTypeRepo: candidateTypeDomainRepository;

    constructor(repo: candidateTypeDomainRepository) {
        this.candidateTypeRepo = repo;
    }
    async deletecandidateType(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.candidateTypeRepo.findcandidateTypeId(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'candidateType not found',
                    StatusCodes.BAD_REQUEST,
                    'Error candidateType not found'
                );
            }

           
            return await this.candidateTypeRepo.deletecandidateType(id, userId);
        } catch (error:any) {
            return createErrorResponse(
                'Error delete candidateType',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }    }
    async getcandidateTypeList(params: candidateTypeListParams, groupId:string): Promise<PaginationResult<candidateTypeDtls> | ErrorResponse> {
        try {
            return await this.candidateTypeRepo.getcandidateTypeList(params, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving candidateType list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async findcandidateTypeById(id: string): Promise<ApiResponse<candidateTypeDtls> | ErrorResponse> {
       try {
        const isExist = await this.candidateTypeRepo.findcandidateTypeId(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'candidateType not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.candidateTypeRepo.findcandidateTypeById(id)
         
       } catch (error:any) {
        return createErrorResponse(
            'Error creating candidateType',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async updatecandidateType(candidateTypeInput: UpdatecandidateTypeInput,userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
           const isExist = await this.candidateTypeRepo.findcandidateTypeId(candidateTypeInput.id)

           if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
            return isExist as ErrorResponse;
           }

           if(!isExist){
            return createErrorResponse(
                'candidateType not found.',
                StatusCodes.CONFLICT
            );
           }
            // Check for existing candidateType name
            const existingcandidateType = await this.candidateTypeRepo.findcandidateTypeNameForUpdate(candidateTypeInput.name, candidateTypeInput.id, groupId);

            // Handle potential error from repository
            if ('status' in existingcandidateType && existingcandidateType.status === 'error') {
                return existingcandidateType as ErrorResponse;
            }

            // At this point, existingcandidateType must be the success response type
            const candidateTypeExists = existingcandidateType as { count: number; statusCode: number };
            
            // Check if candidateType already exists
            if (candidateTypeExists.statusCode === StatusCodes.OK && candidateTypeExists.count > 0) {
                return createErrorResponse(
                    'candidateType name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the candidateType
            return await this.candidateTypeRepo.updatecandidateType(candidateTypeInput, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating candidateType',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new candidateType after validating input and checking for duplicates
     * @param candidateTypeInput - The candidateType data to create
     * @returns ApiResponse containing the created candidateType, or error response
     */
    async createcandidateType(candidateTypeInput: CreatecandidateTypeInput, userId: string, groupId: string): Promise<ApiResponse<candidateType> | ErrorResponse> {
        try {
            
            // Check for existing candidateType name
            const existingcandidateType = await this.candidateTypeRepo.findcandidateTypeNameExist(candidateTypeInput.name,groupId);

            // Handle potential error from repository
            if ('status' in existingcandidateType && existingcandidateType.status === 'error') {
                return existingcandidateType as ErrorResponse;
            }

            // At this point, existingcandidateType must be the success response type
            const candidateTypeExists = existingcandidateType as { count: number; statusCode: number };
            
            // Check if candidateType already exists
            if (candidateTypeExists.statusCode === StatusCodes.OK && candidateTypeExists.count > 0) {
                return createErrorResponse(
                    'candidateType name already exists',
                    StatusCodes.CONFLICT
                );
            }
                      
            // Create the candidateType
            return await this.candidateTypeRepo.createcandidateType({name: candidateTypeInput.name.trim()}, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating candidateType',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function NewcandidateTypeServiceRegister(candidateTypeRepo: candidateTypeDomainRepository): candidateTypeDomainService {
    return new candidateTypeService(candidateTypeRepo)
}