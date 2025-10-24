import { StatusCodes } from "http-status-codes";
import { CreateRoleInput, UpdateRoleInput } from "../../../api/Request/role";
import { Role, RoleDtls } from "../../../api/response/role.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { roleDomainRepository, roleDomainService, roleListParams } from "../../../domain/admin/roleDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";

class roleService implements roleDomainService {
    private readonly roleRepo: roleDomainRepository;

    constructor(repo: roleDomainRepository) {
        this.roleRepo = repo;
    }
    async deleterole(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.roleRepo.findroleId(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'role not found',
                    StatusCodes.BAD_REQUEST,
                    'Error role not found'
                );
            }

           
            return await this.roleRepo.deleterole(id, userId);
        } catch (error:any) {
            return createErrorResponse(
                'Error delete role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }    }
    async getroleList(params: roleListParams, groupId:string): Promise<PaginationResult<RoleDtls> | ErrorResponse> {
        try {
            return await this.roleRepo.getroleList(params, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving role list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async findroleById(id: string): Promise<ApiResponse<RoleDtls> | ErrorResponse> {
       try {
        const isExist = await this.roleRepo.findroleId(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'role not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.roleRepo.findroleById(id)
         
       } catch (error:any) {
        return createErrorResponse(
            'Error creating role',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async updaterole(roleInput: UpdateRoleInput,userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
           const isExist = await this.roleRepo.findroleId(roleInput.id)

           if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
            return isExist as ErrorResponse;
           }

           if(!isExist){
            return createErrorResponse(
                'role not found.',
                StatusCodes.CONFLICT
            );
           }
            // Check for existing role name
            const existingrole = await this.roleRepo.findroleNameForUpdate(roleInput.name, roleInput.id, groupId);

            // Handle potential error from repository
            if ('status' in existingrole && existingrole.status === 'error') {
                return existingrole as ErrorResponse;
            }

            // At this point, existingrole must be the success response type
            const roleExists = existingrole as { count: number; statusCode: number };
            
            // Check if role already exists
            if (roleExists.statusCode === StatusCodes.OK && roleExists.count > 0) {
                return createErrorResponse(
                    'role name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the role
            return await this.roleRepo.updaterole(roleInput, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new role after validating input and checking for duplicates
     * @param roleInput - The role data to create
     * @returns ApiResponse containing the created role, or error response
     */
    async createrole(roleInput: CreateRoleInput, userId: string, groupId: string): Promise<ApiResponse<Role> | ErrorResponse> {
        try {
            
            // Check for existing role name
            const existingrole = await this.roleRepo.findroleNameExist(roleInput.name,groupId);

            // Handle potential error from repository
            if ('status' in existingrole && existingrole.status === 'error') {
                return existingrole as ErrorResponse;
            }

            // At this point, existingrole must be the success response type
            const roleExists = existingrole as { count: number; statusCode: number };
            
            // Check if role already exists
            if (roleExists.statusCode === StatusCodes.OK && roleExists.count > 0) {
                return createErrorResponse(
                    'role name already exists',
                    StatusCodes.CONFLICT
                );
            }
                      
            // Create the role
            return await this.roleRepo.createrole({name: roleInput.name.trim()}, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function NewroleServiceRegister(roleRepo: roleDomainRepository): roleDomainService {
    return new roleService(roleRepo)
}