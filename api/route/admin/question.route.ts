import { Router } from "express";
import { QuestionRepositoryDomain } from "../../../domain/admin/questionDomain";
import { NewquestionHandlerRegister } from "../../../app/handler/admin.handler/question.handler";
import { newQuestionSeviceRegistor } from "../../../app/service/admin/question.service";
export function RegisterquestionRoute(
  route: Router,
  adminRepo: QuestionRepositoryDomain,
  middleware: any
) {
   const service = newQuestionSeviceRegistor(adminRepo); // Pass repository to service  
    const handler = NewquestionHandlerRegister(service); // Pass service to handler
  
    route.post('/question', middleware, handler.create)
    route.patch('/question/edit/:id', middleware, handler.update)
    route.get('/question/:id', middleware, handler.getquestionDetails)
    route.get('/question/list/dtls', middleware, handler.getquestionList)
    route.patch('/question/delete/:id', middleware, handler.delete);
}


