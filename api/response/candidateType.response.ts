export interface candidateType {
    name: string;
  }

  export interface candidateTypeDtls {
    _id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }
