import { CreateAdminInput, LoginAdminInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from "../../../api/Request/admin";
import { IAdminRepository, AdminServiceDomain } from "../../../domain/admin/adminDomain";
import { ApiResponse } from "../../../api/response/commonResponse";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { AdminUser } from "../../../api/response/admin.response";
import { createErrorResponse } from "../../../utils/common/errors";
import { StatusCodes } from "http-status-codes";

export class AdminService implements AdminServiceDomain {
  private adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository;
  }

  async createAdmin(data: CreateAdminInput): Promise<ApiResponse<AdminUser> | ErrorResponse> {
    const isExist = await this.adminRepository.findEmailExist(data.email)
     if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
               }
    
               if(isExist){
                return createErrorResponse(
                    'User is already exist.',
                    StatusCodes.CONFLICT
                );
               }
    const result = await this.adminRepository.createAdmin(data);
    if (result.status === 'error') return result;
    return result;
  }

  async loginAdmin(data: LoginAdminInput): Promise<ApiResponse<{ user: AdminUser; token: string }> | ErrorResponse> {
    // Delegate to repository loginAdmin
    return this.adminRepository.loginAdmin(data);
  }

  async getProfile(id: string): Promise<ApiResponse<AdminUser> | ErrorResponse> {
    const result = await this.adminRepository.findAdminById(id);
    if (result.status === 'error') return result;
    return result;
  }

  // Password management
  async forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse<any> | ErrorResponse> {
    return this.adminRepository.forgotPassword(data);
  }
  async resetPassword(data: ResetPasswordInput,token: string): Promise<ApiResponse<any> | ErrorResponse> {
    return this.adminRepository.resetPassword(data,token);
  }
  async changePassword(id: string, data: ChangePasswordInput): Promise<ApiResponse<any> | ErrorResponse> {
    return this.adminRepository.changePassword(id, data);
  }
}

// Factory function for service
export function RegisteradminService(repo: IAdminRepository): AdminServiceDomain {
  return new AdminService(repo);
}
