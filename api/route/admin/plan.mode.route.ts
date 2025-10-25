import { Router } from "express";
import { PlanModeDomainRepository } from "../../../domain/admin/plan.modeDomain";
import { NewPlanModeHandlerRegister } from "../../../app/handler/admin.handler/plan.mode.handler";
import { NewPlanServiceRegister } from "../../../app/service/admin/plan.mode.service";
export function RegisterPlanModeRoute(
  route: Router,
  adminRepo: PlanModeDomainRepository,
  middleware: any
) {
   const service = NewPlanServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewPlanModeHandlerRegister(service); // Pass service to handler
  
    route.post('/plan-mode', middleware, handler.create)
    route.patch('/plan-mode/edit/:id', middleware, handler.update)
    route.get('/plan-mode/:id', middleware, handler.getPlanModeDetails)
    route.get('/plan-mode/list/dtls', middleware, handler.getPlanModeList)
    route.patch('/plan-mode/delete/:id', middleware, handler.delete);
    route.post('/plan-mode/subcription', middleware, handler.subcription)
}


