import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "../dtos/create-category.dto";
import {
  CATEGORIES_REPOSITORY,
  CategoriesRepository,
} from "../../domain/interfaces/categories.repository.interface";

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async execute(dto: CreateCategoryDto) {
    const existing = await this.categoriesRepository.findByName(dto.name);

    if (existing) {
      throw new ConflictException("Já existe uma categoria com esse nome.");
    }

    return this.categoriesRepository.create(dto.name);
  }
}
