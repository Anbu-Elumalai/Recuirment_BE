import { StatusCodes } from "http-status-codes";
import { PlanSchemaInput, UpdatePlanInput } from "../../../api/Request/plan.mode";
import { PaymentResponse, PlanDtls } from "../../../api/response/planMode.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import {PlanModeDomainRepository,PlanModeDomainService,PlanModeListParams } from "../../../domain/admin/plan.modeDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";
import { PaymentDteailsSchema } from "../../../api/Request/assessment";
import { DODOpaymentDomainRepository, DODOpaymentDomainService } from "../../../domain/admin/dodoPaymentDomain";

class dodoPayService implements DODOpaymentDomainService {
    private readonly PlanRepo: DODOpaymentDomainRepository;

    constructor(repo: DODOpaymentDomainRepository) {
        this.PlanRepo = repo;
    }
   
   async paymentSubcription(data: PaymentDteailsSchema, userId: string, groupId: string): Promise<ApiResponse<any> | ErrorResponse> {
      try {
          return await this.PlanRepo.paymentSubcription(data, userId, groupId)
      } catch (error:any) {
         return createErrorResponse(
                'Error dodo payment Plan',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
      }
    }
   
    async  paymentSubscriptionAction(action: string, reason: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
       try {
          return await this.PlanRepo.paymentSubscriptionAction(action, reason, userId, groupId)
       } catch (error:any) {
          return createErrorResponse(
                'Error creating Plan',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
       }
    }
}

export function NewDODOpayServiceRegister(PlanRepo: DODOpaymentDomainRepository): DODOpaymentDomainService {
    return new dodoPayService(PlanRepo)
}