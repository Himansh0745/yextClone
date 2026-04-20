import { LocationResponseDto } from '../dto/location-response.dto';
import { Location } from '../location.entity';
import { Repository } from 'typeorm';
export declare class N49ScraperService {
    private locationRepo;
    constructor(locationRepo: Repository<Location>);
    scrapeN49(name: string, location: string): Promise<LocationResponseDto[]>;
    saveResults(results: LocationResponseDto[], targetName: string): Promise<void>;
}
