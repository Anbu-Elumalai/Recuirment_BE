import { Router } from "express";
import { CandidateRepositoryDomain } from "../../../domain/admin/candidateDomain";
import { NewcandidateHandlerRegister } from "../../../app/handler/admin.handler/candidate.handler";
import { newCandidateServiceRegister } from "../../../app/service/admin/candidate.service";
export function RegistercandidateRoute(
  route: Router,
  adminRepo: CandidateRepositoryDomain,
  middleware: any
) {
   const service = newCandidateServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewcandidateHandlerRegister(service); // Pass service to handler
  
    route.post('/candidate', middleware, handler.create)
    route.patch('/candidate/edit/:id', middleware, handler.update)
    route.get('/candidate/:id', middleware, handler.getcandidateDetails)
    route.get('/candidate/list/dtls', middleware, handler.getcandidateList)
    route.patch('/candidate/delete/:id', middleware, handler.delete);
}


