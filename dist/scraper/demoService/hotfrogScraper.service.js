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
exports.HotfrogScraperService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
const location_entity_1 = require("../location.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let HotfrogScraperService = class HotfrogScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeHotfrog(name, location) {
        const browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        });
        const page = await context.newPage();
        try {
            const slug = name.toLowerCase().replace(/\s+/g, '-');
            const searchUrl = `https://www.hotfrog.ca/search/ca/${slug}`;
            console.log(`[Hotfrog] Searching: ${searchUrl}`);
            await page.goto(searchUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });
            await page.waitForTimeout(3000);
            const links = await page.locator('a[href*="/company/"]').all();
            let targetLink = null;
            for (const link of links) {
                const text = (await link.textContent())?.toLowerCase() || '';
                if (text.includes(name.toLowerCase())) {
                    const href = await link.getAttribute('href');
                    if (href) {
                        targetLink = href.startsWith('http')
                            ? href
                            : `https://www.hotfrog.ca${href}`;
                        console.log(`[Hotfrog] Found link: ${targetLink}`);
                        break;
                    }
                }
            }
            if (!targetLink) {
                console.error('[Hotfrog] No matching business found');
                return [];
            }
            const detailPage = await context.newPage();
            await detailPage.goto(targetLink, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });
            await detailPage.waitForSelector('h1', { timeout: 15000 });
            const extracted = await detailPage.evaluate(() => {
                const clean = (txt) => txt ? txt.replace(/\s+/g, ' ').trim() : '-';
                const name = clean(document.querySelector('h1')?.textContent);
                let phone = '-';
                const phoneLabel = Array.from(document.querySelectorAll('dt'))
                    .find(el => el.textContent?.toLowerCase().includes('phone'));
                if (phoneLabel) {
                    const phoneValue = phoneLabel.nextElementSibling;
                    if (phoneValue) {
                        phone = clean(phoneValue.textContent);
                    }
                }
                const line1 = document.querySelector('[data-address-line1]')?.textContent;
                const town = document.querySelector('[data-address-town]')?.textContent;
                const county = document.querySelector('[data-address-county]')?.textContent;
                const postcode = document.querySelector('[data-address-postcode]')?.textContent;
                let address = '-';
                const parts = [line1, town, county, postcode]
                    .map(p => p?.trim())
                    .filter(Boolean);
                if (parts.length) {
                    address = parts.join(', ');
                }
                return {
                    name,
                    address,
                    phone,
                    locationLink: window.location.href,
                };
            });
            const keywords = name.toLowerCase().split(' ');
            const itemName = extracted.name.toLowerCase();
            const matchCount = keywords.filter((k) => itemName.includes(k)).length;
            if (matchCount < Math.ceil(keywords.length / 2)) {
                console.log(`[Hotfrog] Filtered: ${extracted.name}`);
                return [];
            }
            const result = {
                name: extracted.name,
                address: extracted.address,
                phone: extracted.phone,
                locationLink: extracted.locationLink,
                source: 'Hotfrog',
                timestamp: new Date().toISOString(),
            };
            await this.saveResults([result]);
            return [result];
        }
        catch (error) {
            console.error('[Hotfrog] Scraper Error:', error.message);
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
exports.HotfrogScraperService = HotfrogScraperService;
exports.HotfrogScraperService = HotfrogScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HotfrogScraperService);
//# sourceMappingURL=hotfrogScraper.service.js.map