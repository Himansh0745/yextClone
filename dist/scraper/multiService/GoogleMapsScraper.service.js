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
exports.GoogleMapsScraperService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
const typeorm_1 = require("typeorm");
const location_entity_1 = require("../location.entity");
const typeorm_2 = require("@nestjs/typeorm");
let GoogleMapsScraperService = class GoogleMapsScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeGoogleMaps(query) {
        const browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
            await page.goto(searchUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 20000,
            });
            try {
                const consentButton = page.locator('button:has-text("Accept all"), button:has-text("I agree")');
                if (await consentButton.isVisible({ timeout: 1000 })) {
                    await consentButton.click();
                }
            }
            catch (error) {
                console.error('⚠️ Google Maps: Consent button not found or already dismissed.', error.message);
            }
            try {
                await page.waitForSelector('div[role="article"], h1.DUwDvf', {
                    timeout: 15000,
                });
            }
            catch (error) {
                console.error('❌ Google Maps: No results found or page timed out.', error.message);
                return [];
            }
            const scrapedData = await page.evaluate(() => {
                const exactName = document.querySelector('h1.DUwDvf')?.textContent;
                if (exactName) {
                    const address = document
                        .querySelector('button[data-item-id="address"]')
                        ?.textContent?.trim() || 'N/A';
                    const phone = document
                        .querySelector('button[data-tooltip*="phone"]')
                        ?.textContent?.trim() || 'In address';
                    return [
                        {
                            name: exactName,
                            address: address.replace(/^/, ''),
                            phone: phone.replace(/^/, ''),
                            locationLink: window.location.href,
                        },
                    ];
                }
                const items = Array.from(document.querySelectorAll('div[role="article"]'));
                return items.map((item) => ({
                    name: item.querySelector('.qBF1Pd')?.textContent || 'N/A',
                    address: Array.from(item.querySelectorAll('.W4Efsd'))
                        .map((el) => el.textContent || '')
                        .find((d) => d.includes(',') || d.length > 10) || 'N/A',
                    phone: item.querySelector('.Us7ffb')?.textContent || 'N/A',
                    locationLink: item.querySelector('a.hfpxzc')?.href || '',
                }));
            });
            const finalResults = [];
            for (const item of scrapedData) {
                if (item.name !== 'N/A') {
                    const newLoc = this.locationRepo.create({
                        name: item.name,
                        address: item.address,
                        phone: item.phone,
                        locationLink: item.locationLink || '',
                    });
                    await this.locationRepo.save(newLoc);
                    finalResults.push({
                        name: item.name,
                        address: item.address,
                        phone: item.phone,
                        source: 'Google Maps',
                        timestamp: new Date().toISOString(),
                        locationLink: item.locationLink?.toString() || '',
                    });
                }
            }
            return finalResults;
        }
        catch (error) {
            console.error('❌ Google Maps Scraping Error:', error.message);
            return [];
        }
        finally {
            await browser.close();
        }
    }
    async saveResults(results) {
        for (const item of results) {
            const existing = await this.locationRepo.findOne({
                where: { locationLink: item.locationLink },
            });
            if (!existing) {
                const newLocation = this.locationRepo.create(item);
                await this.locationRepo.save(newLocation);
            }
            else {
                await this.locationRepo.update(existing.id, item);
            }
        }
    }
};
exports.GoogleMapsScraperService = GoogleMapsScraperService;
exports.GoogleMapsScraperService = GoogleMapsScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], GoogleMapsScraperService);
//# sourceMappingURL=GoogleMapsScraper.service.js.map