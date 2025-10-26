import { Router } from "express";
import { testConfigDomainRepository } from "../../../domain/admin/test.configDomain";
import { NewtestConfigHandlerRegister } from "../../../app/handler/admin.handler/test.config.handler";
import { NewtestConfigServiceRegister } from "../../../app/service/admin/test.config.service";
export function RegistertestConfigRoute(
  route: Router,
  adminRepo: testConfigDomainRepository,
  middleware: any
) {
   const service = NewtestConfigServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewtestConfigHandlerRegister(service); // Pass service to handler
  
    route.patch('/testConfig/edit/:id', middleware, handler.update)
    route.get('/testConfig/:id', middleware, handler.gettestConfigDetails)
}


