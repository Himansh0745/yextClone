import { LocationResponseDto } from '../dto/location-response.dto';
import { Repository } from 'typeorm';
import { Location } from '../location.entity';
export declare class GoogleMapsScraperService {
    private locationRepo;
    constructor(locationRepo: Repository<Location>);
    scrapeGoogleMaps(query: string): Promise<LocationResponseDto[]>;
    saveResults(results: LocationResponseDto[]): Promise<void>;
}
