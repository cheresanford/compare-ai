import {
  ConflictException,
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

  async list(): Promise<CategoryEntity[]> {
    return this.categoriesRepository.find({ order: { name: "ASC" } });
  }

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const name = this.normalizeName(dto.name);
    await this.assertNameAvailable(name);

    try {
      const created = this.categoriesRepository.create({ name });
      return await this.categoriesRepository.save(created);
    } catch (e: any) {
      if (this.isDuplicateKeyError(e)) {
        throw new ConflictException("Category name already exists");
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findOne(id);

    const name = this.normalizeName(dto.name);
    await this.assertNameAvailable(name, id);

    category.name = name;

    try {
      return await this.categoriesRepository.save(category);
    } catch (e: any) {
      if (this.isDuplicateKeyError(e)) {
        throw new ConflictException("Category name already exists");
      }
      throw e;
    }
  }

  async remove(id: number): Promise<{ id: number; deleted: true }> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { id, deleted: true };
  }

  private normalizeName(raw: string) {
    return raw.trim();
  }

  private async assertNameAvailable(name: string, excludeId?: number) {
    const qb = this.categoriesRepository
      .createQueryBuilder("category")
      .where("LOWER(category.name) = LOWER(:name)", { name });

    if (excludeId) {
      qb.andWhere("category.id <> :excludeId", { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException("Category name already exists");
    }
  }

  private isDuplicateKeyError(e: any) {
    // MySQL: ER_DUP_ENTRY
    return e?.code === "ER_DUP_ENTRY";
  }
}
