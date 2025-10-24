export interface Category {
    name: string;
  }

  export interface CategoryDtls {
    _id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    modifiedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }
