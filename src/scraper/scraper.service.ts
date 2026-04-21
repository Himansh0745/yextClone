import { Injectable } from '@nestjs/common';
import { LocationResponseDto } from './dto/location-response.dto';
import { GoogleMapsScraperService } from './multiService/GoogleMapsScraper.service';
import { YelpScraperService } from '../scraper/multiService/yelpScaper.service';
import { BingScraperService } from '../scraper/multiService/bingScraper.service';
import { InstagramScraperService } from '../scraper/demoService/instagramScrapper.service';
import { N49ScraperService } from '../scraper/multiService/n49Scraper.service';
import { WhereToScraperService } from './demoService/wheretoScraper.service';
import { HotfrogScraperService } from './demoService/hotfrogScraper.service';
// import { BrownbookScraperService } from './demoService/brownbookScraper.service';
import { FacebookScraperService } from './demoService/facebookScraper.service';

import { Location } from './location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ScraperService {
  constructor(
    @InjectRepository(Location)
    private locationRepo: Repository<Location>,
    private googleMapsScraperService: GoogleMapsScraperService,
    private yelpScraperService: YelpScraperService,
    private bingService: BingScraperService,
    private instagramService: InstagramScraperService,
    private n49Service: N49ScraperService,
    private wheretoScraperService: WhereToScraperService,
    private hotfrogScraperService: HotfrogScraperService,
    // private brownbookScraperService: BrownbookScraperService,
    private facebookScraperService: FacebookScraperService,
  ) { }

  //combine
  async scrapeAllPlatforms(
    name: string,
    location: string = '',
  ): Promise<LocationResponseDto[]> {
    await this.locationRepo.clear();
    // console.log(`🚀 Starting Multi-Platform Scraping for: ${name}`);

    const [googleData, yelpData, bingData, instagramData, N49ScraperData, wheretoData, hotfrogData, facebookData] =
      await Promise.all([
        this.googleMapsScraperService.scrapeGoogleMaps(`${name} ${location}`),
        this.yelpScraperService.scrapeYelp(`${name} `, `${location}`),
        this.bingService.scrapeBing(name, location),
        this.instagramService.scrapeInstagram(name),
        this.n49Service.scrapeN49(name, location),
        this.wheretoScraperService.scrapeWhereTo(name, location),
        this.hotfrogScraperService.scrapeHotfrog(name, location),
        // this.brownbookScraperService.scrapeBrownbook(name, location),
        this.facebookScraperService.scrapeFacebook(name),
      ]);

    const combinedData = [
      ...googleData,
      ...yelpData,
      ...bingData,
      ...instagramData,
      ...N49ScraperData,
      ...wheretoData,
      ...hotfrogData,
      // ...brownbookData,
      ...facebookData,
    ];

    return combinedData;
  }
}
