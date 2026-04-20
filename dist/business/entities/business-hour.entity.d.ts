import { BusinessProfile } from './business.entity';
export declare class BusinessHour {
    id: number;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    business: BusinessProfile;
}
