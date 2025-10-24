import { StatusCodes } from "http-status-codes";
import { CreateassessmentInput, UpdateassessmentInput } from "../../../api/Request/assessment";
import { assessmentRes, assessmentDtls } from "../../../api/response/assessment.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { assessmentListParams, AssRepositoryDomain, AssServiceDomain } from "../../../domain/admin/assessmentDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { AssessAnsInput, AssessmentSubmitionSchema } from "../../../api/Request/questionAns";

class AssessmentService implements AssServiceDomain {
    private readonly repo: AssRepositoryDomain

    constructor(repo: AssRepositoryDomain) {
        this.repo = repo
    }
    async questionAnswer(data: AssessAnsInput): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            return await this.repo.questionAnswer(data)

        } catch (error: any) {
            return createErrorResponse(
                'Error assessment question ',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async submitAssessment(data: AssessmentSubmitionSchema): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            return await this.repo.submitAssessment(data)

        } catch (error: any) {
            return createErrorResponse(
                'Error assessment question ',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async assementQuestion(token: string): Promise<PaginationResult<any[]> | ErrorResponse> {
        try {

            return await this.repo.assementQuestion(token)

        } catch (error: any) {
            return createErrorResponse(
                'Error assessment question ',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async sendAssessemntLink(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.repo.findAssessmentIdEist(id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'role not found.',
                    StatusCodes.CONFLICT
                );
            }

            return await this.repo.sendAssessemntLink(id, userId)

        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async createAssessment(data: CreateassessmentInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            if (data.isGroupCandidate && !data.assessmentGroupCandidateId) {
                return createErrorResponse(
                    'Candidate group id is missing',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Candidate group id is missing"
                );
            } else if (data.candidateIds?.length == 0) {
                return createErrorResponse(
                    'select candidate. candidate is missing',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'select candidate. candidate is missing'
                );
            }

            return await this.repo.createAssessment(data, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateAssessment(data: UpdateassessmentInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const isExist = await this.repo.findAssessmentIdEist(id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'role not found.',
                    StatusCodes.CONFLICT
                );
            }

            if (data.isGroupCandidate && !data.assessmentGroupCandidateId) {
                return createErrorResponse(
                    'Candidate group id is missing',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Candidate group id is missing"
                );
            } else if (data.candidateIds?.length == 0) {
                return createErrorResponse(
                    'select candidate. candidate is missing',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'select candidate. candidate is missing'
                );
            }

            return await this.repo.updateAssessment(data, id, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getAssessmentById(id: string, userId: string, groupId: string): Promise<ApiResponse<assessmentRes> | ErrorResponse> {
        try {
            const isExist = await this.repo.findAssessmentIdEist(id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'role not found.',
                    StatusCodes.CONFLICT
                );
            }

            return await this.repo.getAssessmentById(id, userId, groupId)

        } catch (error: any) {
            return createErrorResponse(
                'Error creating role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getAllAssessment(params: assessmentListParams, userId: string, groupId: string): Promise<PaginationResult<assessmentDtls[]> | ErrorResponse> {
        try {
            return await this.repo.getAllAssessment(params, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving role list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteAssessment(id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.repo.findAssessmentIdEist(id);

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


            return await this.repo.deleteAssessment(id, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error delete role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function newAssessmentServiceRegister(repo: AssRepositoryDomain): AssServiceDomain {
    return new AssessmentService(repo)
}