import { StatusCodes } from "http-status-codes";
import { QuestionSchemaInput, UpdateQuestionInput } from "../../../api/Request/question";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { QuestionDtls } from "../../../api/response/question.response";
import { questionListParams, QuestionRepositoryDomain } from "../../../domain/admin/questionDomain";
import { Db, ObjectId } from "mongodb";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import { QuestionModel } from "../../../app/model/question";
import { CandidateRepositoryDomain } from "../../../domain/admin/candidateDomain";
import adminUser from "../../../app/model/admin.user";

class QuestionRepository implements QuestionRepositoryDomain {
    private readonly db: Db 
    private readonly candidateRepo: CandidateRepositoryDomain 

    constructor(db: Db, candidateRepo: CandidateRepositoryDomain) {
        this.db = db
        this.candidateRepo= candidateRepo
    }
    async createQuestion(data: QuestionSchemaInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
       try {
        // Convert skill IDs to ObjectIds
    const skillIds = data.skills?.map((e) => new ObjectId(e)) || [];

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

    // Create question object
    const questionObj: any = {
      questionText: data.questionText,
      options: data.options, // [{ text: string, isCorrect: boolean }]
      category: new ObjectId(data.category),
      skills: skillIds,
      difficultyLevel: data.difficultyLevel,
      timeLimit: data.timeLimit,
      marks: data.marks,
      createdBy: new ObjectId(userId),
      modifiedBy: null,
      groupingId: new ObjectId(groupId)

    };

    // switch (admin.organizationType) {
    //   case "company":
    //     questionObj.questionFor = "professional";
    //     break;
    //   case "college":
    //     questionObj.questionFor = "college";
    //     break;
    //   case "school":
    //     questionObj.questionFor = "school";
    //     break;
    //   default:
    //     questionObj.questionFor = "professional";
    // }

    // Save to DB
    const question = await QuestionModel.create(questionObj);

    if (!question) {
      return createErrorResponse(
        "Failed to create question",
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Unable to save question to database"
      );
    }

    const result: SuccessMessage = {message: 'question created success.'};

    return successResponse("group deleted successfully", StatusCodes.OK,result );
        
       } catch (error:any) {
          return createErrorResponse(
                "Error create question",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
       }
    }
    async findQuestionExist(questionText: string, skills: string[], categories: string , groupId: string): Promise<{ count: number; statusCode: number } | ErrorResponse> {
        try {
            const count = await QuestionModel.countDocuments({
                questionText: questionText,
                $or: [
                    { skills: { $in: skills.map((id) => new ObjectId(id)) } },
                    { categories: new ObjectId(categories) }
                ],
                groupingId: new ObjectId(groupId)
            });

            return {
                count,
                statusCode: 200,
            };

        } catch (error: any) {
            return createErrorResponse(
                "Error finding question",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findQuestionByIdExist(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await QuestionModel.countDocuments({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false
            });

            return count == 1;
        } catch (error: any) {
            return createErrorResponse(
                "Error finding question in product",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateQuestion(data: UpdateQuestionInput,id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
      try {
          // Convert skill IDs to ObjectIds
    const skillIds = data.skills?.map((e) => new ObjectId(e)) || [];

    // Check if admin exists
    const admin = await adminUser.findOne({
      _id: new ObjectId(userId),
      isActive: true,
      isDelete: false,
    });

    if (!admin) {
      return createErrorResponse(
        "Error updating question",
        StatusCodes.NOT_FOUND,
        "Admin with given ID not found"
      );
    }

    // Prepare update object
    const updateObj: any = {
      questionText: data.questionText,
      options: data.options,
      category: new ObjectId(data.category),
      skills: skillIds,
      difficultyLevel: data.difficultyLevel,
      timeLimit: data.timeLimit,
      marks: data.marks,
      modifiedBy: new ObjectId(userId),
      groupingId: new ObjectId(groupId)
    };

    // Update the question
    const result = await QuestionModel.updateOne(
      { _id: new ObjectId(id), isActive: true, isDelete: false },
      { $set: updateObj }
    );

    if (result.modifiedCount === 0) {
      return createErrorResponse(
        "No question updated",
        StatusCodes.NOT_FOUND,
        `Question with id ${id} not found or no changes applied`
      );
    }

    const results: SuccessMessage = {message: 'question updated success.'};

    return successResponse("question updated successfully", StatusCodes.OK,results );
        
      } catch (error:any) {
         return createErrorResponse(
                "Error finding question in product",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
      }
    }

    async getQuestionById(id: string): Promise<ApiResponse<QuestionDtls> | ErrorResponse> {
        try {
            // Find the question and ensure it's active and not deleted
            const question = await QuestionModel.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false,
            })

            if (!question) {
                return createErrorResponse(
                    "Question not found",
                    StatusCodes.NOT_FOUND,
                    `No question found with id: ${id}`
                );
            }

            const response: QuestionDtls = {
                _id: question._id.toString(),
                questionText: question.questionText,
                options: question.options,
                category: question.category.toString(),
                skills: question.skills.map((s: any) => s?.toString()), 
                difficultyLevel: question.difficultyLevel,
                timeLimit: question.timeLimit,
                marks: question.marks,
                isActive: question.isActive,
                createdAt: question.createdAt,
                updatedAt: question.updatedAt,
                createdBy: question.createdBy?.toString()
            };

            return {
                status: "success",
                statusCode: StatusCodes.OK,
                data: response,
                message: "Question fetched successfully"
            };
        } catch (error: any) {
            return createErrorResponse(
                "Error fetching question",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async getAllQuestion(params: questionListParams, userId: string, groupId: string): Promise<PaginationResult<QuestionDtls[]> | ErrorResponse> {
        try {
            const { page, limit, type } = params

            const pipeline: any = [
                {
                    $match: {
                        isActive: true,
                        isDelete: false,
                        groupingId: new ObjectId(groupId)
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
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "categoryDtls",
                    },
                },
                {
                    $addFields: {
                        skillName: {
                            $cond: {
                                if: { $isArray: "$skillDetails" },
                                then: {
                                    $reduce: {
                                        input: "$skillDetails",
                                        initialValue: "",
                                        in: {
                                            $concat: [
                                                "$$value",
                                                { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
                                                "$$this.name",
                                            ],
                                        },
                                    },
                                },
                                else: "",
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        questionText: 1,
                        category: { $arrayElemAt: ["$categoryDtls.name", 0] },
                        options: 1,
                        difficultyLevel: 1,
                        timeLimit: 1,
                        marks: 1,
                        isActive: 1,
                        isDelete: 1,
                        skillName: 1,
                        createdBy: { $arrayElemAt: ["$createdBy.name", 0] },
                        modifiedBy: { $arrayElemAt: ["$modifiedBy.name", 0] },
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

            const groupDtls = await QuestionModel.aggregate(pipeline);
            const count = await QuestionModel.countDocuments({ isActive: 1, isDelete: 0 })
            return Pagination(count, groupDtls, limit, page)
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving group details',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteQuestion(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const delteProduct = await QuestionModel.findOneAndUpdate(
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
                    'Error in question delete',
                    StatusCodes.NOT_FOUND,
                    'question with given ID not found'
                );
            }

            const result: SuccessMessage = {
                message: 'question deleted success.'
            };
            return successResponse("question deleted successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error delete question',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function newQuestionRegister(db: Db, candidateRepo: CandidateRepositoryDomain): QuestionRepositoryDomain {
    return new QuestionRepository(db, candidateRepo)
}