import { StatusCodes } from "http-status-codes";
import { CreatecandidateInput, UpdatecandidateInput } from "../../../api/Request/candidate";
import { CandidateDtls } from "../../../api/response/candidate.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { CandidateRepositoryDomain, CandidateServiceDomain, ListParams } from "../../../domain/admin/candidateDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { th } from "zod/v4/locales";

class candidateService implements CandidateServiceDomain {
    private readonly repo: CandidateRepositoryDomain

    constructor(repo: CandidateRepositoryDomain) {
        this.repo = repo
    }
    async findCandidateByEmail(email: string): Promise<ApiResponse<{ id: string; name: string; email: string; }> | ErrorResponse> {
       try {
         return this.repo.findCandidateByEmail(email)
       } catch (error: any) {
            return createErrorResponse(
                'Error candidate email fetch',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async createCandidate(data: CreatecandidateInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const emailExist = await this.repo.findEmailisExist(data.email, userId, groupId)

            if (typeof emailExist !== 'boolean' && 'status' in emailExist && emailExist.status === 'error') {
                return emailExist as ErrorResponse;
            }

            if (!emailExist) {
                return createErrorResponse(
                    'Email is already exist',
                    StatusCodes.BAD_REQUEST,
                    'Error email is already exist'
                );
            }

            const phExist = await this.repo.findPhoneNoisExist(data.phone.toString(), userId, groupId)

            if (typeof phExist !== 'boolean' && 'status' in phExist && phExist.status === 'error') {
                return phExist as ErrorResponse;
            }

            if (!phExist) {
                return createErrorResponse(
                    'Phone no is already exist',
                    StatusCodes.BAD_REQUEST,
                    'Error Phone no is already exist'
                );
            }

            return await this.repo.createCandidate(data, userId, groupId)
        } catch (error: any) {
            return createErrorResponse(
                'Error delete candidate',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findCandidateById(id: string): Promise<ApiResponse<CandidateDtls> | ErrorResponse> {
        try {
            const isExist = await this.repo.findCandidateIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'Candidate not found',
                    StatusCodes.BAD_REQUEST,
                    'Error Candidate not found'
                );
            }

            return await this.repo.findCandidateById(id)

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
            return await this.repo.findAllCandidate(params, userId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving candidate list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateCandidate(data: UpdatecandidateInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.repo.findCandidateIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'Candidate not found',
                    StatusCodes.BAD_REQUEST,
                    'Error Candidate not found'
                );
            }

            const emailExist = await this.repo.findEmailisExistForUpdate(data.email, userId, id, groupId)

            if (typeof emailExist !== 'boolean' && 'status' in emailExist && emailExist.status === 'error') {
                return emailExist as ErrorResponse;
            }

            if (!emailExist) {
                return createErrorResponse(
                    'Email is already exist',
                    StatusCodes.BAD_REQUEST,
                    'Error email is already exist'
                );
            }


            const PhExist = await this.repo.findPhNoisExistForUpdate(data.phone.toString(), userId, id, groupId)

            if (typeof PhExist !== 'boolean' && 'status' in PhExist && PhExist.status === 'error') {
                return PhExist as ErrorResponse;
            }

            if (!PhExist) {
                return createErrorResponse(
                    'Phone number is already exist',
                    StatusCodes.BAD_REQUEST,
                    'Error Phone number is already exist'
                );
            }

            return await this.repo.updateCandidate(data, id, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error delete candidate',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteCandidate(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.repo.findCandidateIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'Candidate not found',
                    StatusCodes.BAD_REQUEST,
                    'Error Candidate not found'
                );
            }


            return await this.repo.deleteCandidate(id, userId);
        } catch (error: any) {
            return createErrorResponse(
                'Error delete candidate',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

}

export function newCandidateServiceRegister(service: CandidateRepositoryDomain): CandidateServiceDomain {
    return new candidateService(service)
}