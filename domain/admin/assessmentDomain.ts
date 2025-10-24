import { AssessmentListQuery, CreateassessmentInput , UpdateassessmentInput} from "../../api/Request/assessment";
import { AssessAnsInput, AssessmentSubmitionSchema } from "../../api/Request/questionAns";
import { assessmentDtls, assessmentRes } from "../../api/response/assessment.response";
import { ErrorResponse } from "../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../api/response/commonResponse";
import { PaginationResult } from "../../api/response/paginationResponse";

export interface assessmentListParams {
    page: number;
    limit: number;
    search: string;
    sort: 'asc' | 'desc';
    type:string
}

export interface AssRepositoryDomain{
    createAssessment(data:CreateassessmentInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updateAssessment(data:UpdateassessmentInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    findAssessmentIdEist(id: string): Promise<Boolean | ErrorResponse>;
    getAssessmentById(id:string,userId: string, groupId: string): Promise<ApiResponse<assessmentRes> | ErrorResponse>;
    getAllAssessment(params:assessmentListParams, userId: string, groupId: string): Promise<PaginationResult<assessmentDtls[]> | ErrorResponse>;
    deleteAssessment(id:string,userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    sendAssessemntLink(id: string, userId: string) : Promise<ApiResponse<SuccessMessage> | ErrorResponse>
    assementQuestion(token: string): Promise<PaginationResult<any[]> | ErrorResponse> 
    questionAnswer(data: AssessAnsInput): Promise<ApiResponse<SuccessMessage> | ErrorResponse>
    submitAssessment(data: AssessmentSubmitionSchema): Promise<ApiResponse<SuccessMessage> | ErrorResponse>
}

export interface AssServiceDomain{
    createAssessment(data:CreateassessmentInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    updateAssessment(data:UpdateassessmentInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    getAssessmentById(id:string,userId: string, groupId: string): Promise<ApiResponse<assessmentRes> | ErrorResponse>;
    getAllAssessment(params:assessmentListParams, userId: string, groupId: string): Promise<PaginationResult<assessmentDtls[]> | ErrorResponse>;
    deleteAssessment(id:string,userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse>;
    sendAssessemntLink(id: string, userId: string) : Promise<ApiResponse<SuccessMessage> | ErrorResponse>
    assementQuestion(token: string): Promise<PaginationResult<any[]> | ErrorResponse> 
    questionAnswer(data: AssessAnsInput): Promise<ApiResponse<SuccessMessage> | ErrorResponse>
    submitAssessment(data: AssessmentSubmitionSchema): Promise<ApiResponse<SuccessMessage> | ErrorResponse>
}