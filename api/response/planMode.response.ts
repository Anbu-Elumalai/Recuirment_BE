export interface PlanDtls {
  _id: string;
  name: string;
  features: {
    points: string;
  }[];
   price: number,      
  currency: string,  
  duration:string,
  isActive: boolean;
  createdBy: string;
  modifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponse{
  success: boolean,
  checkoutUrl: string,
}