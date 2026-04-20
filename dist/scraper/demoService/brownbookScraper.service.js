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
exports.BrownbookScraperService = void 0;
const common_1 = require("@nestjs/common");
const location_entity_1 = require("../location.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
let BrownbookScraperService = class BrownbookScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeBrownbook(name, location) {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();
        try {
            const searchQuery = encodeURIComponent(`${name} ${location}`.trim());
            const searchUrl = `https://www.brownbook.net/search/ca/all-cities/${searchQuery}?page=1`;
            console.log(`[Brownbook] Attempting Stealth Search: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForTimeout(3000);
            const resultsCount = await page.locator('b:has-text("Results Found")').textContent();
            if (resultsCount?.includes('0') || await page.$('.g-recaptcha')) {
                console.log('[Brownbook] Captcha/Zero Results detected. Trying behavioral bypass...');
                await page.mouse.wheel(0, 500);
                await page.waitForTimeout(2000);
            }
            const businessLinkLocator = page.locator(`a[href*="/business/"]:has-text("${name}")`).first();
            if (await businessLinkLocator.count() === 0) {
                console.error('[Brownbook] Could not find the business link in results.');
                return [];
            }
            const targetLink = await businessLinkLocator.getAttribute('href');
            const finalUrl = targetLink?.startsWith('http') ? targetLink : `https://www.brownbook.net${targetLink}`;
            console.log(`[Brownbook] Moving to Detail Page: ${finalUrl}`);
            await page.goto(finalUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('#info-block', { timeout: 10000 });
            const extracted = await page.evaluate(() => {
                const clean = (txt) => txt ? txt.replace(/\s+/g, ' ').trim() : '-';
                const nameText = clean(document.querySelector('p.text-3xl.font-bold')?.textContent);
                const phoneText = clean(document.querySelector('#business-phone')?.textContent);
                const addressEl = document.querySelector('div.flex-wrap.items-center.mb-10');
                const addressText = addressEl ? clean(addressEl.textContent?.replace(/^CA/, '')) : '-';
                return {
                    name: nameText,
                    phone: phoneText,
                    address: addressText,
                    locationLink: window.location.href
                };
            });
            const result = {
                name: extracted.name,
                address: extracted.address,
                phone: extracted.phone,
                locationLink: extracted.locationLink,
                source: 'Brownbook',
                timestamp: new Date().toISOString(),
            };
            await this.saveResults([result]);
            console.log(`[Brownbook] Successfully scraped: ${extracted.name}`);
            return [result];
        }
        catch (error) {
            console.error('[Brownbook] Scraper stopped at step:', error.message);
            return [];
        }
        finally {
            await browser.close();
        }
    }
    async saveResults(results) {
        for (const item of results) {
            const existing = await this.locationRepo.findOne({ where: { locationLink: item.locationLink } });
            if (!existing) {
                await this.locationRepo.save(this.locationRepo.create(item));
            }
            else {
                await this.locationRepo.update(existing.id, item);
            }
        }
    }
};
exports.BrownbookScraperService = BrownbookScraperService;
exports.BrownbookScraperService = BrownbookScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BrownbookScraperService);
//# sourceMappingURL=brownbookScraper.service.js.map