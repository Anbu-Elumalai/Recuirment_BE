import { StatusCodes } from "http-status-codes";
import { Db, ObjectId } from "mongodb";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse } from "../../../api/response/commonResponse";
import { AdminUser } from "../../../api/response/admin.response";
import { createErrorResponse } from "../../../utils/common/errors";
import { successResponse } from "../../../utils/common/commonResponse";
import { IAdminRepository } from "../../../domain/admin/adminDomain";
import {
  CreateAdminInput,
  LoginAdminInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "../../../api/Request/admin";
import Admin from "../../../app/model/admin.user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "process";
import AdminToken from "../../../app/model/admin.token";
import { _config } from "../../../config/config";
import mailService from "../../../utils/common/mail.service";
import AdminUsers from "../../../app/model/admin.user";
import GroupingTeamId from "../../../app/model/organization.groupingIds";
import forgotpassword from "../../../app/model/forgotpassword";
import crypto from "crypto";
import testValidationForCandidate from "../../../app/model/config.test.limit";

class AdminUserRepository implements IAdminRepository {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async findEmailExist(email: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await AdminUsers.countDocuments({
        email: email,
        isActive: true,
        isDelete: false,

      });

      return count >= 1;
    } catch (error: any) {
      return createErrorResponse(
        "Error finding email in product",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
  async findAdminByEmail(
    email: string
  ): Promise<ApiResponse<AdminUser> | ErrorResponse> {
    try {
      const userDtl = await this.db.collection("admins").findOne({
        email: email,
        isActive: true,
      });

      if (!userDtl) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "No user with the given email found in the database."
        );
      }

      // Map MongoDB document to User type
      const user: AdminUser = {
        id: userDtl._id.toString(),
        permissions: userDtl.permissions,
        name: userDtl.name,
        email: userDtl.email,
        isActive: userDtl.isActive,
        isDelete: userDtl.isDelete,
        groupingId: userDtl.groupingId,
        userType: userDtl.userType
      };

      if (!user.isActive) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "The user is inactive and cannot be processed."
        );
      }

      if (user.isDelete) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "User is in deleted state."
        );
      }

      return successResponse("Success", StatusCodes.OK, user);
    } catch (error: any) {
      return createErrorResponse(
        "An unexpected error occurred",
        500,
        error.message || "Unknown error"
      );
    }
  }

  async findAdminById(id: string): Promise<ApiResponse<AdminUser> | ErrorResponse> {
    try {
      let userDtl = await this.db.collection("admins").findOne({
        _id: new ObjectId(id),
        isActive: true,
      });


      if (!userDtl) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "No admin with the given ID found in the database."
        );
      }

      // Map MongoDB document to AdminUser type
      const user: AdminUser = {
        id: userDtl._id.toString(),
        permissions: userDtl.permissions,
        name: userDtl?.name,
        email: userDtl?.email,
        phoneNumber: userDtl?.phoneNumber,
        isActive: userDtl?.isActive,
        isDelete: userDtl?.isDelete,
        groupingId: userDtl.groupingId,
        userType: userDtl.userType
      };

      if (!user.isActive) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "The admin is inactive and cannot be processed."
        );
      }

      if (user.isDelete) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "Admin is in deleted state."
        );
      }

      return successResponse("Success", StatusCodes.OK, user);
    } catch (error: any) {
      return createErrorResponse(
        "An unexpected error occurred",
        500,
        error.message || "Unknown error"
      );
    }
  }



  async createAdmin(
    userData: CreateAdminInput
  ): Promise<ApiResponse<AdminUser> | ErrorResponse> {
    try {
      const findEmail = await Admin.findOne({
        email: userData.email,
        isDelete: 0,
      });

      if (findEmail) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "User email is exist"
        );
      }

      console.log("enter into a repo")
      const grouping = await GroupingTeamId.create({
        organizationName: userData.organizationName,
        country: userData.country,
        organizationType: userData.organizationType,
        numberOfStudentsOrEmployees: userData.numberOfStudentsOrEmployees,
      });

      const hasPass = await bcrypt.hash(userData.password, 10);

      // Create Admin linked to Grouping
      const admin = new Admin({
        name: userData.name,
        email: userData.email,
        password: hasPass,
        phoneNumber: userData.phoneNumber,
        groupingId: grouping._id,
        userType: "Admin"
      });

      await admin.save();

      const newTestConfig = await testValidationForCandidate.create({
        numberOfTestsPerCandidate: 1,
        numberOfDaysToAttend: 3,
        groupingId: new ObjectId(grouping._id), // Replace with actual grouping ID
        createdBy: new ObjectId(admin._id), // Replace with actual admin ID
        isActive: true, // Optional, default is true
      });

      console.log('New Test Config Created:', newTestConfig);

      const adminUser: AdminUser = {
        id: admin._id.toString(),
        permissions: admin.permissions,
        name: userData.name,
        email: userData.email,
        isActive: true,
        isDelete: false,
        groupingId: admin.groupingId.toString(),
        userType: admin.userType
      };
      return successResponse("Success", StatusCodes.OK, adminUser);

    } catch (error: any) {
      return createErrorResponse(
        "An unexpected error occurred",
        500,
        error.message || "Failed to create user"
      );
    }
  }
  async loginAdmin(
    userData: LoginAdminInput
  ): Promise<ApiResponse<{ user: AdminUser; token: string }> | ErrorResponse> {
    try {
      let adminExist = await Admin.findOne({
        email: userData.email,
        isActive: 1,
        isDelete: 0,
      });
      if (!adminExist) {
        adminExist = await AdminUsers.findOne({
          email: userData.email,
          isActive: 1,
          isDelete: 0,
        });
      }
      if (!adminExist) {
        return createErrorResponse("Admin email doesn't exist", 400);
      }
      const checkPass = await bcrypt.compare(
        userData.password,
        adminExist.password
      );
      if (!checkPass) {
        return createErrorResponse("Incorrect password", 400);
      }
      if (!_config?.JwtSecretKey) {
        return createErrorResponse(
          "Server configuration error: Secret key is missing",
          500
        );
      }
      // Generate JWT (1h expiry)
      const token = jwt.sign(
        { id: adminExist._id, email: adminExist.email, name: adminExist.name },
        _config?.JwtSecretKey,
        { expiresIn: _config.TokenDuration }
      );

      // Deactivate old tokens
      await AdminToken.updateMany(
        { adminId: adminExist._id, isActive: true },
        { $set: { isActive: false } }
      );

      // Create new token
      await AdminToken.create({
        adminId: adminExist._id,
        token,
        isActive: true,
        loginTime: new Date(),
      });

      const user: AdminUser = {
        id: adminExist._id.toString(),
        permissions: adminExist.permissions,
        name: adminExist.name,
        email: adminExist.email,
        isActive: adminExist.isActive,
        isDelete: adminExist.isDelete,
        groupingId: adminExist.groupingId.toString(),
        userType: adminExist.userType
      };
      return successResponse("Login successful", StatusCodes.OK, {
        user,
        token,
      });
    } catch (error: any) {
      return createErrorResponse(
        "An unexpected error occurred",
        500,
        error.message || "Failed to create user"
      );
    }
  }

  // Request password reset: generate and store reset token
  async forgotPassword(
    data: ForgotPasswordInput
  ): Promise<ApiResponse<any> | ErrorResponse> {
    try {
      const admin = await Admin.findOne({
        email: data.email,
        isActive: 1,
        isDelete: 0,
      });
      if (!admin) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "No admin with that email"
        );
      }

      const urlExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const urlToken = crypto.randomBytes(32).toString("hex")

      const tokenExists = await this.isFPtokenExist(admin._id.toString());
      if (tokenExists) {
        return createErrorResponse("error", StatusCodes.BAD_REQUEST, "A reset link is already active. Please wait until it expires.");
      }

      const fpReq = new forgotpassword({
        requestedId: new ObjectId(admin._id),
        createdBy: new ObjectId(admin._id),
        urlToken,
        urlExpiresAt,
        isActive: true,
        isDelete: false,
      });

      await fpReq.save();

      const link = `${_config?.WebsiteUrl}/reset-password?token=${urlToken}`;
      mailService.commonMailSend(
        "Forgot Password",
        data.email,
        "Reset link sended successfully.Please check your email",
        { name: admin?.name, link }
      );
      return successResponse("Reset token generated", StatusCodes.OK, {
        token: urlToken,
      });
    } catch (err: any) {
      return createErrorResponse(
        "error",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err.message
      );
    }
  }

  // Reset password using token
  async resetPassword(
    data: ResetPasswordInput, token: string
  ): Promise<ApiResponse<any> | ErrorResponse> {
    try {

      const findEmailUser = await AdminUsers.findOne({
        email: data.email,
        isActive: true,
        isDelete: false
      })

      if (!findEmailUser) {
        return createErrorResponse(
          "error",
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Account not found"
        );
      }

      const isURLtokenExpired = await forgotpassword.countDocuments({
        urlToken: token,
        isActive: true,
        isDelete: false,
        urlExpiresAt: { $gt: new Date() },
        requestedId: new ObjectId(findEmailUser?._id)
      })

      if (isURLtokenExpired === 0) {
        return createErrorResponse(
          "error",
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Link get expired. Request again"
        );
      }

      const admin = await Admin.findOne({
        _id: new ObjectId(findEmailUser._id),
        isActive: true,
        isDelete: false
      });


      if (!admin) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "Invalid user"
        );
      }
      const hashed = await bcrypt.hash(data.newPassword, 10);
      admin.password = hashed;
      await admin.save();

      await forgotpassword.updateOne(
        {
          urlToken: token,
          isActive: true,
          isDelete: false,
          urlExpiresAt: { $gt: new Date() },
          requestedId: new ObjectId(findEmailUser._id)
        },
        {
          $set: {
            isPasswordChanged: true,
            modifiedBy: new ObjectId(findEmailUser._id),
            isActive: false // deactivate token
          }
        }
      );


      return successResponse("Password reset successful", StatusCodes.OK, null);
    } catch (err: any) {
      return createErrorResponse("error", StatusCodes.BAD_REQUEST, err.message);
    }
  }

  // Change password when logged in
  async changePassword(
    id: string,
    data: ChangePasswordInput
  ): Promise<ApiResponse<any> | ErrorResponse> {
    try {

      const admin = await Admin.findOne({
        _id: new ObjectId(id),
        isActive: true,
        isDelete: false
      });

      if (!admin) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "Admin not found"
        );
      }
      const match = await bcrypt.compare(data.oldPassword, admin.password);
      if (!match) {
        return createErrorResponse(
          "error",
          StatusCodes.BAD_REQUEST,
          "Old password incorrect"
        );
      }
      const hashed = await bcrypt.hash(data.newPassword, 10);
      admin.password = hashed;
      await admin.save();
      return successResponse(
        "Password changed successfully",
        StatusCodes.OK,
        null
      );
    } catch (err: any) {
      return createErrorResponse(
        "error",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err.message
      );
    }
  }

  async isFPtokenExist(userId: string): Promise<boolean> {
    const existing = await forgotpassword.findOne({
      requestedId: new ObjectId(userId),
      isActive: true,
      isDelete: false,
      urlExpiresAt: { $gt: new Date() } // token not expired
    });

    return !!existing; // true if exists
  }

  async generateUniqueToken(userId: string): Promise<string> {
    let token: string = "";
    let exists = true;


    while (exists) {
      token = crypto.randomBytes(32).toString("hex");
      // Check if token already exists for this user and is active
      exists = await forgotpassword.exists({
        requestedId: new ObjectId(userId),
        urlToken: token,
        isActive: true,
        isDelete: false,
        urlExpiresAt: { $gt: new Date() }
      }) ? true : false;
    }

    return token;
  }

}

export function newAdminUserRepository(db: Db): IAdminRepository {
  return new AdminUserRepository(db);
}
