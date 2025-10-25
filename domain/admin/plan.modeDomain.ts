import { PlanSchemaInput, UpdatePlanInput } from "../../api/Request/plan.mode"
import { PlanDtls ,PaymentResponse} from "../../api/response/planMode.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaginationResult } from "../../api/response/paginationResponse";
import { PaymentDteailsSchema } from "../../api/Request/assessment";

export interface PlanModeListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type: string
}

export interface PlanModeDomainRepository {
    findPlanModeNameExist(name: string, groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    createPlanMode(PlanModeInput: PlanSchemaInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updatePlanMode(PlanModeInput: UpdatePlanInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findPlanModeIdisExist(id: string): Promise<Boolean | ErrorResponse>;
    findPlanModeNameForUpdate(name: string, id: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findPlanModeById(id: string): Promise<ApiResponse<PlanDtls> | ErrorResponse>;
    getPlanModeList(params: PlanModeListParams, groupId: string): Promise<PaginationResult<PlanDtls[]> | ErrorResponse>;
    deletePlanMode(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    paymentSubcription(data: PaymentDteailsSchema, userId: string, groupId: string): Promise<ApiResponse<any> | ErrorResponse>
}

export interface PlanModeDomainService {
    createPlanMode(PlanModeInput: PlanSchemaInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updatePlanMode(PlanModeInput: UpdatePlanInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findPlanModeById(id: string): Promise<ApiResponse<PlanDtls> | ErrorResponse>;
    getPlanModeList(params: PlanModeListParams, groupId: string): Promise<PaginationResult<PlanDtls[]> | ErrorResponse>;
    deletePlanMode(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    paymentSubcription(data: PaymentDteailsSchema, userId: string, groupId: string): Promise<ApiResponse<any> | ErrorResponse>
}