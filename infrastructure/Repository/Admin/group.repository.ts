import { StatusCodes } from "http-status-codes";
import { Db, ObjectId } from "mongodb";
import { UpdategroupInput, CreategroupInput } from "../../../api/Request/group";
import { group, groupDtls } from "../../../api/response/group.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { groupDomainRepository, groupDomainService, groupListParams } from "../../../domain/admin/groupDomain";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import groupModel from "../../../app/model/group";
import lastInterviewDate from "../../../app/model/lastInterviewDate";
import adminUser from "../../../app/model/admin.user";
import { CandidateModel } from "../../../app/model/candidate";
import { CandidateDtls } from "../../../api/response/candidate.response";
import subscription from "../../../app/model/subscription";
import lanchAssessment from "../../../app/model/lanchAssessment";

/**
 * Repository class for handling group-related database operations
 */
class groupRepository implements groupDomainRepository {
    private readonly db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async findLasttest(id: string): Promise<ApiResponse<{ count: number; statusCode: number }> | ErrorResponse> {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const lastInterviewExist = await CandidateModel.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false
            })

            if (!lastInterviewExist) {
                return createErrorResponse(
                    'Error  candidate not found',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Error  candidate not found"
                );
            }
            // Find interviews for the candidate in the last 3 months using createdAt
            const interviews = await lastInterviewDate
                .find({
                    candidateId: new ObjectId(lastInterviewExist?._id),
                    createdAt: { $gte: threeMonthsAgo }, // using createdAt instead of interviewDate
                })
                .sort({ createdAt: -1 }).limit(1); // latest first


            return successResponse("Last interview date fetch successfully", StatusCodes.OK,
                { count: interviews.length, statusCode: StatusCodes.OK }
            );

        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }


    async findgroup(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await groupModel.countDocuments({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false
            });

            return count >= 1;
        } catch (error: any) {
            return createErrorResponse(
                "Error finding group in product",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deletegroup(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const delteProduct = await groupModel.findOneAndUpdate(
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
                'Error delete group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }

    }
    async getgroupList(params: groupListParams, userId: string, groupId: string): Promise<PaginationResult<groupDtls> | ErrorResponse> {
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
                        from: 'jobapplications',
                        localField: 'jobapplicationId',
                        foreignField: '_id',
                        as: 'jobapplication'
                    }
                },
                {
                    $project: {
                        groupName: 1,
                        isActive: 1,
                        isDelete: 1,
                        jobapplicationId: 1,
                        jobapplication: { $arrayElemAt: ['$jobapplication.jobApplicationName', 0] },
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

            const groupDtls = await groupModel.aggregate(pipeline);
            const count = await groupModel.countDocuments({ isActive: 1, isDelete: 0 })
            return Pagination(count, groupDtls, limit, page)
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving group details',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findgroupById(id: string): Promise<ApiResponse<groupDtls> | ErrorResponse> {
        try {

            const group = await groupModel.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false
            })

            if (!group) {
                return createErrorResponse('group not found.', StatusCodes.BAD_REQUEST, 'Error group not found');
            }

            const result: groupDtls = {
                _id: group._id.toString(),
                name: group.groupName,
                candidate: group.canidateId.map((e) => e.toString()),
                isActive: group.isActive,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
                createdBy: group.createdBy.toString(),
                modifiedBy: group.modifiedBy ? group.modifiedBy.toString() : "",
                applicationId: group.applicationId.toString()

            };

            return successResponse('group details retrieved successfully', StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving group details',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async findgroupId(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await groupModel.countDocuments({
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
    async findgroupNameForUpdate(name: string, id: string, groupId: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await groupModel.countDocuments({
                _id: { $ne: new ObjectId(id) },
                groupName: name.trim(),
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
                'Error checking group name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updategroup(groupInput: UpdategroupInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const input = {
                name: groupInput.name.trim(),
                modifiedBy: userId,
            };

            await groupModel.updateOne(
                { _id: new ObjectId(groupInput.id) },
                {
                    $set: {
                        groupName: input.name,
                        modifiedBy: new ObjectId(userId),
                        canidateId: groupInput.candidateId.map((e) => new ObjectId(e)),
                        applicationId: new ObjectId(groupInput.applicationId)

                    }
                }
            );


            const result: SuccessMessage = {
                message: 'group update success.'
            };

            return successResponse("group updated successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error update group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Check if a group with the given name already exists
     * @param name - The group name to check
     * @returns Object containing count and status code, or error response
     */
    async findgroupNameExist(name: string, groupId: string): Promise<{ count: number, statusCode: number } | ErrorResponse> {
        try {

            const count = await groupModel.countDocuments({
                groupName: name.trim(),
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
                'Error checking group name existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new group
     * @param groupInput - The group data to create
     * @returns ApiResponse containing the created group, or error response
     */
    async creategroup(groupInput: CreategroupInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const input = {
                groupName: groupInput.name.trim(),
                canidateId: groupInput.candidateId.map((e) => new ObjectId(e)),
                createdBy: new ObjectId(userId),
                modifiedBy: null,
                groupingId: new ObjectId(groupId),
                applicationId: new ObjectId(groupInput.applicationId)
            };
            await groupModel.create(input);

            const result: SuccessMessage = {
                message: 'group created success.'
            };

            return successResponse("group created successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating group',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

/**
 * Factory function to create a new groupRepository instance
 * @param db - MongoDB database instance
 * @returns groupDomainRepository instance
 */
export function NewgroupRrpository(db: Db): groupDomainRepository {
    return new groupRepository(db);
}