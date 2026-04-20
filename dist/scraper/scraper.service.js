"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const common_1 = require("@nestjs/common");
const GoogleMapsScraper_service_1 = require("./multiService/GoogleMapsScraper.service");
const yelpScaper_service_1 = require("../scraper/multiService/yelpScaper.service");
const bingScraper_service_1 = require("../scraper/multiService/bingScraper.service");
const instagramScraper_service_1 = require("../scraper/multiService/instagramScraper.service");
const n49Scraper_service_1 = require("../scraper/multiService/n49Scraper.service");
const wheretoScraper_service_1 = require("./demoService/wheretoScraper.service");
const hotfrogScraper_service_1 = require("./demoService/hotfrogScraper.service");
const brownbookScraper_service_1 = require("./demoService/brownbookScraper.service");
const location_entity_1 = require("./location.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ScraperService = class ScraperService {
    locationRepo;
    googleMapsScraperService;
    yelpScraperService;
    bingService;
    instagramService;
    n49Service;
    wheretoScraperService;
    hotfrogScraperService;
    brownbookScraperService;
    constructor(locationRepo, googleMapsScraperService, yelpScraperService, bingService, instagramService, n49Service, wheretoScraperService, hotfrogScraperService, brownbookScraperService) {
        this.locationRepo = locationRepo;
        this.googleMapsScraperService = googleMapsScraperService;
        this.yelpScraperService = yelpScraperService;
        this.bingService = bingService;
        this.instagramService = instagramService;
        this.n49Service = n49Service;
        this.wheretoScraperService = wheretoScraperService;
        this.hotfrogScraperService = hotfrogScraperService;
        this.brownbookScraperService = brownbookScraperService;
    }
    async scrapeAllPlatforms(name, location = '') {
        await this.locationRepo.clear();
        const [googleData, yelpData, bingData, instagramData, N49ScraperData, wheretoData, hotfrogData, brownbookData] = await Promise.all([
            this.googleMapsScraperService.scrapeGoogleMaps(`${name} ${location}`),
            this.yelpScraperService.scrapeYelp(`${name} `, `${location}`),
            this.bingService.scrapeBing(name, location),
            this.instagramService.scrapeInstagram(name, location),
            this.n49Service.scrapeN49(name, location),
            this.wheretoScraperService.scrapeWhereTo(name, location),
            this.hotfrogScraperService.scrapeHotfrog(name, location),
            this.brownbookScraperService.scrapeBrownbook(name, location),
        ]);
        const combinedData = [
            ...googleData,
            ...yelpData,
            ...bingData,
            ...instagramData,
            ...N49ScraperData,
            ...wheretoData,
            ...hotfrogData,
            ...brownbookData,
        ];
        return combinedData;
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        GoogleMapsScraper_service_1.GoogleMapsScraperService,
        yelpScaper_service_1.YelpScraperService,
        bingScraper_service_1.BingScraperService,
        instagramScraper_service_1.InstagramScraperService,
        n49Scraper_service_1.N49ScraperService,
        wheretoScraper_service_1.WhereToScraperService,
        hotfrogScraper_service_1.HotfrogScraperService,
        brownbookScraper_service_1.BrownbookScraperService])
], ScraperService);
//# sourceMappingURL=scraper.service.js.map