import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../../../../tables/categories/entities/category.entity";
import {
  CategoriesRepository,
  CategoryItem,
} from "../../domain/interfaces/categories.repository.interface";

@Injectable()
export class TypeormCategoriesRepository implements CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async list(): Promise<CategoryItem[]> {
    const categories = await this.categoryRepository.find({
      order: { name: "ASC" },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }

  async findById(categoryId: number): Promise<CategoryItem | null> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
    };
  }

  async findByName(name: string): Promise<CategoryItem | null> {
    const normalized = name.trim().toLowerCase();

    const category = await this.categoryRepository
      .createQueryBuilder("category")
      .where("LOWER(TRIM(category.name)) = :name", {
        name: normalized,
      })
      .getOne();

    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
    };
  }

  async create(name: string): Promise<CategoryItem> {
    const entity = this.categoryRepository.create({ name: name.trim() });
    const saved = await this.categoryRepository.save(entity);

    return {
      id: saved.id,
      name: saved.name,
    };
  }

  async update(categoryId: number, name: string): Promise<CategoryItem> {
    await this.categoryRepository.update(
      { id: categoryId },
      { name: name.trim() },
    );

    const updated = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    return {
      id: updated!.id,
      name: updated!.name,
    };
  }

  async delete(categoryId: number): Promise<void> {
    await this.categoryRepository.delete({ id: categoryId });
  }
}
