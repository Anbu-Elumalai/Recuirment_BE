import { Router } from "express";
import { UserDomainRepository } from "../../../domain/admin/admin.userDomain";
import { NewUserHandlerRegister } from "../../../app/handler/admin.handler/user.handler";
import { newUserServiceRegister } from "../../../app/service/admin/user.service";
export function RegisterUserRoute(
  route: Router,
  adminRepo: UserDomainRepository,
  middleware: any
) {
   const service = newUserServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewUserHandlerRegister(service); // Pass service to handler
  
    route.post('/user', middleware, handler.create)
    route.patch('/user/edit/:id', middleware, handler.update)
    route.get('/user/:id', middleware, handler.getuserDetails)
    route.get('/user/list/dtls', middleware, handler.getuserList)
    route.patch('/user/delete/:id', middleware, handler.delete);
}


