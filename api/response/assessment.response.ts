  export interface assessmentDtls {
    _id: string;
    assessmentName: string;
    groupCandidateName:string;
    groupQuestionName:string;
    startTime:string;
    endTime:string;
    passingMarks:string;
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }

    export interface assessmentRes {
    _id: string;
    assessmentName: string;
    groupCandidateId:string;
    groupQuestionId:string;
    startTime:string;
    endTime:string;
    passingMarks:string;
  }