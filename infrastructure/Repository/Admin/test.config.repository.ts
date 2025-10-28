import { StatusCodes } from "http-status-codes";
import { Db, ObjectId } from "mongodb";
import { UpdatetestConfigInput, CreatetestConfigInput } from "../../../api/Request/testConfig";
import { testConfigDtls } from "../../../api/response/testConfig.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { testConfigDomainRepository } from "../../../domain/admin/test.configDomain";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import testConfigModel from "../../../app/model/config.test.limit";
import subscription from "../../../app/model/subscription";
import testValidationForCandidate from "../../../app/model/config.test.limit";
import planMode from "../../../app/model/plan.mode";

/**
 * Repository class for handling testConfig-related database operations
 */
class testConfigRepository implements testConfigDomainRepository {
    private readonly db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async checkIsValidConfigBaseOnPlanMode(groupId: string): Promise<ApiResponse<{ isValid: boolean, planTestLimit: number, configTestNumber: number }> | ErrorResponse> {
        try {

            const currentDate = new Date();

            const currentPlanDetails = await subscription.findOne({
                'metadata.groupId': new ObjectId(groupId), // filter by group
                status: { $in: ['active', 'renewed'] },                  // active or renewed subscription
                next_billing_date: { $gte: currentDate }
            })
                .populate('metadata.planId')
                .sort({ next_billing_date: -1 });

            if (currentPlanDetails && currentPlanDetails.metadata?.planId) {
                const plan = currentPlanDetails.metadata!.planId as any;

                const planTestLimit = plan.testLimit;

                const testLimit = await testValidationForCandidate.findOne({
                    groupId: new ObjectId(groupId)
                });

                let noOfTestCanAttend = 0;
                let noOfDaysToAttend = 0;

                if (testLimit) {
                    noOfTestCanAttend = testLimit.numberOfTestPerCandidate;
                    noOfDaysToAttend = testLimit.numberOfDaysToAttend;
                }

                return successResponse('testConfig details retrieved successfully', StatusCodes.OK, {
                    configTestNumber: noOfTestCanAttend,
                    planTestLimit: planTestLimit,
                    isValid: noOfTestCanAttend > planTestLimit
                });
            }

            return successResponse('testConfig setup', StatusCodes.OK, {
                configTestNumber: 0,
                planTestLimit: 0,
                isValid: false
            });

        } catch (error: any) {
            return createErrorResponse(
                "Error  testConfig setup",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async findtestConfig(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await testConfigModel.countDocuments({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false
            });

            return count == 1;
        } catch (error: any) {
            return createErrorResponse(
                "Error finding testConfig in product",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findtestConfigById(id: string): Promise<ApiResponse<testConfigDtls> | ErrorResponse> {
        try {

            const testConfig = await testConfigModel.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false
            }).populate('createdBy', 'name').populate('modifiedBy', 'name')

            if (!testConfig) {
                return createErrorResponse('testConfig not found.', StatusCodes.BAD_REQUEST, 'Error testConfig not found');
            }

            const result: testConfigDtls = {
                _id: testConfig._id.toString(),
                numberOfDaysToAttend: testConfig.numberOfDaysToAttend,
                numberOfTestPerCandidate: testConfig.numberOfTestPerCandidate,
                isActive: testConfig.isActive,
                createdAt: testConfig.createdAt,
                updatedAt: testConfig.updatedAt,
                createdBy: testConfig.createdBy.toString(),
                modifiedBy: testConfig.modifiedBy ? testConfig.modifiedBy.toString() : ""

            };

            return successResponse('testConfig details retrieved successfully', StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving testConfig details',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async updatetestConfig(testConfigInput: UpdatetestConfigInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const currentDate = new Date();

            const currentPlanDetails = await subscription.findOne({
                'metadata.groupId': new ObjectId(groupId), // filter by group
                status: { $in: ['active', 'renewed'] }, // active or renewed subscription
                next_billing_date: { $gte: currentDate }
            })
                .populate('metadata.planId')
                .sort({ next_billing_date: -1 });

            
            if (currentPlanDetails && currentPlanDetails.metadata?.planId) {
                const plan = currentPlanDetails.metadata!.planId as any;
                const dur = plan.duration;
                const planTestLimit = plan.testLimit

                if (testConfigInput.numberOfTestsPerCandidate > planTestLimit) {
                      return createErrorResponse(
                        'Error.TestConfig test limit is greater than of current plan',
                        StatusCodes.INTERNAL_SERVER_ERROR,
                        'Error.TestConfig test limit is greater than of current plan',
                    );
                }
            }

            const input = {
                numberOfDaysToAttend: testConfigInput.numberOfDaysToAttend,
                numberOfTestsPerCandidate: testConfigInput.numberOfTestsPerCandidate,
                modifiedBy: userId
            };

            await testConfigModel.updateOne(
                { _id: new ObjectId(testConfigInput.id) },
                {
                    $set: {
                        numberOfDaysToAttend: testConfigInput.numberOfDaysToAttend,
                        numberOfTestsPerCandidate: testConfigInput.numberOfTestsPerCandidate,

                        modifiedBy: new ObjectId(userId),
                    }
                }
            );


            const result: SuccessMessage = {
                message: 'testConfig update success.'
            };

            return successResponse("testConfig updated successfully", StatusCodes.OK, result);
        } catch (error: any) {
            return createErrorResponse(
                'Error update testConfig',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

/**
 * Factory function to create a new testConfigRepository instance
 * @param db - MongoDB database instance
 * @returns testConfigDomainRepository instance
 */
export function NewtestConfigRrpository(db: Db): testConfigDomainRepository {
    return new testConfigRepository(db);
}