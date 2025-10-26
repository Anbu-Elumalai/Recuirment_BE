import { StatusCodes } from "http-status-codes";
import { PlanSchemaInput, UpdatePlanInput } from "../../../api/Request/plan.mode";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { PlanDtls, PaymentResponse } from "../../../api/response/planMode.response";
import planMode from "../../../app/model/plan.mode";
import { PlanModeDomainRepository, PlanModeListParams } from "../../../domain/admin/plan.modeDomain";
import { Db, ObjectId } from "mongodb";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaymentDteailsSchema } from "../../../api/Request/assessment";
import dodoService from "../../../utils/common/dodo.payment.service";
import { DodoEventType } from "../../../utils/common/dodoEventTypes"
import { _config } from "../../../config/config";
import subscription from "../../../app/model/subscription";
import DodoPayments from "dodopayments";
import { getCountryCode, getSubscriptionStatusMessage } from "../../../utils/utilsFunctions/user.activity";
import { SubscriptionStatus } from "../../../utils/common/enum";

class PlanRepository implements PlanModeDomainRepository {
    private readonly db: Db
    constructor(db: Db) {
        this.db = db
    }

    async findPlanModeNameExist(name: string, groupId: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await planMode.countDocuments({
                name: name.trim(),
                isDelete: false,
                isActive: true,
            });

            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error Plan skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async createPlanMode(PlanModeInput: PlanSchemaInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const findDODOProductIDExist = await planMode.countDocuments({
                dodoProductId: PlanModeInput.dodoProductId
            })

            if (findDODOProductIDExist > 0) {
                return createErrorResponse(
                    'Error Dodo product is already existing. Create new product',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Error Dodo product is already existing. Create new product',
                );
            }

            const obj = {
                name: PlanModeInput.name,
                price: PlanModeInput.price,
                currency: PlanModeInput.currency || "USD",
                duration: PlanModeInput.duration,
                features: PlanModeInput.features,
                createdBy: new ObjectId(userId),
                candidateLimit: PlanModeInput.candidateLimit,
                testLimit: PlanModeInput.testLimit,
                adminLimit: PlanModeInput.adminLimit,
                dodoProductId: PlanModeInput.dodoProductId
            };

            const plan = new planMode(obj);

            // save to database
            await plan.save();

            return successResponse('plan mode created successfully', StatusCodes.OK, { message: 'plan mode created successfully' });


        } catch (error: any) {
            return createErrorResponse(
                'Error Plan skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updatePlanMode(PlanModeInput: UpdatePlanInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const findDODOProductIDExist = await planMode.countDocuments({
                dodoProductId: PlanModeInput.dodoProductId,
                _id: { $ne: new ObjectId(id) },
            })

            if (findDODOProductIDExist > 0) {
                return createErrorResponse(
                    'Error Dodo product is already existing.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Error Dodo product is already existing.',
                );
            }

            const obj = {
                name: PlanModeInput.name,
                price: PlanModeInput.price,
                currency: PlanModeInput.currency || "USD",
                duration: PlanModeInput.duration,
                features: PlanModeInput.features,
                modifiedBy: new ObjectId(userId),
                candidateLimit: PlanModeInput.candidateLimit,
                testLimit: PlanModeInput.testLimit,
                adminLimit: PlanModeInput.adminLimit,
                dodoProductId: PlanModeInput.dodoProductId
            };

            await planMode.updateOne(
                { _id: new ObjectId(id) },
                { $set: obj },

            );

            return successResponse('plan mode updated successfully', StatusCodes.OK, { message: 'plan mode updated successfully' });

        } catch (error: any) {
            return createErrorResponse(
                'Error Plan skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async findPlanModeIdisExist(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await planMode.countDocuments({
                _id: new ObjectId(id),
            });

            console.log(count);

            return count == 1
        } catch (error: any) {
            return createErrorResponse(
                'Error Plan skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async findPlanModeNameForUpdate(name: string, id: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await planMode.countDocuments({
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
                'Error Plan name',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async findPlanModeById(id: string): Promise<ApiResponse<PlanDtls> | ErrorResponse> {
        try {
            const plan = await planMode.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false,
            }).lean(); // use lean() for plain JS object

            if (!plan) {
                return createErrorResponse(
                    "plan not found",
                    StatusCodes.NOT_FOUND,
                    "No plan exists with this ID"
                );
            }

            const resp: PlanDtls = {
                _id: plan._id.toString(),
                currency: plan?.currency,
                duration: plan?.duration,
                features: plan?.features,
                name: plan?.name,
                price: plan?.price,
                createdBy: plan.createdBy?.toString() || "",
                isActive: plan.isActive ?? true,
                createdAt: plan.createdAt,
                updatedAt: plan.updatedAt,
            };

            return successResponse('plan retrieved successfully', StatusCodes.OK, resp);

        } catch (error: any) {
            return createErrorResponse(
                'Error Plan skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getPlanModeList(params: PlanModeListParams, groupId: string): Promise<PaginationResult<PlanDtls[]> | ErrorResponse> {
        try {
            const { page, limit, type } = params

            const pipeline: any = [
                {
                    $match: {
                        isActive: true,
                        isDelete: false,
                    },
                },
                {
                    $lookup: {
                        from: "admins",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "createdBy",
                    },
                },
                {
                    $lookup: {
                        from: "admins",
                        localField: "modifiedBy",
                        foreignField: "_id",
                        as: "modifiedBy",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        price: 1,       // price in USD
                        currency: 1,    // always USD
                        duration: 1,
                        candidateLimit: 1,
                        testLimit: 1,
                        adminLimit: 1,
                        isActive: 1,
                        isDelete: 1,
                        createdBy: { $arrayElemAt: ["$createdBy.name", 0] },
                        modifiedBy: { $arrayElemAt: ["$modifiedBy.name", 0] },
                        createdAt: 1,
                        updatedAt: 1,
                    },
                },
            ];

            if (type !== 'all') {
                pipeline.push(
                    { $skip: page * limit },
                    { $limit: limit }
                );
            }

            const groupDtls = await planMode.aggregate(pipeline);
            const count = await planMode.countDocuments({ isActive: 1, isDelete: 0 })
            return Pagination(count, groupDtls, limit, page)

        } catch (error: any) {
            return createErrorResponse(
                'Error Plan list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deletePlanMode(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const delteProduct = await planMode.findOneAndUpdate(
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
                    'Error in plan delete',
                    StatusCodes.NOT_FOUND,
                    'plan with given ID not found'
                );
            }

            const result: SuccessMessage = {
                message: 'plan deleted success.'
            };
            return successResponse("plan deleted successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error Plan delete',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

  

}

export function NewPlanRepositoryRegister(db: Db): PlanModeDomainRepository {
    return new PlanRepository(db)
}

