import { Inject, Injectable } from "@nestjs/common";
import {
  CATEGORIES_REPOSITORY,
  CategoriesRepository,
} from "../../domain/interfaces/categories.repository.interface";

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  execute() {
    return this.categoriesRepository.list();
  }
}
