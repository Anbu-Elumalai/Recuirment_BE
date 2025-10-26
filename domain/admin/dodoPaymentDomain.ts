import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"
import { PaymentDteailsSchema } from "../../api/Request/assessment";

export interface DODOpaymentListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface DODOpaymentDomainRepository {
    paymentSubcription(data: PaymentDteailsSchema, userId: string, groupId: string): Promise<ApiResponse<any> | ErrorResponse>
    paymentSubscriptionAction(
        action: string,
        reason: string,
        userId: string,
        groupId: string
    ): Promise<ApiResponse<SuccessMessage> | ErrorResponse>
   }

export interface DODOpaymentDomainService {
    paymentSubcription(data: PaymentDteailsSchema, userId: string, groupId: string): Promise<ApiResponse<any> | ErrorResponse>
    paymentSubscriptionAction(
        action: string,
        reason: string,
        userId: string,
        groupId: string
    ): Promise<ApiResponse<SuccessMessage> | ErrorResponse>
}