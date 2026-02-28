import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateCategoryDto } from "../dtos/update-category.dto";
import {
  CATEGORIES_REPOSITORY,
  CategoriesRepository,
} from "../../domain/interfaces/categories.repository.interface";

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async execute(categoryId: number, dto: UpdateCategoryDto) {
    const current = await this.categoriesRepository.findById(categoryId);

    if (!current) {
      throw new NotFoundException("Categoria não encontrada.");
    }

    const duplicated = await this.categoriesRepository.findByName(dto.name);
    if (duplicated && duplicated.id !== categoryId) {
      throw new ConflictException("Já existe uma categoria com esse nome.");
    }

    return this.categoriesRepository.update(categoryId, dto.name);
  }
}
