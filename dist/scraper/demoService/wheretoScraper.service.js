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
exports.WhereToScraperService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
const location_entity_1 = require("../location.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let WhereToScraperService = class WhereToScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeWhereTo(name, location) {
        const browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            const poiUrl = 'https://wheretoapp.com/search?poi=7046012492850146445';
            console.log(`[WhereTo] Opening: ${poiUrl}`);
            await page.goto(poiUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });
            await page.waitForSelector('h1', { timeout: 15000 });
            const extracted = await page.evaluate(() => {
                const clean = (txt) => txt ? txt.replace(/\s+/g, ' ').trim() : '-';
                const name = clean(document.querySelector('h1')?.textContent);
                let address = '-';
                const addressEl = document.querySelector('#address');
                if (addressEl) {
                    const parts = Array.from(addressEl.querySelectorAll('div, span'))
                        .map((el) => el.textContent?.trim())
                        .filter(Boolean)
                        .filter((text) => !/Get Directions/i.test(text));
                    if (parts.length) {
                        address = parts.join(', ');
                    }
                    else {
                        let text = addressEl.textContent || '';
                        text = text
                            .replace(/Get Directions/i, '')
                            .replace(/([a-zA-Z])(\d)/g, '$1 $2')
                            .replace(/\s+/g, ' ')
                            .trim();
                        address = text;
                    }
                }
                let phone = '-';
                const phoneEl = document.querySelector('a[href^="tel:"]') ||
                    document.querySelector('[class*="phone"]');
                if (phoneEl) {
                    phone = clean(phoneEl.textContent);
                }
                return {
                    name,
                    address,
                    phone,
                    locationLink: window.location.href,
                };
            });
            if (!extracted.name || extracted.name === '-') {
                return [];
            }
            const result = {
                name: extracted.name,
                address: extracted.address,
                phone: extracted.phone,
                locationLink: extracted.locationLink,
                source: 'WhereTo',
                timestamp: new Date().toISOString(),
            };
            await this.saveResults([result]);
            return [result];
        }
        catch (error) {
            console.error('[WhereTo] Scraper Error:', error.message);
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
                await this.locationRepo.save(this.locationRepo.create(item));
            }
            else {
                await this.locationRepo.update(existing.id, item);
            }
        }
    }
};
exports.WhereToScraperService = WhereToScraperService;
exports.WhereToScraperService = WhereToScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WhereToScraperService);
//# sourceMappingURL=wheretoScraper.service.js.map