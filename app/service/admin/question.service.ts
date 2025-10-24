import { StatusCodes } from "http-status-codes";
import { QuestionSchemaInput, UpdateQuestionInput } from "../../../api/Request/question";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { QuestionDtls } from "../../../api/response/question.response";
import { questionListParams, QuestionRepositoryDomain, QuestionServiceDomain } from "../../../domain/admin/questionDomain";
import { createErrorResponse } from "../../../utils/common/errors";

class QuestionService implements QuestionServiceDomain {
    private readonly repo: QuestionRepositoryDomain

    constructor(repo: QuestionRepositoryDomain) {
        this.repo = repo
    }
    async createQuestion(data: QuestionSchemaInput, userId: string , groupId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            // Check for existing question name
            const existingquestion = await this.repo.findQuestionExist(data.questionText, data.skills, data.category, groupId);

            // Handle potential error from repository
            if ('status' in existingquestion && existingquestion.status === 'error') {
                return existingquestion as ErrorResponse;
            }

            // At this point, existingquestion must be the success response type
            const questionExists = existingquestion as { count: number; statusCode: number };

            // Check if question already exists
            if (questionExists.statusCode === StatusCodes.OK && questionExists.count > 0) {
                return createErrorResponse(
                    'Question already exists based on skill or category',
                    StatusCodes.CONFLICT
                );
            }

            // Create the question
            return await this.repo.createQuestion(data, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error update question',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateQuestion(data: UpdateQuestionInput, id: string, userId: string, groupId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const isExist = await this.repo.findQuestionByIdExist(id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'question not found.',
                    StatusCodes.CONFLICT
                );
            }
            // Check for existing question name
            const existingquestion = await this.repo.findQuestionExist(data.questionText, data.skills, data.category, groupId);

            // Handle potential error from repository
            if ('status' in existingquestion && existingquestion.status === 'error') {
                return existingquestion as ErrorResponse;
            }

            // At this point, existingquestion must be the success response type
            const questionExists = existingquestion as { count: number; statusCode: number };

            // Check if question already exists
            if (questionExists.statusCode === StatusCodes.OK && questionExists.count > 0) {
                return createErrorResponse(
                    'Question already exists based on skill or category',
                    StatusCodes.CONFLICT
                );
            }

            // Create the question
            return await this.repo.updateQuestion(data, id, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error update question',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getQuestionById(id: string): Promise<ApiResponse<QuestionDtls> | ErrorResponse> {
        try {
            const isExist = await this.repo.findQuestionByIdExist(id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'question not found.',
                    StatusCodes.CONFLICT
                );
            }

            return await this.repo.getQuestionById(id)

        } catch (error: any) {
            return createErrorResponse(
                'Error creating question',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getAllQuestion(params: questionListParams, userId: string, groupId: string): Promise<PaginationResult<QuestionDtls[]> | ErrorResponse> {
        try {
            return await this.repo.getAllQuestion(params, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving question list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteQuestion(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.repo.findQuestionByIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'role not found',
                    StatusCodes.BAD_REQUEST,
                    'Error role not found'
                );
            }


            return await this.repo.deleteQuestion(id, userId);
        } catch (error: any) {
            return createErrorResponse(
                'Error delete role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }


}

export function newQuestionSeviceRegistor(repo: QuestionRepositoryDomain): QuestionServiceDomain {
    return new QuestionService(repo)
}