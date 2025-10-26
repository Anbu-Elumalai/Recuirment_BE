import { StatusCodes } from "http-status-codes";
import { PlanSchemaInput, UpdatePlanInput } from "../../../api/Request/plan.mode";
import { PaymentResponse, PlanDtls } from "../../../api/response/planMode.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { PlanModeDomainRepository, PlanModeDomainService, PlanModeListParams } from "../../../domain/admin/plan.modeDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";
import { PaymentDteailsSchema } from "../../../api/Request/assessment";

class PlanService implements PlanModeDomainService {
    private readonly PlanRepo: PlanModeDomainRepository;

    constructor(repo: PlanModeDomainRepository) {
        this.PlanRepo = repo;
    }



    async deletePlanMode(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.PlanRepo.findPlanModeIdisExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'Plan not found',
                    StatusCodes.BAD_REQUEST,
                    'Error Plan not found'
                );
            }


            return await this.PlanRepo.deletePlanMode(id, userId);
        } catch (error: any) {
            return createErrorResponse(
                'Error delete Plan',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getPlanModeList(params: PlanModeListParams, groupId: string): Promise<PaginationResult<PlanDtls[]> | ErrorResponse> {
        try {
            return await this.PlanRepo.getPlanModeList(params, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving Plan list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async findPlanModeById(id: string): Promise<ApiResponse<PlanDtls> | ErrorResponse> {
        try {
            const isExist = await this.PlanRepo.findPlanModeIdisExist(id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'Plan not found.',
                    StatusCodes.CONFLICT
                );
            }

            return await this.PlanRepo.findPlanModeById(id)

        } catch (error: any) {
            return createErrorResponse(
                'Error creating Plan',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updatePlanMode(PlanInput: UpdatePlanInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const isExist = await this.PlanRepo.findPlanModeIdisExist(PlanInput.id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'Plan not found.',
                    StatusCodes.CONFLICT
                );
            }
            // Check for existing Plan name
            const existingPlan = await this.PlanRepo.findPlanModeNameForUpdate(PlanInput.name, PlanInput.id);

            // Handle potential error from repository
            if ('status' in existingPlan && existingPlan.status === 'error') {
                return existingPlan as ErrorResponse;
            }

            // At this point, existingPlan must be the success response type
            const PlanExists = existingPlan as { count: number; statusCode: number };

            // Check if Plan already exists
            if (PlanExists.statusCode === StatusCodes.OK && PlanExists.count > 0) {
                return createErrorResponse(
                    'Plan name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the Plan
            return await this.PlanRepo.updatePlanMode(PlanInput, id, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating Plan',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    /**
     * Create a new Plan after validating input and checking for duplicates
     * @param PlanInput - The Plan data to create
     * @returns ApiResponse containing the created Plan, or error response
     */
    async createPlanMode(PlanInput: PlanSchemaInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            // Check for existing Plan name
            const existingPlan = await this.PlanRepo.findPlanModeNameExist(PlanInput.name, groupId);

            // Handle potential error from repository
            if ('status' in existingPlan && existingPlan.status === 'error') {
                return existingPlan as ErrorResponse;
            }

            // At this point, existingPlan must be the success response type
            const PlanExists = existingPlan as { count: number; statusCode: number };

            // Check if Plan already exists
            if (PlanExists.statusCode === StatusCodes.OK && PlanExists.count > 0) {
                return createErrorResponse(
                    'Plan name already exists',
                    StatusCodes.CONFLICT
                );
            }

            // Create the Plan
            return await this.PlanRepo.createPlanMode(PlanInput, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating Plan',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }


}

export function NewPlanServiceRegister(PlanRepo: PlanModeDomainRepository): PlanModeDomainService {
    return new PlanService(PlanRepo)
}