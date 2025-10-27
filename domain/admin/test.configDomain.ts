import { CreatetestConfigInput, UpdatetestConfigInput } from "../../api/Request/testConfig"
import {  testConfigDtls } from "../../api/response/testConfig.response"
import { ErrorResponse } from "../../api/response/cmmonerror"
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse"


export interface testConfigDomainRepository {
    updatetestConfig(testConfigInput: UpdatetestConfigInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findtestConfig(id: string): Promise<Boolean | ErrorResponse>;
    findtestConfigById(id: string): Promise<ApiResponse<testConfigDtls> | ErrorResponse>;
    checkIsValidConfigBaseOnPlanMode(groupId: string): Promise<ApiResponse<{ isValid: boolean, planTestLimit: number, configTestNumber: number }> | ErrorResponse>
}

export interface testConfigDomainService {
    updatetestConfig(testConfigInput: UpdatetestConfigInput,  userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findtestConfigById(id: string): Promise<ApiResponse<testConfigDtls> | ErrorResponse>;
    checkIsValidConfigBaseOnPlanMode(groupId: string): Promise<ApiResponse<{ isValid: boolean, planTestLimit: number, configTestNumber: number }> | ErrorResponse>
}