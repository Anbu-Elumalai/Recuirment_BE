import { StatusCodes } from "http-status-codes";
import { CreatecandidateInput, UpdatecandidateInput } from "../../../api/Request/candidate";
import { CandidateDtls } from "../../../api/response/candidate.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { CandidateRepositoryDomain, ListParams } from "../../../domain/admin/candidateDomain";
import { Db, ObjectId } from "mongodb";
import { createErrorResponse } from "../../../utils/common/errors";
import { CandidateModel } from "../../../app/model/candidate";
import lastInterviewDate from "../../../app/model/lastInterviewDate";
import adminUser from "../../../app/model/admin.user";
import { successResponse } from "../../../utils/common/commonResponse";

class CandidateRepository implements CandidateRepositoryDomain {
  private readonly db: Db

  constructor(db: Db) {
    this.db = db;
  }

  async findCandidateByEmail(email: string):Promise<ApiResponse<{id:string,name:string,email:string} > | ErrorResponse>{
    try {
      const canidateId = await CandidateModel.findOne({
        email:email,
        isActive:true,
        isDelete:false
      })
        
      if(!canidateId){
         return createErrorResponse(
        'Error  candidate not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Canidate not found"
      );
      }

        if(!canidateId.isActive){
         return createErrorResponse(
        'Error  candidate not in active state',
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Canidate not in active state"
      );
      }

       return successResponse(
        "Candidate fetched successfully",
        StatusCodes.OK,
        {id: canidateId?._id.toString(),
         name: canidateId.firstName,
         email:canidateId.email
        }
      );

    } catch (error:any) {
      return createErrorResponse(
        'Error  candidate not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
  async findPhNoisExistForUpdate(ph: string, userId: string, id: string, groupId: string): Promise<Boolean | ErrorResponse> {
  try {
      const count = await CandidateModel.countDocuments({
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
    }  }
  async findPhoneNoisExist(ph: string, userId: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
        const count = await CandidateModel.countDocuments({
        groupingId: new ObjectId(groupId),
        phone: ph,
        isActive: true,
        isDelete: false
      })

      console.log(count);

      return count == 0
    } catch (error:any) {
       return createErrorResponse(
        'Error  candidate ph not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
  async findEmailisExistForUpdate(email: string, userId: string, id: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await CandidateModel.countDocuments({
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
  async findEmailisExist(email: string, userId: string, groupId: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await CandidateModel.countDocuments({
        groupingId: new ObjectId(groupId),
        email: email,
        isActive: true,
        isDelete: false
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

  async findCandidateIdExist(id: string): Promise<Boolean | ErrorResponse> {
    try {
      const count = await CandidateModel.countDocuments({
        _id: new ObjectId(id),
        isActive: true,
        isDelete: false
      });

      console.log(count);

      return count == 1
    } catch (error: any) {
      return createErrorResponse(
        'Error  candidate not found',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async findLastInterviews(email: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const emailExist = await adminUser.findOne({
        email: email,
        isActive: true,
        isDelete: false
      })

      if (!emailExist) {
        return createErrorResponse(
          'Error creating candidate',
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Admin email not found"
        );
      }
      // Find interviews for the candidate in the last 3 months using createdAt
      const interviews = await lastInterviewDate
        .find({
          candidateId: new ObjectId(emailExist?._id),
          createdAt: { $gte: threeMonthsAgo }, // using createdAt instead of interviewDate
        })
        .sort({ createdAt: -1 }).limit(1); // latest first

      return {
        count: interviews.length,
        statusCode: StatusCodes.OK,
      };
    } catch (error: any) {
      return createErrorResponse(
        'Error creating role',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async findAdminOrganization(userId: string): Promise<{ origanizationType: string; statusCode: number; } | ErrorResponse> {
    try {
      const admin = await adminUser.findOne({
        _id: new ObjectId(userId),
        isActive: true,
        isDelete: false,
      });

      if (!admin) {
        return createErrorResponse(
          "Error creating candidate",
          StatusCodes.NOT_FOUND,
          "Admin with given ID not found"
        );
      }

      return {
        origanizationType: "",
        statusCode: StatusCodes.OK,
      };

    } catch (error: any) {
      return createErrorResponse(
        'Error creating candidate',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

 
  async findCandidateById(id: string): Promise<ApiResponse<CandidateDtls> | ErrorResponse> {
    try {
      const candidate = await CandidateModel.findById({
        _id: new ObjectId(id),
        isActive: true,
        isDelete: false
      })

      if (!candidate) {
        return createErrorResponse(
          "Candidate not found",
          StatusCodes.NOT_FOUND,
          `No active candidate found with ID ${id}`
        );
      }

      // Map mongoose document to CandidateDtls interface
      const result: CandidateDtls = {
        _id: candidate._id.toString(),
        firstName: candidate.firstName,
        lastName: candidate.lastName || "",
        email: candidate.email,
        phone: candidate.phone || "",
        linkedinUrl: candidate.linkedinUrl || "",
        isActive: candidate.isActive,
        isDelete: candidate.isDelete,
        createdBy: candidate.createdBy ? candidate.createdBy.toString() : "",
        modifiedBy: candidate.modifiedBy ? candidate.modifiedBy.toString() : "",
        createdAt: candidate.createdAt.toISOString(),
        updatedAt: candidate.updatedAt.toISOString(),
      };

      return successResponse(
        "Candidate fetched successfully",
        StatusCodes.OK,
        result
      );
    } catch (error: any) {
      return createErrorResponse(
        'Error creating role',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async findAllCandidate(params: ListParams, userId: string): Promise<PaginationResult<CandidateDtls[]> | ErrorResponse> {
    try {

      const { page, limit, type } = params

      const matchStage: any = {
        isActive: true,
        isDelete: false,
        createdBy: new ObjectId(userId),
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
          $lookup: {
            from: "skills",
            localField: "skills",
            foreignField: "_id",
            as: "skillDetails",
          },
        },

        // Project
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
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

      const roleDtls = await CandidateModel.aggregate(pipeline);
      const count = await CandidateModel.countDocuments({ isActive: 1, isDelete: 0 })
      return Pagination(count, roleDtls, limit, page)

    } catch (error: any) {
      return createErrorResponse(
        'Error creating role',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

   async createCandidate(validatedData: CreatecandidateInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
    try {
    

      // Form candidate object explicitly
      const candidateObj: any = {
        firstName: validatedData.firstName,
        middleName: validatedData.middleName || "",
        lastName: validatedData.lastName || "",
        email: validatedData.email,
        phone: validatedData.phone || "",
        createdBy:new ObjectId(userId),
        modifiedBy: null,
        groupingId: new ObjectId(groupId)
      };

      // Save to DB
      const candidate = await CandidateModel.create(candidateObj);
      const result: SuccessMessage = {
        message: 'Candidate deleted success.'
      };
      return successResponse(
        "Candidate created successfully",
        StatusCodes.OK,
        result
      )
    } catch (error: any) {
      return createErrorResponse(
        'Error creating role',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }


  async updateCandidate(validatedData: UpdatecandidateInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
    try {

      // Form candidate object explicitly
      const candidateObj: any = {
        firstName: validatedData.firstName,
        middleName: validatedData.middleName || "",
        lastName: validatedData.lastName || "",
        email: validatedData.email,
        phone: validatedData.phone || "",
        linkedinUrl: validatedData.linkedinUrl || "",
        modifiedBy: new ObjectId(userId), // who modified
        groupingId: new ObjectId(groupId)
      };

      const updateResult = await CandidateModel.updateOne(
        { _id: new ObjectId(id) }, // filter
        { $set: candidateObj } // fields to update
      );

      if (updateResult.modifiedCount === 0) {
        return createErrorResponse(
          'Error in Candidate delete',
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
  async deleteCandidate(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
    try {
      const delteProduct = await CandidateModel.findOneAndUpdate(
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

      if (!delteProduct) {
        return createErrorResponse(
          'Error in candidate delete',
          StatusCodes.NOT_FOUND,
          'role with given ID not found'
        );
      }

      const result: SuccessMessage = {
        message: 'candidate deleted success.'
      };
      return successResponse("candidate deleted successfully", StatusCodes.OK, result);

    } catch (error: any) {
      return createErrorResponse(
        'Error delete candidate',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
}
/**
 * Factory function to create a new roleRepository instance
 * @param db - MongoDB database instance
 * @returns roleDomainRepository instance
 */
export function NewCandidateRrpository(db: Db): CandidateRepositoryDomain {
  return new CandidateRepository(db);
}