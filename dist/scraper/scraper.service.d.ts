import { LocationResponseDto } from './dto/location-response.dto';
import { GoogleMapsScraperService } from './multiService/GoogleMapsScraper.service';
import { YelpScraperService } from '../scraper/multiService/yelpScaper.service';
import { BingScraperService } from '../scraper/multiService/bingScraper.service';
import { InstagramScraperService } from '../scraper/multiService/instagramScraper.service';
import { N49ScraperService } from '../scraper/multiService/n49Scraper.service';
import { WhereToScraperService } from './demoService/wheretoScraper.service';
import { HotfrogScraperService } from './demoService/hotfrogScraper.service';
import { BrownbookScraperService } from './demoService/brownbookScraper.service';
import { Location } from './location.entity';
import { Repository } from 'typeorm';
export declare class ScraperService {
    private locationRepo;
    private googleMapsScraperService;
    private yelpScraperService;
    private bingService;
    private instagramService;
    private n49Service;
    private wheretoScraperService;
    private hotfrogScraperService;
    private brownbookScraperService;
    constructor(locationRepo: Repository<Location>, googleMapsScraperService: GoogleMapsScraperService, yelpScraperService: YelpScraperService, bingService: BingScraperService, instagramService: InstagramScraperService, n49Service: N49ScraperService, wheretoScraperService: WhereToScraperService, hotfrogScraperService: HotfrogScraperService, brownbookScraperService: BrownbookScraperService);
    scrapeAllPlatforms(name: string, location?: string): Promise<LocationResponseDto[]>;
}
