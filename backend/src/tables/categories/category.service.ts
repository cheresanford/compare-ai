import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ListCategoryQueryDto } from "./dto/list-category.query.dto";

import { Category } from "../categories/entities/category.entity";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async list(query: ListCategoryQueryDto) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;

    const search = query.search ?? "";

    const where = search
      ? {
          name: ILike(`%${search}%`),
        }
      : {};

    const [items, total] = await this.categoriesRepository.findAndCount({
      where,

      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: items.map((category) => this.toCategoryListItem(category)),
      page,
      size,
      total,
      totalPages: Math.ceil(total / size) || 1,
    };
  }

  async getById(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Categoria não encontrado");
    }

    return this.toCategoryListItem(category);
  }

  async create(input: CreateCategoryDto) {
    const nameExists = await this.findName(input.name);

    if (nameExists) {
      throw new BadRequestException("Já existe uma categoria com esse nome");
    }

    const category = this.categoriesRepository.create({
      name: input.name,
    });

    const saved = await this.categoriesRepository.save(category);
    return this.getById(saved.id);
  }

  async update(id: number, input: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException("Categoria não encontrado");
    }

    const nameExists = await this.findName(input.name);

    if (nameExists) {
      throw new BadRequestException("Já existe uma categoria com esse nome");
    }

    if (input.name !== undefined) {
      category.name = input.name;
    }

    await this.categoriesRepository.save(category);
    return this.getById(category.id);
  }

  async remove(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException("Categoria não encontrado");
    }

    await this.categoriesRepository.remove(category);
    return { deleted: true, id };
  }

  private toCategoryListItem(category: Category) {
    return {
      id: category.id,
      name: category.name,
    };
  }

  private async findName(name?: string) {
    const existing = await this.categoriesRepository.findOne({
      where: { name },
    });
    if (existing) {
      return existing;
    }
  }
}
