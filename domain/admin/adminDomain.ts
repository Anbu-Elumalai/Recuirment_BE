import { CreateAdminInput, LoginAdminInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from "../../api/Request/admin";
import { ApiResponse } from "../../api/response/commonResponse";
import { ErrorResponse } from "../../api/response/cmmonerror";
import { AdminUser } from "../../api/response/admin.response";

export interface IAdminRepository {
  findEmailExist(email: string): Promise<Boolean | ErrorResponse>
  createAdmin(data: CreateAdminInput): Promise<ApiResponse<AdminUser> | ErrorResponse>;
  findAdminByEmail(email: string): Promise<ApiResponse<AdminUser> | ErrorResponse>;
  findAdminById(id: string): Promise<ApiResponse<AdminUser> | ErrorResponse>;
  loginAdmin(data: LoginAdminInput): Promise<ApiResponse<{ user: AdminUser; token: string }> | ErrorResponse>;
  // Password management
  forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse<any> | ErrorResponse>;
  resetPassword(data: ResetPasswordInput,token: string): Promise<ApiResponse<any> | ErrorResponse>;
  changePassword(id: string, data: ChangePasswordInput): Promise<ApiResponse<any> | ErrorResponse>;
}

export interface AdminServiceDomain {
  createAdmin(data: CreateAdminInput): Promise<ApiResponse<AdminUser> | ErrorResponse>;
  loginAdmin(data: LoginAdminInput): Promise<ApiResponse<{ user: AdminUser; token: string }> | ErrorResponse>;
  getProfile(id: string): Promise<ApiResponse<AdminUser> | ErrorResponse>;
  // Password management
  forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse<any> | ErrorResponse>;
  resetPassword(data: ResetPasswordInput,token: string): Promise<ApiResponse<any> | ErrorResponse>;
  changePassword(id: string, data: ChangePasswordInput): Promise<ApiResponse<any> | ErrorResponse>;
}
