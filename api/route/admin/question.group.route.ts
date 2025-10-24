import { Router } from "express";
import { NewquestionGroupHandlerRegister } from "../../../app/handler/admin.handler/question.group.handler";
import { newQuestionGrpServiceRegister } from "../../../app/service/admin/question.group.service";
import { GroupQuestionRepositoryDomain } from "../../../domain/admin/questionGroupDomain";
export function RegisterQuestiongroupRoute(
  route: Router,
  adminRepo: GroupQuestionRepositoryDomain,
  middleware: any
) {
   const service = newQuestionGrpServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewquestionGroupHandlerRegister(service); // Pass service to handler
  
    route.post('/question-group', middleware, handler.create)
    route.patch('/question-group/edit/:id', middleware, handler.update)
    route.get('/question-group/:id', middleware, handler.getquestionDetails)
    route.get('/question-group/list/dtls', middleware, handler.getquestionList)
    route.patch('/question-group/delete/:id', middleware, handler.delete);
    route.get('/question-group/category/:id', middleware, handler.findQuestionGroupBaseSkill);
    route.post('/question-group/auto-select', middleware, handler.autoSelectQuestion);

}


