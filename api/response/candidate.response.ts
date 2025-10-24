
export interface CandidateDtls {
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  isActive?: boolean;
  isDelete?: boolean;
  createdBy?: string;
  modifiedBy?:string ;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}