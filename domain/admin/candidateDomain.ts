import { CreatecandidateInput , UpdatecandidateInput , CandidateListQuery} from "../../api/Request/candidate";
import { ApiResponse, ErrorResponse, SuccessMessage } from "../../api/response/commonResponse";
import { PaginationResult } from "../../api/response/paginationResponse";
import { CandidateDtls } from "../../api/response/candidate.response";
export interface ListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}
export interface CandidateRepositoryDomain{
    createCandidate(data: CreatecandidateInput , userId: string,groupId : string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findAdminOrganization(id: string): Promise<{ origanizationType: string; statusCode: number } | ErrorResponse>;
    findCandidateById(id: string): Promise<ApiResponse<CandidateDtls> | ErrorResponse>;
    findLastInterviews(id: string): Promise<{ count: number; statusCode: number } | ErrorResponse>;
    findAllCandidate(params: ListParams, userId: string): Promise<PaginationResult<CandidateDtls[]> | ErrorResponse>;
    updateCandidate( data: UpdatecandidateInput,id:string, userId:string ,groupId : string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    deleteCandidate(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findCandidateIdExist(id: string): Promise<Boolean | ErrorResponse>
    findEmailisExist(email: string,userId:string,groupId : string): Promise<Boolean | ErrorResponse>;
    findPhoneNoisExist(ph: string,userId:string,groupId : string): Promise<Boolean | ErrorResponse>;

    findEmailisExistForUpdate(email: string,userId:string , id: string,groupId : string): Promise<Boolean | ErrorResponse>;
    findPhNoisExistForUpdate(ph: string,userId:string , id: string,groupId : string): Promise<Boolean | ErrorResponse>;
    findCandidateByEmail(email: string):Promise<ApiResponse<{id:string,name:string,email:string} > | ErrorResponse>
}

export interface CandidateServiceDomain{
    createCandidate(data: CreatecandidateInput , userId: string,groupId : string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findCandidateById(id: string): Promise<ApiResponse<CandidateDtls> | ErrorResponse>;
    findAllCandidate(params: ListParams, userId: string): Promise<PaginationResult<CandidateDtls[]> | ErrorResponse>;
    updateCandidate(data: UpdatecandidateInput,id:string, userId:string,groupId : string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    deleteCandidate(id:string, userId:string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findCandidateByEmail(email: string):Promise<ApiResponse<{id:string,name:string,email:string} > | ErrorResponse>
}