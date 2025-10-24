import { StatusCodes } from "http-status-codes";
import { AutoSelectInput, GroupQuestionSchemaInput, GroupUpdateQuestionInput } from "../../../api/Request/groupQuestion";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { QuestionGroupDtls, QuestionGroupForProfessionals, QuestionGroupSkillDtls } from "../../../api/response/question.group.response";
import { GroupQuestionRepositoryDomain, questionListParams } from "../../../domain/admin/questionGroupDomain";
import { Db, ObjectId } from "mongodb";
import { createErrorResponse } from "../../../utils/common/errors";
import { QuestionGroupModel } from "../../../app/model/question.group";
import { successResponse } from "../../../utils/common/commonResponse";
import Pagination from "../../../api/response/paginationResponse";
import { QuestionModel } from "../../../app/model/question";

class QuestionGroupRepository implements GroupQuestionRepositoryDomain {
    private readonly db: Db

    constructor(db: Db) {
        this.db = db
    }
    async findGroupQuestionNameExist(name: string, userId: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await this.db.collection('questiongroups').countDocuments({
                groupName: name.trim(),
                isDelete: false,
                isActive: true,
                createdBy: new ObjectId(userId)
            });

            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error checking group question existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findGroupQuestionNameExistForUpdate(name: string, userId: string, id: string): Promise<{ count: number; statusCode: number; } | ErrorResponse> {
        try {
            const count = await this.db.collection('questiongroups').countDocuments({
                groupName: name.trim(),
                isDelete: false,
                isActive: true,
                _id: { $ne: new ObjectId(id) },
                createdBy: new ObjectId(userId)
            });

            return {
                count,
                statusCode: StatusCodes.OK
            };
        } catch (error: any) {
            return createErrorResponse(
                'Error checking group question existence',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async creaGroupQuestion(data: GroupQuestionSchemaInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            // Convert IDs to ObjectIds safely
            const formSkillBaseQuestion = data.formSkillBaseQuestion?.map((item) => ({
                skills: new ObjectId(item.skills),
                categories: new ObjectId(item.categories),
                difficultyLevel: item.difficultyLevel,
                numberOfQuestion: item.numberOfQuestion,
            })) || [];

            if (formSkillBaseQuestion.length == 0) {
                return createErrorResponse(
                    'Error creating form skill base question is 0',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Form skill base question is 0"
                );
            }

            const calculateDurationSelectedQuestion = await QuestionModel.find({
                _id: { $in: data.selectedQuestions.map((id: string) => new ObjectId(id)) }
            });

            // Total duration in seconds
            const totalDurationInSeconds = calculateDurationSelectedQuestion.reduce((acc, question) => {
                return acc + (question.timeLimit || 0);
            }, 0);

            // Convert to minutes (rounded up)
            const totalDurationInMinutes = Math.ceil(totalDurationInSeconds / 60);
            const questionGroupObj: any = {
                groupName: data.questionGroupName,
                formSkillBaseQuestion,
                totalNumberOfQuestion: data.totalNumberOfQuestion || 0,
                autoSelect: data.autoSelect ?? false,
                selectedQuestions: data.selectedQuestions?.map((id) => new ObjectId(id)) || [],
                createdBy: new ObjectId(userId),
                modifiedBy: null,
                groupingId: new ObjectId(groupId),
                totalDuration: totalDurationInMinutes
            };

            const questionGroup = await QuestionGroupModel.create(questionGroupObj);

            if (!questionGroup) {
                return createErrorResponse(
                    "Failed to create question",
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Unable to save question to database"
                );
            }

            const result: SuccessMessage = { message: 'question created success.' };

            return successResponse("group deleted successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error in create group question',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findGroupQuestionIdExist(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await QuestionGroupModel.countDocuments({
                _id: new ObjectId(id),
            });

            console.log(count);

            return count == 1
        } catch (error: any) {
            return createErrorResponse(
                'Error  question group not found',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateGroupQuestion(data: GroupUpdateQuestionInput, id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const formSkillBaseQuestion = data.formSkillBaseQuestion?.map((item) => ({
                skills: new ObjectId(item.skills),
                categories: new ObjectId(item.categories),
                difficultyLevel: item.difficultyLevel,
                numberOfQuestion: item.numberOfQuestion,
            })) || [];

            
            const calculateDurationSelectedQuestion = await QuestionModel.find({
                _id: { $in: data.selectedQuestions.map((id: string) => new ObjectId(id)) }
            });

            // Total duration in seconds
            const totalDurationInSeconds = calculateDurationSelectedQuestion.reduce((acc, question) => {
                return acc + (question.timeLimit || 0);
            }, 0);

            // Convert to minutes (rounded up)
            const totalDurationInMinutes = Math.ceil(totalDurationInSeconds / 60);
           
            const updateObj: any = {
                groupName: data.questionGroupName,
                formSkillBaseQuestion,
                totalNumberOfQuestion: data.totalNumberOfQuestion || 0,
                autoSelect: data.autoSelect ?? true,
                selectedQuestions: data.selectedQuestions?.map((id) => new ObjectId(id)) || [],
                modifiedBy: new ObjectId(userId),
                  totalDuration: totalDurationInMinutes
            };

            const result = await QuestionGroupModel.updateOne(
                {
                    _id: new ObjectId(id),
                    isActive: true,
                    isDelete: false,
                },
                { $set: updateObj }
            );

            if (result.matchedCount === 0) {
                return createErrorResponse(
                    "Question group not found",
                    StatusCodes.NOT_FOUND,
                    "No active question group with the given ID"
                );
            }

            const res: SuccessMessage = { message: 'question created success.' };

            return successResponse("group updated successfully", StatusCodes.OK, res);

        } catch (error: any) {
            return createErrorResponse(
                'Error  question group not found',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getGroupQuestionById(id: string, userId: string): Promise<ApiResponse<QuestionGroupDtls> | ErrorResponse> {
        try {
            const groupQuestion = await QuestionGroupModel.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false,
            }).lean(); // use lean() for plain JS object

            if (!groupQuestion) {
                return createErrorResponse(
                    "Question group not found",
                    StatusCodes.NOT_FOUND,
                    "No question group exists with this ID"
                );
            }

            const resp: QuestionGroupDtls = {
                _id: groupQuestion._id.toString(),
                groupName: groupQuestion.groupName,
                formSkillBaseQuestion: groupQuestion.formSkillBaseQuestion?.map((item: any) => ({
                    skills: item.skills?.toString() || "",
                    categories: item.categories?.toString() || "",
                    difficultyLevel: item.difficultyLevel || [],
                    numberOfQuestion: item.numberOfQuestion || 0,
                })) || [],
                totalNumberOfQuestion: groupQuestion.totalNumberOfQuestion || 0,
                autoSelect: groupQuestion.autoSelect ?? false,
                selectedQuestions: groupQuestion.selectedQuestions?.map((q: any) => q.toString()) || [],
                createdBy: groupQuestion.createdBy?.toString() || "",
                modifiedBy: groupQuestion.modifiedBy?.toString() || "",
                isActive: groupQuestion.isActive ?? true,
                isDelete: groupQuestion.isDelete ?? false,
                createdAt: groupQuestion.createdAt,
                updatedAt: groupQuestion.updatedAt,
            };

            return successResponse('group details retrieved successfully', StatusCodes.OK, resp);


        } catch (error: any) {
            return createErrorResponse(
                'Error  question group not found',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getAllGroupQuestion(param: questionListParams, userId: string, groupId: string): Promise<ApiResponse<QuestionGroupDtls[]> | ErrorResponse> {
        try {
            const { page, limit, type } = param

            const pipeline: any = [
                {
                    $match: {
                        isActive: true,
                        isDelete: false,
                        createdBy: new ObjectId(userId),
                        groupingId: new ObjectId(groupId)
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
                    $project: {
                        _id: 1,
                        groupName: 1,
                        isActive: 1,
                        isDelete: 1,
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

            const groupDtls = await QuestionGroupModel.aggregate(pipeline);
            const count = await QuestionGroupModel.countDocuments({ isActive: 1, isDelete: 0 })
            return Pagination(count, groupDtls, limit, page)
        } catch (error: any) {
            return createErrorResponse(
                'Error delete any question',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteGroupQuestion(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const delteProduct = await QuestionGroupModel.findOneAndUpdate(
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
                    'Error in group question delete',
                    StatusCodes.NOT_FOUND,
                    'group question with given ID not found'
                );
            }

            const result: SuccessMessage = {
                message: 'group question deleted success.'
            };
            return successResponse("group question deleted successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error delete group question',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    // in list if i give a question group id it will fetch a data of the id ...for id specfied category and skill
    async findQuestionGroupBaseSkill(id: string): Promise<ApiResponse<QuestionGroupSkillDtls[]> | ErrorResponse> {
        try {
            const questionSkill = await QuestionGroupModel.aggregate([
                {
                    $match: {
                        _id: new ObjectId(id),
                        isActive: true,
                        isDelete: false,

                    },
                },
                {
                    $unwind: "$formSkillBaseQuestion",
                },
                {
                    $lookup: {
                        from: "skills",
                        localField: "formSkillBaseQuestion.skills",
                        foreignField: "_id",
                        as: "formSkillBaseQuestion.skillDtls",
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "formSkillBaseQuestion.categories",
                        foreignField: "_id",
                        as: "formSkillBaseQuestion.categoryDtls",
                    },
                },
                {
                    $group: {
                        _id: "$_id",
                        totalNumberOfQuestion: { $first: "$totalNumberOfQuestion" },
                        formSkillBaseQuestion: {
                            $push: {
                                skills: { $arrayElemAt: ["$formSkillBaseQuestion.skillDtls.name", 0] },
                                categories: { $arrayElemAt: ["$formSkillBaseQuestion.categoryDtls.name", 0] },
                                difficultyLevel: "$formSkillBaseQuestion.difficultyLevel",
                                numberOfQuestion: "$formSkillBaseQuestion.numberOfQuestion",
                            },
                        },
                    },
                },
            ]);

            return successResponse("group question deleted successfully", StatusCodes.OK, questionSkill)
        } catch (error: any) {
            return createErrorResponse(
                'Error group question skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getAutoSelectedQuestion(data: AutoSelectInput, groupId: string): Promise<ApiResponse<QuestionGroupForProfessionals[]> | ErrorResponse> {
        try {
            const selectedQuestions: QuestionGroupForProfessionals[] = [];

            for (const item of data.formSkillBaseQuestion) {
                const { skills, categories, difficultyLevel, numberOfQuestion } = item;

                // Fetch random questions for each skill-category-difficulty combination
                const questions = await QuestionModel.aggregate([
                    {
                        $match: {
                            skills: new ObjectId(skills),
                            category: new ObjectId(categories),
                            difficultyLevel: difficultyLevel,
                            isActive: true,
                            isDelete: false,
                            groupingId: new ObjectId(groupId)
                        },
                    },
                    { $sample: { size: numberOfQuestion } },
                    {
                        $project: {
                            _id: 1,
                            questionText: 1,
                            options: 1,
                            category: 1,
                            skills: 1,
                            difficultyLevel: 1,
                            marks: 1,
                            timeLimit: 1,
                        },
                    },
                ]);

                selectedQuestions.push(...(questions as QuestionGroupForProfessionals[]));
            }

            // Optional: limit total selected questions
            const limitedQuestions = selectedQuestions.slice(0, data.totalNumberOfQuestion);

            return successResponse(`Auto-selected ${limitedQuestions.length} questions successfully`, StatusCodes.OK, limitedQuestions);

        } catch (error: any) {
            return createErrorResponse(
                'Error group question skill',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }

    }

}
export function newQuestionGroupRepoSitoryRegister(db: Db): GroupQuestionRepositoryDomain {
    return new QuestionGroupRepository(db)
}