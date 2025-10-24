import { StatusCodes } from "http-status-codes";
import { Db, ObjectId } from "mongodb";
import { UpdateskillInput, CreateskillInput } from "../../../api/Request/skill";
import { skill, skillDtls } from "../../../api/response/skill.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import {  skillDomainRepository , skillDomainService , skillListParams } from "../../../domain/admin/skillDomain";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import  skillModel  from "../../../app/model/skill";

/**
 * Repository class for handling skill-related database operations
 */
class skillRepository implements skillDomainRepository {
    private readonly db: Db;

    constructor(db: Db) {
        this.db = db;
    }
    
    async findskill(id: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await skillModel.countDocuments({
        skill: new ObjectId(id),
        isActive:true,
        isDelete:false
      });

      return count >= 1;
    } catch (error: any) {
      return createErrorResponse(
        "Error finding skill in product",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }    }
    async deleteskill(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
                 const delteProduct = await skillModel.findOneAndUpdate(
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
                         'Error in skill delete',
                         StatusCodes.NOT_FOUND,
                         'skill with given ID not found'
                     );
                 }
                 
                 const result: SuccessMessage = {
                   message: 'skill deleted success.'
                   };
                 return successResponse("skill deleted successfully", StatusCodes.OK,result );
       
             } catch (error: any) {
                 return createErrorResponse(
                     'Error delete skill',
                     StatusCodes.INTERNAL_SERVER_ERROR,
                     error.message
                 );
             }

    }
    async getskillList(params: skillListParams, groupId: string): Promise<PaginationResult<skillDtls> | ErrorResponse> {
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
                    skillName: 1,
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
              
              const skillDtls = await skillModel.aggregate(pipeline);
              const count = await skillModel.countDocuments({isActive : 1 , isDelete: 0})
           return  Pagination(count, skillDtls,limit,page)
       } catch (error:any) {
           return createErrorResponse(
               'Error retrieving skill details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }   
     }
   
   async findskillById(id: string): Promise<ApiResponse<skillDtls> | ErrorResponse> {
       try {
          
           const skill = await skillModel.findOne({
               _id: new ObjectId(id),
               isActive: true,
               isDelete: false
           }).populate('createdBy', 'name').populate('modifiedBy', 'name')

           if (!skill) {
               return createErrorResponse('skill not found.', StatusCodes.BAD_REQUEST, 'Error skill not found');
           }

           const result: skillDtls = {
               _id: skill._id.toString(),
               name: skill.skillName,
               isActive: skill.isActive,
               createdAt: skill.createdAt,
               updatedAt: skill.updatedAt,
               createdBy: skill.createdBy.toString(),
               modifiedBy: skill.modifiedBy ? skill.modifiedBy.toString() : ""

           };

           return successResponse('skill details retrieved successfully', StatusCodes.OK, result);
           
       } catch (error: any) {
           return createErrorResponse(
               'Error retrieving skill details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }
    }
    async findskillId(id: string): Promise<Boolean | ErrorResponse> {
       try {
        const count = await skillModel.countDocuments({
            _id: new ObjectId(id) ,   
          });

          console.log(count);
          
          return count == 1
       } catch (error:any) {
        return createErrorResponse(
            'Error  skill not found',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async findskillNameForUpdate(name: string, id: string,groupId: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await this.db.collection('skills').countDocuments({
              _id: { $ne: new ObjectId(id) },  
              skillName: name.trim(),       
              isDelete: false,       
              isActive: true   ,
              groupingId: new ObjectId(groupId)  
            });
            
            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error checking skill name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateskill(skillInput: UpdateskillInput,  userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const input = {
                name: skillInput.name.trim(),
                modifiedBy: userId
            };

                await skillModel.updateOne(
                    { _id: new ObjectId(skillInput.id) },
                    {
                        $set: {
                            skillName: input.name,
                            modifiedBy: new ObjectId(userId),
                        }
                    }
                );
            

            const result: SuccessMessage = {
                message: 'skill update success.'
            };

            return successResponse("skill updated successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error update skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Check if a skill with the given name already exists
     * @param name - The skill name to check
     * @returns Object containing count and status code, or error response
     */
    async findskillNameExist(name: string, groupId: string): Promise<{ count: number, statusCode: number } | ErrorResponse> {
        try {
            const count = await this.db.collection('skills').countDocuments({
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
                'Error checking skill name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new skill
     * @param skillInput - The skill data to create
     * @returns ApiResponse containing the created skill, or error response
     */
    async createskill(skillInput: CreateskillInput,  userId: string , groupId: string): Promise<ApiResponse<skill> | ErrorResponse> {
        try {
          
         
            const input = {
            skillName: skillInput.name.trim(),
              
            createdBy: new ObjectId(userId),
            modifiedBy: null,
            groupingId:new ObjectId(groupId)
            };            
            await skillModel.create(input);      
           
          
            const result: skill = {
                name: skillInput.name
            };
         
            return successResponse("skill created successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

/**
 * Factory function to create a new skillRepository instance
 * @param db - MongoDB database instance
 * @returns skillDomainRepository instance
 */
export function NewskillRrpository(db: Db): skillDomainRepository {
    return new skillRepository(db);
}