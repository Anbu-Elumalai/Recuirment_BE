

export interface testConfigDtls {
    _id: string;
    numberOfTestPerCandidate: number;
    numberOfDaysToAttend: number;
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
