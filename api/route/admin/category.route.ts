import { Router } from "express";
import { categoryDomainRepository } from "../../../domain/admin/categoryDomain";
import { NewcategoryHandlerRegister } from "../../../app/handler/admin.handler/category.handler";
import { NewcategoryServiceRegister } from "../../../app/service/admin/category.service";
export function RegistercategoryRoute(
  route: Router,
  adminRepo: categoryDomainRepository,
  middleware: any
) {
   const service = NewcategoryServiceRegister(adminRepo); // Pass repository to service  
    const handler = NewcategoryHandlerRegister(service); // Pass service to handler
  
    route.post('/category', middleware, handler.create)
    route.patch('/category/edit/:id', middleware, handler.update)
    route.get('/category/:id', middleware, handler.getcategoryDetails)
    route.get('/category/list/dtls', middleware, handler.getcategoryList)
    route.patch('/category/delete/:id', middleware, handler.delete);
}


