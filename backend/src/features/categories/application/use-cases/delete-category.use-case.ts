import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  CATEGORIES_REPOSITORY,
  CategoriesRepository,
} from "../../domain/interfaces/categories.repository.interface";

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async execute(categoryId: number): Promise<void> {
    const current = await this.categoriesRepository.findById(categoryId);

    if (!current) {
      throw new NotFoundException("Categoria não encontrada.");
    }

    await this.categoriesRepository.delete(categoryId);
  }
}
