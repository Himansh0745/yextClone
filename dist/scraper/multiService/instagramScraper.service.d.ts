import { LocationResponseDto } from '../dto/location-response.dto';
import { Location } from '../location.entity';
import { Repository } from 'typeorm';
export declare class InstagramScraperService {
    private locationRepo;
    constructor(locationRepo: Repository<Location>);
    scrapeInstagram(name: string, location: string): Promise<LocationResponseDto[]>;
    saveResults(results: LocationResponseDto[], targetName: string): Promise<void>;
}
