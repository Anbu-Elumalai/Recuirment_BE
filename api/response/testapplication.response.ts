
export interface JobApplicDtls {
    _id: string;
    jobAppCode: string;
    jobApplicationName: string;
    location: string;
    description: string;
    appliedRoles: string;
    statusHistory: {
        status:string;
        changedAt:Date;
    }[];
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobAppCOde{
    code : string
}