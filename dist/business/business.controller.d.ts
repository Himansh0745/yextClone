import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { LocationResponseDto } from "../scraper/dto/location-response.dto";
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    create(body: CreateBusinessDto): Promise<import("./entities/business.entity").BusinessProfile>;
    findAll(address: string): Promise<import("../scraper/location.entity").Location[]>;
    findOne(id: number): Promise<import("../scraper/location.entity").Location>;
    update(id: number, body: LocationResponseDto): Promise<import("../scraper/location.entity").Location>;
    remove(id: number): Promise<import("../scraper/location.entity").Location>;
}
