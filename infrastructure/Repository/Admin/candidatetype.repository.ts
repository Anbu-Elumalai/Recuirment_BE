import { StatusCodes } from "http-status-codes";
import { Db, ObjectId } from "mongodb";
import { UpdatecandidateTypeInput, CreatecandidateTypeInput } from "../../../api/Request/candidateType";
import { candidateType, candidateTypeDtls } from "../../../api/response/candidateType.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import {  candidateTypeDomainRepository , candidateTypeDomainService , candidateTypeListParams } from "../../../domain/admin/candidatetypeDomain";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import  candidateTypeModel  from "../../../app/model/candidatetype";

/**
 * Repository class for handling candidateType-related database operations
 */
class candidateTypeRepository implements candidateTypeDomainRepository {
    private readonly db: Db;

    constructor(db: Db) {
        this.db = db;
    }
    
    async findcandidateType(id: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await candidateTypeModel.countDocuments({
        _id: new ObjectId(id),
        isActive:true,
        isDelete:false,

      });

      return count >= 1;
    } catch (error: any) {
      return createErrorResponse(
        "Error finding candidateType in product",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }    }
    async deletecandidateType(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
                 const delteProduct = await candidateTypeModel.findOneAndUpdate(
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
                         'Error in candidateType delete',
                         StatusCodes.NOT_FOUND,
                         'candidateType with given ID not found'
                     );
                 }
                 
                 const result: SuccessMessage = {
                   message: 'candidateType deleted success.'
                   };
                 return successResponse("candidateType deleted successfully", StatusCodes.OK,result );
       
             } catch (error: any) {
                 return createErrorResponse(
                     'Error delete candidateType',
                     StatusCodes.INTERNAL_SERVER_ERROR,
                     error.message
                 );
             }

    }
    async getcandidateTypeList(params: candidateTypeListParams, groupId:string): Promise<PaginationResult<candidateTypeDtls> | ErrorResponse> {
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
                    candidateTypeName: 1,
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
              
              const candidateTypeDtls = await candidateTypeModel.aggregate(pipeline);
              const count = await candidateTypeModel.countDocuments({isActive : 1 , isDelete: 0})
           return  Pagination(count, candidateTypeDtls,limit,page)
       } catch (error:any) {
           return createErrorResponse(
               'Error retrieving candidateType details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }   
     }
   
   async findcandidateTypeById(id: string): Promise<ApiResponse<candidateTypeDtls> | ErrorResponse> {
       try {
          
           const candidateType = await candidateTypeModel.findOne({
               _id: new ObjectId(id),
               isActive: true,
               isDelete: false
           }).populate('createdBy', 'name').populate('modifiedBy', 'name')

           if (!candidateType) {
               return createErrorResponse('candidateType not found.', StatusCodes.BAD_REQUEST, 'Error candidateType not found');
           }

           const result: candidateTypeDtls = {
               _id: candidateType._id.toString(),
               name: candidateType.candidateTypeName,
               isActive: candidateType.isActive,
               createdAt: candidateType.createdAt,
               updatedAt: candidateType.updatedAt,
               createdBy: candidateType.createdBy.toString(),
               modifiedBy: candidateType.modifiedBy ? candidateType.modifiedBy.toString() : ""

           };

           return successResponse('candidateType details retrieved successfully', StatusCodes.OK, result);
           
       } catch (error: any) {
           return createErrorResponse(
               'Error retrieving candidateType details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }
    }
    async findcandidateTypeId(id: string): Promise<Boolean | ErrorResponse> {
       try {
        const count = await candidateTypeModel.countDocuments({
            _id: new ObjectId(id) ,   
          });

          console.log(count);
          
          return count == 1
       } catch (error:any) {
        return createErrorResponse(
            'Error  candidateType not found',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async findcandidateTypeNameForUpdate(name: string, id: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await this.db.collection('candidateTypes').countDocuments({
              _id: { $ne: new ObjectId(id) },  
              candidateTypeName: name.trim(),       
              isDelete: false,       
              isActive: true     
            });
            
            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error checking candidateType name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updatecandidateType(candidateTypeInput: UpdatecandidateTypeInput,  userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const input = {
                name: candidateTypeInput.name.trim(),
                
            };

                await candidateTypeModel.updateOne(
                    { _id: new ObjectId(candidateTypeInput.id) },
                    {
                        $set: {
                            candidateTypeName: input.name,
                            modifiedBy: new ObjectId(userId),
                            
                        }
                    }
                );
            

            const result: SuccessMessage = {
                message: 'candidateType update success.'
            };

            return successResponse("candidateType updated successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error update candidateType',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Check if a candidateType with the given name already exists
     * @param name - The candidateType name to check
     * @returns Object containing count and status code, or error response
     */
    async findcandidateTypeNameExist(name: string, groupId: string): Promise<{ count: number, statusCode: number } | ErrorResponse> {
        try {
            const count = await this.db.collection('candidateTypes').countDocuments({
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
                'Error checking candidateType name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new candidateType
     * @param candidateTypeInput - The candidateType data to create
     * @returns ApiResponse containing the created candidateType, or error response
     */
    async createcandidateType(candidateTypeInput: CreatecandidateTypeInput,  userId: string,groupId: string): Promise<ApiResponse<candidateType> | ErrorResponse> {
        try {
          
         
            const input = {
            candidateTypeName: candidateTypeInput.name.trim(),
              
            createdBy: new ObjectId(userId),
            modifiedBy: null,
            groupingId: new ObjectId(groupId)
            };            
            await candidateTypeModel.create(input);      
           
          
            const result: candidateType = {
                name: candidateTypeInput.name
            };
         
            return successResponse("candidateType created successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating candidateType',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

/**
 * Factory function to create a new candidateTypeRepository instance
 * @param db - MongoDB database instance
 * @returns candidateTypeDomainRepository instance
 */
export function NewcandidateTypeRrpository(db: Db): candidateTypeDomainRepository {
    return new candidateTypeRepository(db);
}