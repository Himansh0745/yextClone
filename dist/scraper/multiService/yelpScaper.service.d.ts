import { LocationResponseDto } from '../dto/location-response.dto';
import { Repository } from 'typeorm';
import { Location } from '../location.entity';
export declare class YelpScraperService {
    private locationRepo;
    constructor(locationRepo: Repository<Location>);
    scrapeYelp(businessName: string, location: string): Promise<LocationResponseDto[]>;
    saveResults(results: LocationResponseDto[]): Promise<void>;
}
