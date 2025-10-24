export interface Role {
    name: string;
  }

  export interface RoleDtls {
    _id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }
