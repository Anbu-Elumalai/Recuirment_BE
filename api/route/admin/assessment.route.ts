import { Router } from "express";
import { AssRepositoryDomain } from "../../../domain/admin/assessmentDomain";
import { newAssessmentServiceRegister } from "../../../app/service/admin/assessment.service";
import { NewAssessmentHandlerRegister } from "../../../app/handler/admin.handler/assessment.handler";
export function RegisterassessmentRoute(
  route: Router,
  adminRepo: AssRepositoryDomain,
  middleware: any
) {
   const service = newAssessmentServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewAssessmentHandlerRegister(service); // Pass service to handler
  
    route.post('/assessment', middleware, handler.create)
    route.patch('/assessment/edit/:id', middleware, handler.update)
    route.get('/assessment/:id', middleware, handler.getroleDetails)
    route.get('/assessment/list/dtls', middleware, handler.getroleList)
    route.patch('/assessment/delete/:id', middleware, handler.delete);
    route.patch('/assessment/send-link/:id', middleware, handler.sendAssessemntLink);

    // assessment web apis
    route.get('/assessment/start/:token', handler.assementQuestion);
    route.patch('/assessment/submit/question-answer', handler.questionAnswer);
    route.patch('/assessment/submit-assessment', handler.submitAssessment);
}


