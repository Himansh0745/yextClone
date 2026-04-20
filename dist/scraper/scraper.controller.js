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
exports.ScraperController = void 0;
const common_1 = require("@nestjs/common");
const scrape_request_dto_1 = require("./dto/scrape-request.dto");
const scraper_service_1 = require("./scraper.service");
let ScraperController = class ScraperController {
    scraperService;
    constructor(scraperService) {
        this.scraperService = scraperService;
    }
    async getLocations(scrapeDto) {
        return this.scraperService.scrapeAllPlatforms(scrapeDto.name, scrapeDto.location);
    }
};
exports.ScraperController = ScraperController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scrape_request_dto_1.ScrapeRequestDto]),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "getLocations", null);
exports.ScraperController = ScraperController = __decorate([
    (0, common_1.Controller)('scrape'),
    __metadata("design:paramtypes", [scraper_service_1.ScraperService])
], ScraperController);
//# sourceMappingURL=scraper.controller.js.map