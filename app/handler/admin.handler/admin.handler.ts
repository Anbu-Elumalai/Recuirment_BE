import { Request, Response } from "express";
import { AdminServiceDomain } from "../../../domain/admin/adminDomain";
import { createAdminSchema, loginAdminSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, CreateAdminInput, LoginAdminInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from "../../../api/Request/admin";
import { StatusCodes } from "http-status-codes";

export class AdminUserHandler {
  private userService: AdminServiceDomain;

  constructor(userService: AdminServiceDomain) {
    this.userService = userService;
  }

  createAdminUser = async (req: Request, res: Response): Promise<any> => {
    try {
      const parsed = createAdminSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: parsed.error.issues  });
      }
      const data: CreateAdminInput = parsed.data;
      const result = await this.userService.createAdmin(data);
      if (result.status === "error") {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }
      return res.status(StatusCodes.CREATED).json(result);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  };

  loginAdminUser = async (req: Request, res: Response): Promise<any> => {
    try {
      const parsed = loginAdminSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: parsed.error.issues  });
      }
      const data: LoginAdminInput = parsed.data;
      const result = await this.userService.loginAdmin(data);
      if (result.status === "error") {
        return res.status(StatusCodes.UNAUTHORIZED).json(result);
      }
      return res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  };

  getAdminProfile = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const result = await this.userService.getProfile(id);
      if (result.status === "error") {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }
      return res.status(StatusCodes.OK).json(result);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  };

  // Send password reset email with token
  forgotPassword = async (req: Request, res: Response): Promise<any> => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: parsed.error.issues  });
    }
    const result = await this.userService.forgotPassword(parsed.data as ForgotPasswordInput);
    return res.status(result.status === 'error' ? StatusCodes.BAD_REQUEST : StatusCodes.OK).json(result);
  };

  // Reset password using token
  resetPassword = async (req: Request, res: Response): Promise<any> => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: parsed.error.issues  });
    }
    const token = req.query.token as string;

    if (!token) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Token is missed" });
    }
     
    const result = await this.userService.resetPassword(parsed.data as ResetPasswordInput, token);
    return res.status(result.status === 'error' ? StatusCodes.BAD_REQUEST : StatusCodes.OK).json(result);
  };

  // Change password when logged in
  changePassword = async (req: Request, res: Response): Promise<any> => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: parsed.error.issues  });
    }
    const userId = req?.user?.id;
    const result = await this.userService.changePassword(userId, parsed.data as ChangePasswordInput);
    return res.status(result.status === 'error' ? StatusCodes.BAD_REQUEST : StatusCodes.OK).json(result);
  };
}

export function RegisterAdminUserHandler(service: AdminServiceDomain): AdminUserHandler {
  return new AdminUserHandler(service);
}