import { Router } from "express";
import { PlanModeDomainRepository } from "../../../domain/admin/plan.modeDomain";
import { NewDodopayHandlerRegister } from "../../../app/handler/admin.handler/dodopay.handler";
import { NewDODOpayServiceRegister } from "../../../app/service/admin/dodopay.service";
import { DODOpaymentDomainRepository } from "../../../domain/admin/dodoPaymentDomain";
export function RegisterDodoPayRoute(
  route: Router,
  adminRepo: DODOpaymentDomainRepository,
  middleware: any
) {
   const service = NewDODOpayServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewDodopayHandlerRegister(service); // Pass service to handler

    route.post('/payment/subcription', middleware, handler.subcription)
    route.post('/payment/subcription/action', middleware, handler.paymentSubscriptionAction)
}


