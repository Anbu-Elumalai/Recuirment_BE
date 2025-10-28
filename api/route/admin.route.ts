import {  Router } from "express";
import { _config } from "../../config/config";
import { Db } from "mongodb";
import { RegisterAdminRoute } from "./admin/admin.user.route";
import { AdminAuthMiddlewareService } from "../middleware/admin.auth.service";
import { NewAdminAuthRegister } from "../middleware/admin.middleware";
import { newAdminUserRepository } from "../../infrastructure/Repository/Admin/admin.repository";
import { NewroleRrpository } from "../../infrastructure/Repository/Admin/role.repository";
import { RegisterRoleRoute } from "./admin/role.route";
import { NewgroupRrpository } from "../../infrastructure/Repository/Admin/group.repository";
import { NewCandidateRrpository } from "../../infrastructure/Repository/Admin/candidate.respostiory";
import { RegistergroupRoute } from "./admin/group.route";
import { RegistercandidateRoute } from "./admin/candidate.route";
import { newQuestionRegister } from "../../infrastructure/Repository/Admin/question.repository";
import { RegisterquestionRoute } from "./admin/question.route";
import { newQuestionGroupRepoSitoryRegister } from "../../infrastructure/Repository/Admin/question.group.repository";
import { RegisterQuestiongroupRoute } from "./admin/question.group.route";
import { NewcategoryRrpository } from "../../infrastructure/Repository/Admin/category.repository";
import { RegistercategoryRoute } from "./admin/category.route";
import { newJobapplicRepositoryRegister } from "../../infrastructure/Repository/Admin/testApplication.repository";
import { RegisterJobApplicRoute } from "./admin/testapplication.route";
import { RegisterskillRoute } from "./admin/skill.route";
import { NewskillRrpository } from "../../infrastructure/Repository/Admin/skill.repository";
import { newAssessmentRegister } from "../../infrastructure/Repository/Admin/assessment.repository";
import { RegisterassessmentRoute } from "./admin/assessment.route";
import { newUserRepositoryRegister } from "../../infrastructure/Repository/Admin/user.repository";
import { RegisterUserRoute } from "./admin/user.route";
import { NewPlanRepositoryRegister } from "../../infrastructure/Repository/Admin/plan.mode.repository";
import { RegisterPlanModeRoute } from "./admin/plan.mode.route";
import { NewDODOPayRepositoryRegister } from "../../infrastructure/Repository/Admin/dodo.payment.repository";
import { RegisterDodoPayRoute } from "./admin/dodopay.route";
import { NewtestConfigRrpository } from "../../infrastructure/Repository/Admin/test.config.repository";
import { RegistertestConfigRoute } from "./admin/test.config.route";
import {newHistoryTrackRegister} from "../../utils/common/history.tracking.service"

export function setupRoutes(router: Router, db: Db) {

  const adminRepo = newAdminUserRepository(db)

  const adminAuthService = AdminAuthMiddlewareService(adminRepo)
  const adminmiddleware = NewAdminAuthRegister(adminAuthService)
   
  //History tracking service
  newHistoryTrackRegister(db)
  
  const roleRepo = NewroleRrpository(db)
  const groupREpo = NewgroupRrpository(db)
  const candidateRepo = NewCandidateRrpository(db)
  const questionRepo = newQuestionRegister(db, candidateRepo)
  const groupQuestionRepo = newQuestionGroupRepoSitoryRegister(db)
  const categoriesRepo = NewcategoryRrpository(db)
  const jobAppRepo = newJobapplicRepositoryRegister(db)
  const skillRepo = NewskillRrpository(db)
  const assessmentRepo = newAssessmentRegister(db)
  const userRepo = newUserRepositoryRegister(db)
  const planMode = NewPlanRepositoryRegister(db)
  const dodoPay = NewDODOPayRepositoryRegister(db)
  const testConfigRepo = NewtestConfigRrpository(db)

  RegisterskillRoute(router, skillRepo, adminmiddleware.ValidateUser)
  RegisterAdminRoute(router, adminRepo, adminmiddleware.ValidateUser)
  RegisterRoleRoute(router, roleRepo, adminmiddleware.ValidateUser)
  RegistergroupRoute(router, groupREpo, adminmiddleware.ValidateUser)
  RegistercandidateRoute(router, candidateRepo, adminmiddleware.ValidateUser)
  RegisterquestionRoute(router, questionRepo, adminmiddleware.ValidateUser)
  RegisterQuestiongroupRoute(router, groupQuestionRepo, adminmiddleware.ValidateUser)
  RegistercategoryRoute(router, categoriesRepo, adminmiddleware.ValidateUser)
  RegisterJobApplicRoute(router, jobAppRepo, adminmiddleware.ValidateUser)
  RegisterassessmentRoute(router, assessmentRepo, adminmiddleware.ValidateUser)
  RegisterUserRoute(router, userRepo, adminmiddleware.ValidateUser)
  RegisterPlanModeRoute(router, planMode, adminmiddleware.ValidateUser)
  RegisterDodoPayRoute(router, dodoPay, adminmiddleware.ValidateUser)
  RegistertestConfigRoute(router, testConfigRepo, adminmiddleware.ValidateUser)
}

export { setupRoutes as RegisterAdminRoute };

