import { Router } from "express";
import { candidateTypeDomainRepository } from "../../../domain/admin/candidatetypeDomain";
import { NewcandidateTypeHandlerRegister } from "../../../app/handler/admin.handler/candidatetype.handler";
import { NewcandidateTypeServiceRegister } from "../../../app/service/admin/candidatetype.service";
export function RegistercandidateTypeRoute(
  route: Router,
  adminRepo: candidateTypeDomainRepository,
  middleware: any
) {
   const service = NewcandidateTypeServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewcandidateTypeHandlerRegister(service); // Pass service to handler
  
    route.post('/candidate-type', middleware, handler.create)
    route.patch('/candidate-type/edit/:id', middleware, handler.update)
    route.get('/candidate-type/:id', middleware, handler.getcandidateTypeDetails)
    route.get('/candidate-type/list/dtls', middleware, handler.getcandidateTypeList)
    route.patch('/candidate-type/delete/:id', middleware, handler.delete);
}


