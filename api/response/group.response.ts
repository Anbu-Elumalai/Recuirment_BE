export interface group {
    name: string;
  }

  export interface groupDtls {
    _id: string;
    name: string;
    candidate:string[];
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    applicationId: string;
  }
