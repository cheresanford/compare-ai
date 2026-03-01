import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../entities/category.entity";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  list() {
    return this.categoryRepository.find({
      order: { name: "ASC" },
    });
  }

  async create(dto: CreateCategoryDto) {
    await this.ensureUniqueName(dto.name);

    const category = this.categoryRepository.create({
      name: dto.name,
    });

    return this.categoryRepository.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Categoria não encontrada");
    }

    if (dto.name !== undefined) {
      const nextName = dto.name.trim();

      if (nextName === category.name) {
        return category;
      }

      await this.ensureUniqueName(nextName, id);
      category.name = nextName;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Categoria não encontrada");
    }

    await this.categoryRepository.remove(category);

    return { deleted: true };
  }

  private async ensureUniqueName(name: string, excludeId?: number) {
    const normalized = name.trim().toLowerCase();

    const query = this.categoryRepository
      .createQueryBuilder("category")
      .where("LOWER(category.name) = :name", { name: normalized });

    if (excludeId) {
      query.andWhere("category.id <> :excludeId", { excludeId });
    }

    const existing = await query.getOne();

    if (existing) {
      throw new ConflictException("Já existe uma categoria com esse nome");
    }
  }
}
