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
exports.InstagramScraperService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
const location_entity_1 = require("../location.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let InstagramScraperService = class InstagramScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeInstagram(name, location) {
        const browser = await playwright_1.chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        try {
            const searchQuery = encodeURIComponent(`site:instagram.com "${name}" ${location}`);
            const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
            await page.goto(searchUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });
            const profiles = await page.evaluate(() => {
                const results = Array.from(document.querySelectorAll('div.g'));
                return results
                    .map((el) => {
                    const link = el.querySelector('a')?.href;
                    const title = el.querySelector('h3')?.innerText || '';
                    const snippet = el.querySelector('.VwiC3b')?.textContent || '';
                    if (link && link.includes('instagram.com/')) {
                        return { link, title, snippet };
                    }
                    return null;
                })
                    .filter(Boolean);
            });
            const finalResults = [];
            for (const profile of profiles.slice(0, 2)) {
                const newPage = await context.newPage();
                try {
                    await newPage.goto(profile.link, {
                        waitUntil: 'networkidle',
                        timeout: 20000,
                    });
                    const data = await newPage.evaluate((searchName) => {
                        const metaTitle = document.title;
                        const nameFromTitle = metaTitle.split('•')[0] || searchName;
                        const bodyText = document.body.innerText;
                        const phoneMatch = bodyText.match(/(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
                        return {
                            name: nameFromTitle.replace('(@', ' - ').replace(')', '').trim(),
                            phone: phoneMatch ? phoneMatch[0] : '-',
                            address: 'Instagram Profile Bio',
                        };
                    }, name);
                    finalResults.push({
                        ...data,
                        locationLink: profile.link,
                        source: 'Instagram',
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (e) {
                    console.error(`⚠️ Could not deep scrape Instagram profile: ${profile.link}`, e.message);
                }
                finally {
                    await newPage.close();
                }
            }
            if (finalResults.length > 0) {
                await this.saveResults(finalResults, name);
            }
            return finalResults;
        }
        catch (error) {
            console.error('❌ Instagram Scraper Error:', error);
            return [];
        }
        finally {
            await browser.close();
        }
    }
    async saveResults(results, targetName) {
        const searchKeywords = targetName.toLowerCase().split(' ');
        for (const item of results) {
            if (!item.name || item.name === '-')
                continue;
            const itemName = item.name.toLowerCase();
            const matchCount = searchKeywords.filter((key) => itemName.includes(key)).length;
            if (matchCount < Math.ceil(searchKeywords.length / 2))
                continue;
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
exports.InstagramScraperService = InstagramScraperService;
exports.InstagramScraperService = InstagramScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InstagramScraperService);
//# sourceMappingURL=instagramScraper.service.js.map