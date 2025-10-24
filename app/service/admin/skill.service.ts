import { StatusCodes } from "http-status-codes";
import { CreateskillInput, UpdateskillInput } from "../../../api/Request/skill";
import { skill, skillDtls } from "../../../api/response/skill.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { skillDomainRepository, skillDomainService, skillListParams } from "../../../domain/admin/skillDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";

class skillService implements skillDomainService {
    private readonly skillRepo: skillDomainRepository;

    constructor(repo: skillDomainRepository) {
        this.skillRepo = repo;
    }
    async deleteskill(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.skillRepo.findskillId(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'skill not found',
                    StatusCodes.BAD_REQUEST,
                    'Error skill not found'
                );
            }

           
            return await this.skillRepo.deleteskill(id, userId);
        } catch (error:any) {
            return createErrorResponse(
                'Error delete skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }    }
    async getskillList(params: skillListParams, groupId: string): Promise<PaginationResult<skillDtls> | ErrorResponse> {
        try {
            return await this.skillRepo.getskillList(params, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving skill list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async findskillById(id: string): Promise<ApiResponse<skillDtls> | ErrorResponse> {
       try {
        const isExist = await this.skillRepo.findskillId(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'skill not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.skillRepo.findskillById(id)
         
       } catch (error:any) {
        return createErrorResponse(
            'Error creating skill',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async updateskill(skillInput: UpdateskillInput,userId: string, groupId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
           const isExist = await this.skillRepo.findskillId(skillInput.id)

           if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
            return isExist as ErrorResponse;
           }

           if(!isExist){
            return createErrorResponse(
                'skill not found.',
                StatusCodes.CONFLICT
            );
           }
            // Check for existing skill name
            const existingskill = await this.skillRepo.findskillNameForUpdate(skillInput.name, skillInput.id,groupId);

            // Handle potential error from repository
            if ('status' in existingskill && existingskill.status === 'error') {
                return existingskill as ErrorResponse;
            }

            // At this point, existingskill must be the success response type
            const skillExists = existingskill as { count: number; statusCode: number };
            
            // Check if skill already exists
            if (skillExists.statusCode === StatusCodes.OK && skillExists.count > 0) {
                return createErrorResponse(
                    'skill name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the skill
            return await this.skillRepo.updateskill(skillInput, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new skill after validating input and checking for duplicates
     * @param skillInput - The skill data to create
     * @returns ApiResponse containing the created skill, or error response
     */
    async createskill(skillInput: CreateskillInput, userId: string,groupId: string): Promise<ApiResponse<skill> | ErrorResponse> {
        try {
            
            // Check for existing skill name
            const existingskill = await this.skillRepo.findskillNameExist(skillInput.name,groupId);

            // Handle potential error from repository
            if ('status' in existingskill && existingskill.status === 'error') {
                return existingskill as ErrorResponse;
            }

            // At this point, existingskill must be the success response type
            const skillExists = existingskill as { count: number; statusCode: number };
            
            // Check if skill already exists
            if (skillExists.statusCode === StatusCodes.OK && skillExists.count > 0) {
                return createErrorResponse(
                    'skill name already exists',
                    StatusCodes.CONFLICT
                );
            }
                      
            // Create the skill
            return await this.skillRepo.createskill({name: skillInput.name.trim()}, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function NewskillServiceRegister(skillRepo: skillDomainRepository): skillDomainService {
    return new skillService(skillRepo)
}