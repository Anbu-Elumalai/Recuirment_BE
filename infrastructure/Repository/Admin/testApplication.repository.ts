import { StatusCodes } from "http-status-codes";
import { JobApplicCreateInput, JobApplicUpdateInput } from "../../../api/Request/testApplication";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { JobAppCOde, JobApplicDtls } from "../../../api/response/testapplication.response";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { jobApplicDomainRepository, jobAppListParams } from "../../../domain/admin/jobapplicationDomain";
import { Db, ObjectId } from "mongodb";
import { createErrorResponse } from "../../../utils/common/errors";
import { successResponse } from "../../../utils/common/commonResponse";
import jobApplication from "../../../app/model/testApplication";
import crypto from "crypto";

class JobApplicationApplicationRepository implements jobApplicDomainRepository {

    private readonly db: Db
    constructor(db: Db) {
        this.db = db
    }
    
    async checkCodeExist(code: string , groupId: string): Promise<Boolean | ErrorResponse>{
        try {
        const findCodeExist = await jobApplication.countDocuments({
               jobAppCode:code
           })

         return findCodeExist === 0
        } catch (error:any) {
             return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async generateJobApplicationCode(groupId: string): Promise<ApiResponse<JobAppCOde> | ErrorResponse>{
      try {
           let code = ""            
          
           let exist = true

           while (exist) {
              
            const jobCode = crypto.randomBytes(3).toString("hex")

            console.log(jobCode,'kkkkkk');
            
            code = `AC_${jobCode}`
             const findCodeExist = await jobApplication.countDocuments({
               jobAppCode:code,
               groupingId: new ObjectId(groupId)
           })
             
           if(findCodeExist == 0){
              exist = false
           }
           }

           const result : JobAppCOde={
            code: code
           }

         return successResponse("Application code successfully", StatusCodes.OK, result);
      } catch (error:any) {
         return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
      }
    }

    async createJobApplic(JobApplicInput: JobApplicCreateInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const obj = {
                jobAppCode: JobApplicInput.jobAppCode,
                jobApplicationName: JobApplicInput.jobApplicationName,
                location: JobApplicInput.location,
                description: JobApplicInput.description,
                appliedRoles: new ObjectId(JobApplicInput.appliedRoles),
                statusHistory: [
                    {
                        status: "open",
                        changedAt: new Date(),
                    },
                ],
                createdBy: new ObjectId(userId),
                groupingId: new ObjectId(groupId)
            };

            // Create and save
            const newJobApplication = new jobApplication(obj);
            await newJobApplication.save();

            const result: SuccessMessage = {
                message: 'Application created success.'
            };
            return successResponse("Application created successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
   async updateJobApplic(JobApplicInput: JobApplicUpdateInput,id:string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            console.log("llllllllllllllllllllllllllll")
            await jobApplication.updateOne(
                { _id: new ObjectId(id) ,
                    isActive:true,
                    isDelete:false
                },
                
                {
                    $set: {
                        jobAppCode: JobApplicInput.jobAppCode,
                        jobApplicationName: JobApplicInput.jobApplicationName,
                        location: JobApplicInput.location,
                        description: JobApplicInput.description,
                        appliedRoles: new ObjectId(JobApplicInput.appliedRoles),
                         modifiedBy:new ObjectId( userId),
                    },
                    $push: {
                        statusHistory: {
                            status: JobApplicInput.status || "closed",
                            changedAt: new Date(),
                        },
                    },
                }
            );
            console.log("llllllllllllllllllllllllllll")

             const result: SuccessMessage = {
                            message: 'job application update success.'
                        };
            
                        return successResponse("job application updated successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error updating job application',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findJobApplicIdExist(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await jobApplication.countDocuments({
                _id: new ObjectId(id),
            });

            console.log(count);

            return count == 1
        } catch (error: any) {
            return createErrorResponse(
                'Error  group not found',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findJobApplicById(id: string): Promise<ApiResponse<JobApplicDtls> | ErrorResponse> {
        try {
            const jobap = await jobApplication.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false
            });

            if (!jobap) {
                return createErrorResponse(
                    'Error  group not found',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Job application not found"
                );
            }
            const result: JobApplicDtls = {
                _id: jobap?._id.toString(),
                appliedRoles: jobap?.appliedRoles.toString(),
                description: jobap?.description,
                jobAppCode: jobap?.jobAppCode,
                jobApplicationName: jobap?.jobApplicationName,
                location: jobap?.location ? jobap?.location : "",
                statusHistory: jobap?.statusHistory,
                createdAt: jobap?.createdAt,
                createdBy: jobap?.createdBy.toString(),
                isActive: jobap?.isActive,
                updatedAt: jobap?.updatedAt,
                modifiedBy: jobap?.modifiedBy ? jobap?.modifiedBy.toString() : ""
            }

            return successResponse('group details retrieved successfully', StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getJobApplicList(params: jobAppListParams, userId: string, groupId: string): Promise<PaginationResult<JobApplicDtls> | ErrorResponse> {
        try {

            const { page, limit, type } = params

            const pipeline: any = [
                {
                    $match: {
                        isActive: true,
                        isDelete: false,
                        createdBy: new ObjectId(userId),
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
                    $lookup: {
                        from: "roles",
                        localField: "appliedRoles",
                        foreignField: "_id",
                        as: "role",
                    },
                },
                {
                    $project: {
                        jobAppCode: 1,
                        jobApplicationName: 1,
                        location: 1,
                        description: 1,
                        appliedRoles: { $arrayElemAt: ['$role.roleName', 0] },
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

            const groupDtls = await jobApplication.aggregate(pipeline);
            const count = await jobApplication.countDocuments({ isActive: 1, isDelete: 0 })
            return Pagination(count, groupDtls, limit, page)


        } catch (error: any) {
            return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteJobApplic(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const delteProduct = await jobApplication.findOneAndUpdate(
                { _id: new ObjectId(id), isActive: true, isDelete: false },
                {
                    $set: {
                        isDelete: true,
                        modifiedBy: new ObjectId(userId),
                        updatedAt: new Date()
                    }
                },
                { new: true }
            );

            if (!delteProduct) {
                return createErrorResponse(
                    'Error in group delete',
                    StatusCodes.NOT_FOUND,
                    'group with given ID not found'
                );
            }

            const result: SuccessMessage = {
                message: 'group deleted success.'
            };
            return successResponse("group deleted successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function newJobapplicRepositoryRegister(db: Db): jobApplicDomainRepository {
    return new JobApplicationApplicationRepository(db)
}