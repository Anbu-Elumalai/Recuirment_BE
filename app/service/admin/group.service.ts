import { StatusCodes } from "http-status-codes";
import { CreategroupInput, UpdategroupInput } from "../../../api/Request/group";
import { group, groupDtls } from "../../../api/response/group.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { groupDomainRepository, groupDomainService, groupListParams } from "../../../domain/admin/groupDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";

class groupService implements groupDomainService {
    private readonly groupRepo: groupDomainRepository;

    constructor(repo: groupDomainRepository) {
        this.groupRepo = repo;
    }
  async  findLastInterviews(id: string):Promise<ApiResponse<{ count: number; statusCode: number }> | ErrorResponse>{
       try {
          return await this.groupRepo.findLastInterviews(id)

       } catch (error) {
         return createErrorResponse(
                    'find candidate in interview list error',
                    StatusCodes.BAD_REQUEST,
                    'Error find candidate in interview list error'
                );
       }
    }
    async deletegroup(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.groupRepo.findgroupId(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'group not found',
                    StatusCodes.BAD_REQUEST,
                    'Error group not found'
                );
            }

           
            return await this.groupRepo.deletegroup(id, userId);
        } catch (error:any) {
            return createErrorResponse(
                'Error delete group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }    }
    async getgroupList(params: groupListParams,userId: string, groupId: string): Promise<PaginationResult<groupDtls> | ErrorResponse> {
        try {
            return await this.groupRepo.getgroupList(params,userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving group list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async findgroupById(id: string): Promise<ApiResponse<groupDtls> | ErrorResponse> {
       try {
        const isExist = await this.groupRepo.findgroupId(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'group not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.groupRepo.findgroupById(id)
         
       } catch (error:any) {
        return createErrorResponse(
            'Error creating group',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async updategroup(groupInput: UpdategroupInput,userId: string ,groupId : string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
           const isExist = await this.groupRepo.findgroupId(groupInput.id)

           if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
            return isExist as ErrorResponse;
           }

           if(!isExist){
            return createErrorResponse(
                'group not found.',
                StatusCodes.CONFLICT
            );
           }
            // Check for existing group name
            const existinggroup = await this.groupRepo.findgroupNameForUpdate(groupInput.name, groupInput.id, groupId);

            // Handle potential error from repository
            if ('status' in existinggroup && existinggroup.status === 'error') {
                return existinggroup as ErrorResponse;
            }

            // At this point, existinggroup must be the success response type
            const groupExists = existinggroup as { count: number; statusCode: number };
            
            // Check if group already exists
            if (groupExists.statusCode === StatusCodes.OK && groupExists.count > 0) {
                return createErrorResponse(
                    'group name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the group
            return await this.groupRepo.updategroup(groupInput, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new group after validating input and checking for duplicates
     * @param groupInput - The group data to create
     * @returns ApiResponse containing the created group, or error response
     */
    async creategroup(groupInput: CreategroupInput, userId: string ,groupId : string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
            // Check for existing group name
            const existinggroup = await this.groupRepo.findgroupNameExist(groupInput.name,groupId);

            // Handle potential error from repository
            if ('status' in existinggroup && existinggroup.status === 'error') {
                return existinggroup as ErrorResponse;
            }

            // At this point, existinggroup must be the success response type
            const groupExists = existinggroup as { count: number; statusCode: number };
            
            // Check if group already exists
            if (groupExists.statusCode === StatusCodes.OK && groupExists.count > 0) {
                return createErrorResponse(
                    'group name already exists',
                    StatusCodes.CONFLICT
                );
            }
                      
            // Create the group
            return await this.groupRepo.creategroup({
                name: groupInput.name.trim(),
                candidateId: groupInput.candidateId,
                applicationId:groupInput.applicationId
               
            }, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function NewgroupServiceRegister(groupRepo: groupDomainRepository): groupDomainService {
    return new groupService(groupRepo)
}