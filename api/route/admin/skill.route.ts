import { Router } from "express";
import { skillDomainRepository } from "../../../domain/admin/skillDomain";
import { NewskillHandlerRegister } from "../../../app/handler/admin.handler/skill.handler";
import { NewskillServiceRegister } from "../../../app/service/admin/skill.service";
export function RegisterskillRoute(
  route: Router,
  adminRepo: skillDomainRepository,
  middleware: any
) {
   const service = NewskillServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewskillHandlerRegister(service); // Pass service to handler
  
    route.post('/skill', middleware, handler.create)
    route.patch('/skill/edit/:id', middleware, handler.update)
    route.get('/skill/:id', middleware, handler.getskillDetails)
    route.get('/skill/list/dtls', middleware, handler.getskillList)
    route.patch('/skill/delete/:id', middleware, handler.delete);
}


