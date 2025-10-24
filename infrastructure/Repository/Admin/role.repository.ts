import { StatusCodes } from "http-status-codes";
import { Db, ObjectId } from "mongodb";
import { UpdateRoleInput, CreateRoleInput } from "../../../api/Request/role";
import { Role, RoleDtls } from "../../../api/response/role.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import {  roleDomainRepository , roleDomainService , roleListParams } from "../../../domain/admin/roleDomain";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import  RoleModel  from "../../../app/model/role";

/**
 * Repository class for handling role-related database operations
 */
class roleRepository implements roleDomainRepository {
    private readonly db: Db;

    constructor(db: Db) {
        this.db = db;
    }
    
    async findrole(id: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await RoleModel.countDocuments({
        _id: new ObjectId(id),
        isActive:true,
        isDelete:false,

      });

      return count >= 1;
    } catch (error: any) {
      return createErrorResponse(
        "Error finding role in product",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }    }
    async deleterole(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
                 const delteProduct = await RoleModel.findOneAndUpdate(
                     { _id: new ObjectId(id), isActive: true, isDelete: false },
                     {
                         $set: {
                             isDelete:true,
                             modifiedBy:new ObjectId(userId),
                             updatedAt: new Date()
                         }
                     },
                     { new: true }
                 );
       
                 if (!delteProduct) {
                     return createErrorResponse(
                         'Error in role delete',
                         StatusCodes.NOT_FOUND,
                         'role with given ID not found'
                     );
                 }
                 
                 const result: SuccessMessage = {
                   message: 'role deleted success.'
                   };
                 return successResponse("role deleted successfully", StatusCodes.OK,result );
       
             } catch (error: any) {
                 return createErrorResponse(
                     'Error delete role',
                     StatusCodes.INTERNAL_SERVER_ERROR,
                     error.message
                 );
             }

    }
    async getroleList(params: roleListParams, groupId:string): Promise<PaginationResult<RoleDtls> | ErrorResponse> {
        try {
            const {page, limit,type}= params

              const pipeline:any = [
                {
                  $match: {
                    isActive: true,
                    isDelete: false,
                    groupingId: new ObjectId(groupId)
                  }
                },
                {
                  $lookup: {
                    from: 'admins', 
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                  }
                },
                {
                  $lookup: {
                    from: 'admins',
                    localField: 'modifiedBy',
                    foreignField: '_id',
                    as: 'modifiedBy'
                  }
                },
                {
                  $project: {
                    roleName: 1,
                    isActive: 1,
                    isDelete: 1,
                    createdBy: { $arrayElemAt: ['$createdBy.name', 0] }, 
                    modifiedBy: { $arrayElemAt: ['$modifiedBy.name', 0] },
                  }
                },
               
              ];

              if (type !== 'all') {                
              pipeline.push(
                { $skip: page * limit },
                { $limit: limit }
              );
            }
              
              const roleDtls = await RoleModel.aggregate(pipeline);
              const count = await RoleModel.countDocuments({isActive : 1 , isDelete: 0})
           return  Pagination(count, roleDtls,limit,page)
       } catch (error:any) {
           return createErrorResponse(
               'Error retrieving role details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }   
     }
   
   async findroleById(id: string): Promise<ApiResponse<RoleDtls> | ErrorResponse> {
       try {
          
           const role = await RoleModel.findOne({
               _id: new ObjectId(id),
               isActive: true,
               isDelete: false
           }).populate('createdBy', 'name').populate('modifiedBy', 'name')

           if (!role) {
               return createErrorResponse('role not found.', StatusCodes.BAD_REQUEST, 'Error role not found');
           }

           const result: RoleDtls = {
               _id: role._id.toString(),
               name: role.roleName,
               isActive: role.isActive,
               createdAt: role.createdAt,
               updatedAt: role.updatedAt,
               createdBy: role.createdBy.toString(),
               modifiedBy: role.modifiedBy ? role.modifiedBy.toString() : ""

           };

           return successResponse('role details retrieved successfully', StatusCodes.OK, result);
           
       } catch (error: any) {
           return createErrorResponse(
               'Error retrieving role details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }
    }
    async findroleId(id: string): Promise<Boolean | ErrorResponse> {
       try {
        const count = await RoleModel.countDocuments({
            _id: new ObjectId(id) ,   
          });

          console.log(count);
          
          return count == 1
       } catch (error:any) {
        return createErrorResponse(
            'Error  role not found',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async findroleNameForUpdate(name: string, id: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await this.db.collection('roles').countDocuments({
              _id: { $ne: new ObjectId(id) },  
              roleName: name.trim(),       
              isDelete: false,       
              isActive: true     
            });
            
            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error checking role name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updaterole(roleInput: UpdateRoleInput,  userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const input = {
                name: roleInput.name.trim(),
                
            };

                await RoleModel.updateOne(
                    { _id: new ObjectId(roleInput.id) },
                    {
                        $set: {
                            roleName: input.name,
                            modifiedBy: new ObjectId(userId),
                            
                        }
                    }
                );
            

            const result: SuccessMessage = {
                message: 'role update success.'
            };

            return successResponse("role updated successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error update role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Check if a role with the given name already exists
     * @param name - The role name to check
     * @returns Object containing count and status code, or error response
     */
    async findroleNameExist(name: string, groupId: string): Promise<{ count: number, statusCode: number } | ErrorResponse> {
        try {
            const count = await this.db.collection('roles').countDocuments({
                name: name.trim(),
                isDelete: false,
                isActive: true,
                groupingId: new ObjectId(groupId)
            });

            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error checking role name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new role
     * @param roleInput - The role data to create
     * @returns ApiResponse containing the created role, or error response
     */
    async createrole(roleInput: CreateRoleInput,  userId: string,groupId: string): Promise<ApiResponse<Role> | ErrorResponse> {
        try {
          
         
            const input = {
            roleName: roleInput.name.trim(),
              
            createdBy: new ObjectId(userId),
            modifiedBy: null,
            groupingId: new ObjectId(groupId)
            };            
            await RoleModel.create(input);      
           
          
            const result: Role = {
                name: roleInput.name
            };
         
            return successResponse("role created successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

/**
 * Factory function to create a new roleRepository instance
 * @param db - MongoDB database instance
 * @returns roleDomainRepository instance
 */
export function NewroleRrpository(db: Db): roleDomainRepository {
    return new roleRepository(db);
}