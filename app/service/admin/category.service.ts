import { StatusCodes } from "http-status-codes";
import { CreatecategoryInput, UpdatecategoryInput } from "../../../api/Request/category";
import { Category, CategoryDtls } from "../../../api/response/category.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { categoryDomainRepository, categoryDomainService, categoryListParams } from "../../../domain/admin/categoryDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";

class categoryService implements categoryDomainService {
    private readonly categoryRepo: categoryDomainRepository;

    constructor(repo: categoryDomainRepository) {
        this.categoryRepo = repo;
    }
    async deletecategory(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.categoryRepo.findcategoryId(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'category not found',
                    StatusCodes.BAD_REQUEST,
                    'Error category not found'
                );
            }

           
            return await this.categoryRepo.deletecategory(id, userId);
        } catch (error:any) {
            return createErrorResponse(
                'Error delete category',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }    }
    async getcategoryList(params: categoryListParams, groupId:string): Promise<PaginationResult<CategoryDtls> | ErrorResponse> {
        try {
            return await this.categoryRepo.getcategoryList(params, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving category list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async findcategoryById(id: string): Promise<ApiResponse<CategoryDtls> | ErrorResponse> {
       try {
        const isExist = await this.categoryRepo.findcategoryId(id)

        if (typeof isExist !== 'boolean' &&'status' in isExist && isExist.status === 'error') {
         return isExist as ErrorResponse;
        }

         if(!isExist){
             return createErrorResponse(
                 'category not found.',
                 StatusCodes.CONFLICT
             );
         }

         return await this.categoryRepo.findcategoryById(id)
         
       } catch (error:any) {
        return createErrorResponse(
            'Error creating category',
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
       }
    }
    async updatecategory(categoryInput: UpdatecategoryInput,userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            
           const isExist = await this.categoryRepo.findcategoryId(categoryInput.id)

           if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
            return isExist as ErrorResponse;
           }

           if(!isExist){
            return createErrorResponse(
                'category not found.',
                StatusCodes.CONFLICT
            );
           }
            // Check for existing category name
            const existingcategory = await this.categoryRepo.findcategoryNameForUpdate(categoryInput.name, categoryInput.id, groupId);

            // Handle potential error from repository
            if ('status' in existingcategory && existingcategory.status === 'error') {
                return existingcategory as ErrorResponse;
            }

            // At this point, existingcategory must be the success response type
            const categoryExists = existingcategory as { count: number; statusCode: number };
            
            // Check if category already exists
            if (categoryExists.statusCode === StatusCodes.OK && categoryExists.count > 0) {
                return createErrorResponse(
                    'category name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the category
            return await this.categoryRepo.updatecategory(categoryInput, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating category',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new category after validating input and checking for duplicates
     * @param categoryInput - The category data to create
     * @returns ApiResponse containing the created category, or error response
     */
    async createcategory(categoryInput: CreatecategoryInput, userId: string, groupId: string): Promise<ApiResponse<Category> | ErrorResponse> {
        try {
            
            // Check for existing category name
            const existingcategory = await this.categoryRepo.findcategoryNameExist(categoryInput.name,groupId);

            // Handle potential error from repository
            if ('status' in existingcategory && existingcategory.status === 'error') {
                return existingcategory as ErrorResponse;
            }

            // At this point, existingcategory must be the success response type
            const categoryExists = existingcategory as { count: number; statusCode: number };
            
            // Check if category already exists
            if (categoryExists.statusCode === StatusCodes.OK && categoryExists.count > 0) {
                return createErrorResponse(
                    'category name already exists',
                    StatusCodes.CONFLICT
                );
            }
                      
            // Create the category
            return await this.categoryRepo.createcategory({name: categoryInput.name.trim()}, userId,groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating category',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function NewcategoryServiceRegister(categoryRepo: categoryDomainRepository): categoryDomainService {
    return new categoryService(categoryRepo)
}