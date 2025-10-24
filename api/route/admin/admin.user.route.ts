import { Router } from "express";
import { IAdminRepository } from "../../../domain/admin/adminDomain";
import { RegisterAdminUserHandler } from "../../../app/handler/admin.handler/admin.handler";
import { RegisteradminService } from "../../../app/service/admin/admin.service";
export function RegisterAdminRoute(
  router: Router,
  adminRepo: IAdminRepository,
  middleware: any
) {
   const service = RegisteradminService(adminRepo); // Pass repository to service  
    const handler = RegisterAdminUserHandler(service); // Pass service to handler
    router.post("/admin-user",handler.createAdminUser); // Define route
    router.post("/admin-login", handler.loginAdminUser); // Define route
    router.get("/admin-user/:id", handler.getAdminProfile);
    // Password management routes
    router.post("/admin-forgot-password", handler.forgotPassword);
    router.post("/admin-reset-password", handler.resetPassword);
    router.post("/admin-change-password", middleware, handler.changePassword);
}


