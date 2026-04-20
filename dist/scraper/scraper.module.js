"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scraper_controller_1 = require("./scraper.controller");
const scraper_service_1 = require("./scraper.service");
const location_entity_1 = require("./location.entity");
const GoogleMapsScraper_service_1 = require("./multiService/GoogleMapsScraper.service");
const yelpScaper_service_1 = require("./multiService/yelpScaper.service");
const bingScraper_service_1 = require("./multiService/bingScraper.service");
const instagramScraper_service_1 = require("./multiService/instagramScraper.service");
const n49Scraper_service_1 = require("./multiService/n49Scraper.service");
const wheretoScraper_service_1 = require("./demoService/wheretoScraper.service");
const hotfrogScraper_service_1 = require("./demoService/hotfrogScraper.service");
const brownbookScraper_service_1 = require("./demoService/brownbookScraper.service");
let ScraperModule = class ScraperModule {
};
exports.ScraperModule = ScraperModule;
exports.ScraperModule = ScraperModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([location_entity_1.Location])],
        controllers: [scraper_controller_1.ScraperController],
        providers: [
            scraper_service_1.ScraperService,
            GoogleMapsScraper_service_1.GoogleMapsScraperService,
            yelpScaper_service_1.YelpScraperService,
            bingScraper_service_1.BingScraperService,
            instagramScraper_service_1.InstagramScraperService,
            n49Scraper_service_1.N49ScraperService,
            wheretoScraper_service_1.WhereToScraperService,
            hotfrogScraper_service_1.HotfrogScraperService,
            brownbookScraper_service_1.BrownbookScraperService,
        ],
    })
], ScraperModule);
//# sourceMappingURL=scraper.module.js.map