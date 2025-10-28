export interface AdminUser {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    isDelete: boolean;
    phoneNumber?: string;
    permissions: boolean;
    groupingId: string,
    userType:string
}