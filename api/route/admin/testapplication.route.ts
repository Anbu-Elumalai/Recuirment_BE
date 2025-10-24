import { Router } from "express";
import { jobApplicDomainRepository } from "../../../domain/admin/jobapplicationDomain";
import { NewJobApplicHandlerRegister } from "../../../app/handler/admin.handler/testapplication.handler";
import { NewJobApplicServiceRegister } from "../../../app/service/admin/testapplication.service";
export function RegisterJobApplicRoute(
  route: Router,
  adminRepo: jobApplicDomainRepository,
  middleware: any
) {
   const service = NewJobApplicServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewJobApplicHandlerRegister(service); // Pass service to handler
  
    route.post('/test/code', middleware, handler.generateCode)
    route.post('/test', middleware, handler.create)
    route.patch('/test/edit/:id', middleware, handler.update)
    route.get('/test/:id', middleware, handler.getJobApplicDetails)
    route.get('/test/list/dtls', middleware, handler.getJobApplicList)
    route.patch('/test/delete/:id', middleware, handler.delete);
}


