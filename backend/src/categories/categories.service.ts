import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "./category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async list() {
    return this.categoriesRepository.find({ order: { name: "ASC" } });
  }

  async create(dto: CreateCategoryDto) {
    const name = this.normalizeName(dto.name);
    await this.ensureUniqueName(name);

    const category = this.categoriesRepository.create({ name });
    return this.categoriesRepository.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    const name = this.normalizeName(dto.name);

    await this.ensureUniqueName(name, id);
    category.name = name;
    await this.categoriesRepository.save(category);
    return category;
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { id, deleted: true };
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    return category;
  }

  private normalizeName(name: string) {
    const normalized = name.trim().replace(/\s+/g, " ");
    if (normalized.length < 2) {
      throw new BadRequestException("Category name must be 2-60 characters");
    }
    return normalized;
  }

  private async ensureUniqueName(name: string, excludeId?: number) {
    const qb = this.categoriesRepository
      .createQueryBuilder("category")
      .where("LOWER(category.name) = LOWER(:name)", { name });

    if (excludeId) {
      qb.andWhere("category.id <> :excludeId", { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new BadRequestException("Category name already exists");
    }
  }
}
