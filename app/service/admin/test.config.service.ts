import { StatusCodes } from "http-status-codes";
import { CreatetestConfigInput, UpdatetestConfigInput } from "../../../api/Request/testConfig";
import { testConfigDtls } from "../../../api/response/testConfig.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import { testConfigDomainRepository, testConfigDomainService } from "../../../domain/admin/test.configDomain";
import { createErrorResponse } from "../../../utils/common/errors";
import { PaginationResult } from "../../../api/response/paginationResponse";
import { Uploads } from "../../../utils/uploads/image.upload";

class testConfigService implements testConfigDomainService {
    private readonly testConfigRepo: testConfigDomainRepository;

    constructor(repo: testConfigDomainRepository) {
        this.testConfigRepo = repo;
    }
    async checkIsValidConfigBaseOnPlanMode(groupId: string): Promise<ApiResponse<{ isValid: boolean; planTestLimit: number; configTestNumber: number; }> | ErrorResponse> {
        try {
            return await this.checkIsValidConfigBaseOnPlanMode(groupId)
        } catch (error: any) {
            return createErrorResponse(
                'Error creating testConfig',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async findtestConfigById(id: string): Promise<ApiResponse<testConfigDtls> | ErrorResponse> {
        try {
            const isExist = await this.testConfigRepo.findtestConfig(id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'testConfig not found.',
                    StatusCodes.CONFLICT
                );
            }

            return await this.testConfigRepo.findtestConfigById(id)

        } catch (error: any) {
            return createErrorResponse(
                'Error creating testConfig',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updatetestConfig(testConfigInput: UpdatetestConfigInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const isExist = await this.testConfigRepo.findtestConfig(testConfigInput.id)

            if (typeof isExist !== 'boolean' && 'status' in isExist && isExist.status === 'error') {
                return isExist as ErrorResponse;
            }

            if (!isExist) {
                return createErrorResponse(
                    'testConfig not found.',
                    StatusCodes.CONFLICT
                );
            }

            // Create the testConfig
            return await this.testConfigRepo.updatetestConfig(testConfigInput, userId, groupId);
        } catch (error: any) {
            return createErrorResponse(
                'Error creating testConfig',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }


}

export function NewtestConfigServiceRegister(testConfigRepo: testConfigDomainRepository): testConfigDomainService {
    return new testConfigService(testConfigRepo)
}