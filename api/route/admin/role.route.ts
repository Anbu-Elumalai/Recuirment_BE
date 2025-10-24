import { Router } from "express";
import { roleDomainRepository } from "../../../domain/admin/roleDomain";
import { NewroleHandlerRegister } from "../../../app/handler/admin.handler/role.handler";
import { NewroleServiceRegister } from "../../../app/service/admin/role.service";
export function RegisterRoleRoute(
  route: Router,
  adminRepo: roleDomainRepository,
  middleware: any
) {
   const service = NewroleServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewroleHandlerRegister(service); // Pass service to handler
  
    route.post('/role', middleware, handler.create)
    route.patch('/role/edit/:id', middleware, handler.update)
    route.get('/role/:id', middleware, handler.getroleDetails)
    route.get('/role/list/dtls', middleware, handler.getroleList)
    route.patch('/role/delete/:id', middleware, handler.delete);
}


