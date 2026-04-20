import { Repository } from 'typeorm';
import { BusinessProfile } from './entities/business.entity';
import { Location } from '../scraper/location.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { LocationResponseDto } from "../scraper/dto/location-response.dto";
export declare class BusinessService {
    private readonly repo;
    private readonly locationRepo;
    constructor(repo: Repository<BusinessProfile>, locationRepo: Repository<Location>);
    create(data: CreateBusinessDto): Promise<BusinessProfile>;
    findAll(search?: string): Promise<Location[]>;
    findOne(id: number): Promise<Location>;
    update(id: number, data: LocationResponseDto): Promise<Location>;
    remove(id: number): Promise<Location>;
}
