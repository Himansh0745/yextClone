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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("./entities/business.entity");
const location_entity_1 = require("../scraper/location.entity");
let BusinessService = class BusinessService {
    repo;
    locationRepo;
    constructor(repo, locationRepo) {
        this.repo = repo;
        this.locationRepo = locationRepo;
    }
    async create(data) {
        const newProfile = this.repo.create(data);
        return await this.repo.save(newProfile);
    }
    async findAll(search) {
        return await this.locationRepo.find({
            where: search
                ? [{ address: (0, typeorm_2.ILike)(`%${search}%`) }, { name: (0, typeorm_2.ILike)(`%${search}%`) }]
                : {},
        });
    }
    async findOne(id) {
        const profile = await this.locationRepo.findOne({
            where: { id },
        });
        if (!profile)
            throw new common_1.NotFoundException('search history not found');
        return profile;
    }
    async update(id, data) {
        await this.findOne(id);
        await this.locationRepo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        const profile = await this.findOne(id);
        return await this.locationRepo.remove(profile);
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessService);
//# sourceMappingURL=business.service.js.map