export interface User {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    isDelete: boolean;
    phoneNumber: number;
    groupingId: string
}