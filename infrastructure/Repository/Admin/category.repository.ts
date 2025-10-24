import { StatusCodes } from "http-status-codes";
import { Db, ObjectId } from "mongodb";
import { UpdatecategoryInput, CreatecategoryInput } from "../../../api/Request/category";
import { Category, CategoryDtls } from "../../../api/response/category.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import {  categoryDomainRepository , categoryDomainService , categoryListParams } from "../../../domain/admin/categoryDomain";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import  categoryModel  from "../../../app/model/categories";

/**
 * Repository class for handling category-related database operations
 */
class categoryRepository implements categoryDomainRepository {
    private readonly db: Db;

    constructor(db: Db) {
        this.db = db;
    }
    
    async findcategory(id: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await categoryModel.countDocuments({
        _id: new ObjectId(id),
        isActive:true,
        isDelete:false,

      });

      return count >= 1;
    } catch (error: any) {
      return createErrorResponse(
        "Error finding category in product",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }    }
    async deletecategory(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
                 const delteProduct = await categoryModel.findOneAndUpdate(
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
                         'Error in category delete',
                         StatusCodes.NOT_FOUND,
                         'category with given ID not found'
                     );
                 }
                 
                 const result: SuccessMessage = {
                   message: 'category deleted success.'
                   };
                 return successResponse("category deleted successfully", StatusCodes.OK,result );
       
             } catch (error: any) {
                 return createErrorResponse(
                     'Error delete category',
                     StatusCodes.INTERNAL_SERVER_ERROR,
                     error.message
                 );
             }

    }
    async getcategoryList(params: categoryListParams, groupId:string): Promise<PaginationResult<CategoryDtls> | ErrorResponse> {
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
                    name: 1,
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
              
              const categoryDtls = await categoryModel.aggregate(pipeline);
              const count = await categoryModel.countDocuments({isActive : 1 , isDelete: 0})
           return  Pagination(count, categoryDtls,limit,page)
       } catch (error:any) {
           return createErrorResponse(
               'Error retrieving category details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }   
     }
   
   async findcategoryById(id: string): Promise<ApiResponse<CategoryDtls> | ErrorResponse> {
       try {
          
           const category = await categoryModel.findOne({
               _id: new ObjectId(id),
               isActive: true,
               isDelete: false
           }).populate('createdBy', 'name').populate('modifiedBy', 'name')

           if (!category) {
               return createErrorResponse('category not found.', StatusCodes.BAD_REQUEST, 'Error category not found');
           }

           const result: CategoryDtls = {
               _id: category._id.toString(),
               name: category.name,
               isActive: category.isActive,
               createdAt: category.createdAt,
               updatedAt: category.updatedAt,
               createdBy: category.createdBy.toString(),
               modifiedBy: category.modifiedBy ? category.modifiedBy.toString() : ""

           };

           return successResponse('category details retrieved successfully', StatusCodes.OK, result);
           
       } catch (error: any) {
           return createErrorResponse(
               'Error retrieving category details',
               StatusCodes.INTERNAL_SERVER_ERROR,
               error.message
           );
       }
    }
    async findcategoryId(id: string): Promise<Boolean | ErrorResponse> {
       try {
        const count = await categoryModel.countDocuments({
            _id: new ObjectId(id) ,   
          });

          console.log(count);
          
          return count == 1
       } catch (error:any) {
        return createErrorResponse(
            'Error  category not found',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async findcategoryNameForUpdate(name: string, id: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await categoryModel.countDocuments({
              _id: { $ne: new ObjectId(id) },  
              name: name.trim(),       
              isDelete: false,       
              isActive: true     
            });
            
            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error checking category name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updatecategory(categoryInput: UpdatecategoryInput,  userId: string,groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const input = {
                name: categoryInput.name.trim(),
                
            };

                await categoryModel.updateOne(
                    { _id: new ObjectId(categoryInput.id) },
                    {
                        $set: {
                            name: input.name,
                            modifiedBy: new ObjectId(userId),
                            
                        }
                    }
                );
            

            const result: SuccessMessage = {
                message: 'category update success.'
            };

            return successResponse("category updated successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error update category',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Check if a category with the given name already exists
     * @param name - The category name to check
     * @returns Object containing count and status code, or error response
     */
    async findcategoryNameExist(name: string, groupId: string): Promise<{ count: number, statusCode: number } | ErrorResponse> {
        try {
            const count = await categoryModel.countDocuments({
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
                'Error checking category name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new category
     * @param categoryInput - The category data to create
     * @returns ApiResponse containing the created category, or error response
     */
    async createcategory(categoryInput: CreatecategoryInput,  userId: string,groupId: string): Promise<ApiResponse<Category> | ErrorResponse> {
        try {
          
         
            const input = {
            name: categoryInput.name.trim(),
              
            createdBy: new ObjectId(userId),
            modifiedBy: null,
            groupingId: new ObjectId(groupId)
            };            
            await categoryModel.create(input);      
           
          
            const result: Category = {
                name: categoryInput.name
            };
         
            return successResponse("category created successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating category',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

/**
 * Factory function to create a new categoryRepository instance
 * @param db - MongoDB database instance
 * @returns categoryDomainRepository instance
 */
export function NewcategoryRrpository(db: Db): categoryDomainRepository {
    return new categoryRepository(db);
}