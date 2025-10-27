import { StatusCodes } from "http-status-codes";
import { CreateUSerInput, UpdateuserInput } from "../../../api/Request/user";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { User } from "../../../api/response/user.response";
import adminUser from "../../../app/model/admin.user";
import { UserDomainRepository, userListParams } from "../../../domain/admin/admin.userDomain";
import { Db, ObjectId } from "mongodb";
import { createErrorResponse } from "../../../utils/common/errors";
import bcrypt from "bcrypt";
import { successResponse } from "../../../utils/common/commonResponse";
import subscription from "../../../app/model/subscription";

class UserRepository implements UserDomainRepository {

  private readonly db: Db
  constructor(db: Db) {
    this.db = db
  }

  async findPhoneNoisExist(ph: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await adminUser.countDocuments({
        groupingId: new ObjectId(groupId),
        phone: ph,
        isActive: true,
        isDelete: false
      })

      console.log(count);

      return count == 0
    } catch (error: any) {
      return createErrorResponse(
        'Error  candidate ph not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async findEmailisExist(email: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await adminUser.countDocuments({
        groupingId: new ObjectId(groupId),
        email: email,
        isActive: true,
        isDelete: false
      })

      console.log(count);

      return count == 0

    } catch (error: any) {
      return createErrorResponse(
        'Error  user creation not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
  async createuser(userData: CreateUSerInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
    try {

      const currentDate = new Date();

      const currentPlanDetails = await subscription.findOne({
        'metadata.groupId': new ObjectId(groupId), // filter by group
        status: { $in: ['active', 'renewed'] },                  // active or renewed subscription
        next_billing_date: { $gte: currentDate }
      })
        .populate('metadata.planId')
        .sort({ next_billing_date: -1 });


      if (currentPlanDetails && currentPlanDetails.metadata?.planId) {

        const plan = currentPlanDetails.metadata!.planId as any;

        const adminLimit = plan.adminLimit;


        const countUser = await adminUser.countDocuments({
          groupingId: new ObjectId(groupId),
          isActive: true,
          isDelete: false
        })

        if (countUser > adminLimit) {
          return createErrorResponse(
            "Error",
            StatusCodes.BAD_REQUEST,
            "Admin user limit exceeded for this plan"
          );
        }
      } else {
        return createErrorResponse(
          "Error",
          StatusCodes.BAD_REQUEST,
          "Active subscription plan not found"
        );
      }


      const hasPass = await bcrypt.hash(userData.password, 10);

      const admin = new adminUser({
        name: userData.name,
        email: userData.email,
        password: hasPass,
        phoneNumber: userData.phoneNumber,
        groupingId: new ObjectId(groupId),
        userType: "User",
        createdBy: new ObjectId(userId),
        modifiedBy: null,
      });

      await admin.save();

      return successResponse(
        "Candidate created successfully",
        StatusCodes.OK,
        { message: "Candidate created successfully" },
      );
    } catch (error: any) {
      return createErrorResponse(
        'Error  user creation not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async findPhNoisExistForUpdate(ph: string, userId: string, id: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await adminUser.countDocuments({
        groupingId: new ObjectId(groupId),
        phone: ph,
        isActive: true,
        isDelete: false,
        _id: { $ne: new ObjectId(id) },
      })

      return count == 0

    } catch (error: any) {
      return createErrorResponse(
        'Error  candidate not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async findEmailisExistForUpdate(email: string, userId: string, id: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await adminUser.countDocuments({
        groupingId: new ObjectId(groupId),
        email: email,
        isActive: true,
        isDelete: false,
        _id: { $ne: new ObjectId(id) },
      })

      console.log(count);

      return count == 0

    } catch (error: any) {
      return createErrorResponse(
        'Error  candidate not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async updateuser(userData: UpdateuserInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
    try {

      // Form candidate object explicitly
      const userObj: any = {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        groupingId: new ObjectId(groupId),
        userType: "User",
        modifiedBy: new ObjectId(userId),
      }

      const updateResult = await adminUser.updateOne(
        { _id: new ObjectId(id) }, // filter
        { $set: userObj } // fields to update
      );

      if (updateResult.modifiedCount === 0) {
        return createErrorResponse(
          'Error in Candidate update',
          StatusCodes.NOT_FOUND,
          'Candidate with given ID not found'
        );

      }

      const result: SuccessMessage = {
        message: 'Candidate deleted success.'
      };
      return successResponse(
        "Candidate updated successfully",
        StatusCodes.OK,
        result
      )
    } catch (error: any) {
      return createErrorResponse(
        'Error updated role',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
  async finduserIdExist(id: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await adminUser.countDocuments({
        _id: new ObjectId(id),
        isActive: true,
        isDelete: false
      });

      console.log(count);

      return count == 1

    } catch (error: any) {
      return createErrorResponse(
        'Error admin user id is not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async finduserById(id: string): Promise<ApiResponse<User> | ErrorResponse> {
    try {
      const user = await adminUser.findById({
        _id: new ObjectId(id),
        isActive: true,
        isDelete: false
      })

      if (!user) {
        return createErrorResponse(
          "User not found",
          StatusCodes.NOT_FOUND,
          `No active user found with ID ${id}`
        );
      }

      // Map mongoose document to CandidateDtls interface
      const result: User = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        isDelete: user.isDelete,
        groupingId: user.groupingId.toString()
      };

      return successResponse(
        "User fetched successfully",
        StatusCodes.OK,
        result
      );
    } catch (error: any) {
      return createErrorResponse(
        'Error user fetch',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
  async getuserList(params: userListParams, userId: string, groupId: string): Promise<PaginationResult<User> | ErrorResponse> {
    try {
      const { page, limit, type } = params
      const matchStage: any = {
        isActive: true,
        isDelete: false,
        createdBy: new ObjectId(userId),
        groupId: new ObjectId(groupId)
      };

      const pipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: "admins",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },

        {
          $lookup: {
            from: "admins",
            localField: "modifiedBy",
            foreignField: "_id",
            as: "modifiedBy",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            phoneNumber: 1,
            // Flags
            isActive: 1,
            isDelete: 1,
            createdBy: { $arrayElemAt: ['$createdBy.name', 0] },
            modifiedBy: { $arrayElemAt: ['$modifiedBy.name', 0] },
            // Timestamps
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];
      if (type !== 'all') {
        pipeline.push(
          { $skip: page * limit },
          { $limit: limit }
        );
      }

      const roleDtls = await adminUser.aggregate(pipeline);
      const count = await adminUser.countDocuments({ isActive: 1, isDelete: 0 })
      return Pagination(count, roleDtls, limit, page)

    } catch (error: any) {
      return createErrorResponse(
        'Error fetching user',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
  async deleteuser(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
    try {
      const userDelete = await adminUser.findOneAndUpdate(
        { _id: new ObjectId(id), isActive: true, isDelete: false },
        {
          $set: {
            isDelete: true,
            modifiedBy: new ObjectId(userId),
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!userDelete) {
        return createErrorResponse(
          'Error in user delete',
          StatusCodes.NOT_FOUND,
          'user with given ID not found'
        );
      }

      const result: SuccessMessage = {
        message: 'user deleted success.'
      };
      return successResponse("user deleted successfully", StatusCodes.OK, result);

    } catch (error: any) {
      return createErrorResponse(
        'Error delete user',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }


}

export function newUserRepositoryRegister(db: Db): UserDomainRepository {
  return new UserRepository(db)
}