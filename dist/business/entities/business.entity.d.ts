import { BusinessHour } from './business-hour.entity';
export declare class BusinessProfile {
    id: number;
    businessName: string;
    address: string;
    city: string;
    phone: string;
    category: string;
    additionalAttributes: any;
    lat: number;
    lng: number;
    hours: BusinessHour[];
}
