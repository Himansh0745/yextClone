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
exports.BingScraperService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
const location_entity_1 = require("../location.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let BingScraperService = class BingScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeBing(name, location) {
        const browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext({});
        const page = await context.newPage();
        try {
            const searchQuery = encodeURIComponent(`${name} ${location}`);
            const searchUrl = `https://www.bing.com/search?q=${searchQuery}`;
            await page.goto(searchUrl, { waitUntil: 'load', timeout: 30000 });
            try {
                await page.waitForSelector('li.b_algo', {
                    state: 'attached',
                    timeout: 5000,
                });
            }
            catch (e) {
            }
            const results = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('li.b_algo'));
                return items
                    .map((item) => {
                    const nameEl = item.querySelector('h2 a');
                    const snippetEl = item.querySelector('.b_caption p, .b_snippet,.b_linefull');
                    if (!nameEl)
                        return null;
                    const name = nameEl.innerText || '';
                    const link = nameEl.href || '';
                    const snippet = snippetEl?.textContent || ' ';
                    const phoneMatch = snippet.match(/\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/);
                    const phone = phoneMatch ? phoneMatch[0] : '';
                    return {
                        name: name.trim(),
                        address: snippet.length > 10
                            ? snippet.substring(0, 100) + '...'
                            : 'See link',
                        phone: phone,
                        locationLink: link,
                    };
                })
                    .filter((i) => i !== null);
            });
            return results.map((item) => ({
                ...item,
                source: 'Bing',
                timestamp: new Date().toISOString(),
            }));
        }
        catch (error) {
            console.error('❌ Bing Scraper Error:', error);
            return [];
        }
        finally {
            await browser.close();
        }
    }
    async saveResults(results, targetName) {
        const searchKeywords = targetName.toLowerCase().split(' ');
        for (const item of results) {
            if (!item.name)
                continue;
            const itemName = item.name.toLowerCase();
            const matchCount = searchKeywords.filter((key) => itemName.includes(key)).length;
            if (matchCount < Math.ceil(searchKeywords.length / 2)) {
                continue;
            }
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
exports.BingScraperService = BingScraperService;
exports.BingScraperService = BingScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], BingScraperService);
//# sourceMappingURL=bingScraper.service.js.map