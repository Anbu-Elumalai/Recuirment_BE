export interface skill {
    name: string;
  }

  export interface skillDtls {
    _id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }
