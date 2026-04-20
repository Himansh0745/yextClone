export declare class BusinessHourDto {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
}
export declare class CreateBusinessDto {
    businessName: string;
    address: string;
    city: string;
    phone: string;
    category?: string;
    additionalAttributes?: any;
    hours?: BusinessHourDto[];
}
export declare class UpdateBusinessDto {
    businessName?: string;
    address?: string;
    city?: string;
    phone: string;
    category?: string;
    additionalAttributes: any;
}
