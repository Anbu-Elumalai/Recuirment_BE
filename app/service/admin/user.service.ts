import { StatusCodes } from "http-status-codes";
import { CreateUSerInput, UpdateuserInput } from "../../../api/Request/user";
import { User } from "../../../api/response/user.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { UserDomainRepository ,UserDomainService , userListParams } from "../../../domain/admin/admin.userDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { th } from "zod/v4/locales";
import { ListParams } from "../../../domain/admin/candidateDomain";

class userService implements UserDomainService {
    private readonly repo: UserDomainRepository

    constructor(repo: UserDomainRepository) {
        this.repo = repo
    }

    async createuser(data: CreateUSerInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const emailExist = await this.repo.findEmailisExist(data.email , groupId)

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

            const phExist = await this.repo.findPhoneNoisExist(data.phoneNumber.toString(), groupId)

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

            return await this.repo.createuser(data, userId, groupId)
        } catch (error: any) {
            return createErrorResponse(
                'Error create user',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async finduserById(id: string): Promise<ApiResponse<User> | ErrorResponse> {
        try {
            const isExist = await this.repo.finduserIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'user not found',
                    StatusCodes.BAD_REQUEST,
                    'Error user not found'
                );
            }

            return await this.repo.finduserById(id)

        } catch (error: any) {
            return createErrorResponse(
                'Error fetch user id',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async getuserList(params: userListParams, userId: string, groupId: string): Promise<PaginationResult<User> | ErrorResponse> {
        try {
            return await this.repo.getuserList(params, userId , groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error retrieving user list',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateuser(data: UpdateuserInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.repo.finduserIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'user not found',
                    StatusCodes.BAD_REQUEST,
                    'Error user not found'
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


            const PhExist = await this.repo.findPhNoisExistForUpdate(data.phoneNumber.toString(), userId, id, groupId)

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

            return await this.repo.updateuser(data, id, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error delete user',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteuser(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const isExist = await this.repo.finduserIdExist(id);

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'user not found',
                    StatusCodes.BAD_REQUEST,
                    'Error user not found'
                );
            }


            return await this.repo.deleteuser(id, userId);
        } catch (error: any) {
            return createErrorResponse(
                'Error delete user',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

}

export function newUserServiceRegister(service: UserDomainRepository): UserDomainService {
    return new userService(service)
}