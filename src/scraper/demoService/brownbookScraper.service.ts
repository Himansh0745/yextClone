import { Injectable } from '@nestjs/common';
import { LocationResponseDto } from '../dto/location-response.dto';
import { Location } from '../location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// IMPORTANT: npm install playwright-extra puppeteer-extra-plugin-stealth
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

@Injectable()
export class BrownbookScraperService {
  constructor(
    @InjectRepository(Location)
    private locationRepo: Repository<Location>,
  ) {}

  async scrapeBrownbook(name: string, location: string): Promise<LocationResponseDto[]> {
    // We use headless: false if you are testing locally so you can see if it bypasses
    const browser = await chromium.launch({ headless: true }); 
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    try {
      // STEP 1: THE SEARCH
      const searchQuery = encodeURIComponent(`${name} ${location}`.trim());
      const searchUrl = `https://www.brownbook.net/search/ca/all-cities/${searchQuery}?page=1`;

      console.log(`[Brownbook] Attempting Stealth Search: ${searchUrl}`);
      
      // Go to search page
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });

      // HUMAN DELAY: Wait a bit to look like a person reading the page
      await page.waitForTimeout(3000);

      // STEP 2: CHECK FOR RESULTS
      // If we see "Results Found 0" or the CAPTCHA box, we try a small scroll to trigger visibility
      const resultsCount = await page.locator('b:has-text("Results Found")').textContent();
      
      if (resultsCount?.includes('0') || await page.$('.g-recaptcha')) {
        console.log('[Brownbook] Captcha/Zero Results detected. Trying behavioral bypass...');
        await page.mouse.wheel(0, 500); // Scroll down
        await page.waitForTimeout(2000);
        // Without a paid solver, if it's still 0, the IP is likely soft-blocked.
      }

      // STEP 3: FIND AND CLICK THE BUSINESS LINK
      // We look for the link that matches our business name
      const businessLinkLocator = page.locator(`a[href*="/business/"]:has-text("${name}")`).first();
      
      // Check if it exists
      if (await businessLinkLocator.count() === 0) {
        console.error('[Brownbook] Could not find the business link in results.');
        return [];
      }

      const targetLink = await businessLinkLocator.getAttribute('href');
      const finalUrl = targetLink?.startsWith('http') ? targetLink : `https://www.brownbook.net${targetLink}`;
      
      console.log(`[Brownbook] Moving to Detail Page: ${finalUrl}`);

      // STEP 4: NAVIGATE TO FINAL LINK & SCRAPE
      await page.goto(finalUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#info-block', { timeout: 10000 });

      const extracted = await page.evaluate(() => {
        const clean = (txt: string | null | undefined) => txt ? txt.replace(/\s+/g, ' ').trim() : '-';
        
        // Name: Based on your screenshot class
        const nameText = clean(document.querySelector('p.text-3xl.font-bold')?.textContent);
        
        // Phone: Based on your screenshot ID
        const phoneText = clean(document.querySelector('#business-phone')?.textContent);
        
        // Address: Cleaning the "CA" flag prefix from the flex container
        const addressEl = document.querySelector('div.flex-wrap.items-center.mb-10');
        const addressText = addressEl ? clean(addressEl.textContent?.replace(/^CA/, '')) : '-';

        return {
          name: nameText,
          phone: phoneText,
          address: addressText,
          locationLink: window.location.href
        };
      });

      // STEP 5: FORMAT AND SAVE
      const result: LocationResponseDto = {
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

    } catch (error) {
      console.error('[Brownbook] Scraper stopped at step:', (error as Error).message);
      return [];
    } finally {
      await browser.close();
    }
  }

  async saveResults(results: LocationResponseDto[]) {
    for (const item of results) {
      const existing = await this.locationRepo.findOne({ where: { locationLink: item.locationLink } });
      if (!existing) {
        await this.locationRepo.save(this.locationRepo.create(item));
      } else {
        await this.locationRepo.update(existing.id, item);
      }
    }
  }
}