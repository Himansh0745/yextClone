import { ScrapeRequestDto } from './dto/scrape-request.dto';
import { ScraperService } from './scraper.service';
export declare class ScraperController {
    private readonly scraperService;
    constructor(scraperService: ScraperService);
    getLocations(scrapeDto: ScrapeRequestDto): Promise<import("./dto/location-response.dto").LocationResponseDto[]>;
}
