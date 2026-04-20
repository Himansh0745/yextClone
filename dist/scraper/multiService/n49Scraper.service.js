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
exports.N49ScraperService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
const location_entity_1 = require("../location.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let N49ScraperService = class N49ScraperService {
    locationRepo;
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async scrapeN49(name, location) {
        const browser = await playwright_1.chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        try {
            const cityOrZip = location.split(',')[1]?.trim() || location.split(' ').pop() || location;
            const searchQuery = encodeURIComponent(name);
            const searchLocation = encodeURIComponent(cityOrZip);
            const searchUrl = `https://www.n49.com/search/${searchQuery}/42041/${searchLocation}/`;
            await page.goto(searchUrl, {
                waitUntil: 'networkidle',
                timeout: 45000,
            });
            try {
                await page.waitForSelector('.suggestion-search, .search-suggestions, a[href*="/biz/"]', { timeout: 10000 });
            }
            catch (e) {
                console.error('⚠️ [N49] Suggestions/Results took too long or not found.', e.message);
            }
            const html = await page.content();
            if (html.includes('Access denied') || html.includes('Cloudflare')) {
                return [];
            }
            const resultsContainer = await page.evaluate(() => {
                return (document.querySelector('.suggestion-search, .search-suggestions, #search-results')?.innerHTML || 'NOT FOUND');
            });
            const links = await page.evaluate(() => {
                const foundLinks = [];
                const allAnchors = Array.from(document.querySelectorAll('a[href*="/biz/"]'));
                allAnchors.forEach((a) => {
                    const href = a.href;
                    if (href)
                        foundLinks.push(href);
                });
                return [...new Set(foundLinks)].slice(0, 5);
            });
            const finalResults = [];
            for (const link of links) {
                const newPage = await context.newPage();
                newPage.on('console', (msg) => {
                });
                try {
                    await newPage.goto(link, {
                        waitUntil: 'load',
                        timeout: 20000,
                    });
                    await page.waitForTimeout(1000);
                    const extractedData = await newPage.evaluate(() => {
                        const bizName = document.querySelector('h1, .biz-name')?.textContent || '-';
                        const phoneEl = document.querySelector('.biz-phone, [href^="tel:"]');
                        const phone = phoneEl?.textContent || '-';
                        const addressEl = document.querySelector('.biz-address, .address');
                        const address = addressEl?.textContent || 'N49 Listing';
                        return {
                            name: bizName.trim(),
                            phone: phone.trim().replace(/\s+/g, ' '),
                            address: address.trim().replace(/\s+/g, ' '),
                        };
                    });
                    finalResults.push({
                        name: extractedData.name !== '' ? extractedData.name : '-',
                        address: extractedData.address,
                        phone: extractedData.phone !== '' ? extractedData.phone : '-',
                        locationLink: newPage.url(),
                        source: 'N49',
                        timestamp: new Date().toISOString(),
                    });
                    return finalResults;
                }
                catch (e) {
                    console.error(`❌ [N49] Error scraping deep link: ${link}`, e.message);
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
            console.error('❌ [N49] Global Scraper Error:', error);
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
            if (matchCount < Math.ceil(searchKeywords.length / 2)) {
                continue;
            }
            const existing = await this.locationRepo.findOne({
                where: { locationLink: item.locationLink },
            });
            if (!existing) {
                await this.locationRepo.save(this.locationRepo.create(item));
            }
        }
    }
};
exports.N49ScraperService = N49ScraperService;
exports.N49ScraperService = N49ScraperService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], N49ScraperService);
//# sourceMappingURL=n49Scraper.service.js.map