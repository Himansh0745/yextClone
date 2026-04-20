import { LocationResponseDto } from '../dto/location-response.dto';
import { Location } from '../location.entity';
import { Repository } from 'typeorm';
export declare class HotfrogScraperService {
    private locationRepo;
    constructor(locationRepo: Repository<Location>);
    scrapeHotfrog(name: string, location: string): Promise<LocationResponseDto[]>;
    saveResults(results: LocationResponseDto[]): Promise<void>;
}
