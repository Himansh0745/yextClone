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
exports.YelpScraperService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
const typeorm_1 = require("typeorm");
const location_entity_1 = require("../location.entity");
const typeorm_2 = require("@nestjs/typeorm");
let YelpScraperService = class YelpScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeYelp(businessName, location) {
        const browser = await playwright_1.chromium.launch({
            headless: true,
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
            },
            deviceScaleFactor: 1,
            hasTouch: false,
        });
        const page = await context.newPage();
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });
        try {
            const searchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(businessName)}&find_loc=${encodeURIComponent(location)}`;
            await page.goto('https://www.yelp.com', { waitUntil: 'networkidle' });
            await page.goto(searchUrl, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000 + Math.random() * 3000);
            const hasCaptcha = await page.isVisible('iframe[title*="reCAPTCHA"]');
            if (hasCaptcha) {
                await page.waitForTimeout(15000);
            }
            await page.screenshot({ path: 'yelp-debug.png' });
            const businessLinks = await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('div[data-testid="serp-ia-card"]'));
                const links = [];
                cards.forEach((card) => {
                    const linkEl = card.querySelector('h3 a');
                    if (linkEl &&
                        linkEl.href.includes('/biz/') &&
                        !linkEl.href.includes('adredir')) {
                        links.push(linkEl.href);
                    }
                });
                return [...new Set(links)];
            });
            const finalResults = [];
            for (const link of businessLinks.slice(0, 5)) {
                try {
                    await page.goto(link, {
                        waitUntil: 'domcontentloaded',
                        timeout: 20000,
                    });
                    const details = await page.evaluate(() => {
                        const name = document.querySelector('h1')?.textContent || 'N/A';
                        const addressEl = document.querySelector('address');
                        const address = addressEl?.textContent?.trim() || 'N/A';
                        const phoneEl = Array.from(document.querySelectorAll('p')).find((p) => /\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/.test(p.innerText));
                        const phone = phoneEl ? phoneEl.innerText.trim() : 'N/A';
                        return { name, address, phone };
                    });
                    finalResults.push({
                        ...details,
                        source: 'Yelp',
                        locationLink: link,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (e) {
                    console.error(`❌ Failed to fetch Yelp details for: ${link}`, e.message);
                    return [];
                }
            }
            return finalResults;
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
exports.YelpScraperService = YelpScraperService;
exports.YelpScraperService = YelpScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], YelpScraperService);
//# sourceMappingURL=yelpScaper.service.js.map