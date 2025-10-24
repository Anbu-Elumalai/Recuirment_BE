import { Router } from "express";
import { groupDomainRepository } from "../../../domain/admin/groupDomain";
import { NewgroupHandlerRegister } from "../../../app/handler/admin.handler/group.handler";
import { NewgroupServiceRegister } from "../../../app/service/admin/group.service";
export function RegistergroupRoute(
  route: Router,
  adminRepo: groupDomainRepository,
  middleware: any
) {
   const service = NewgroupServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewgroupHandlerRegister(service); // Pass service to handler
  
    route.post('/group', middleware, handler.create)
    route.patch('/group/edit/:id', middleware, handler.update)
    route.get('/group/:id', middleware, handler.getgroupDetails)
    route.get('/group/list/dtls', middleware, handler.getgroupList)
    route.patch('/group/delete/:id', middleware, handler.delete);
}


