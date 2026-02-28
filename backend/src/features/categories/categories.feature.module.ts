import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoriesController } from "./categories.controller";
import { CreateCategoryUseCase } from "./application/use-cases/create-category.use-case";
import { DeleteCategoryUseCase } from "./application/use-cases/delete-category.use-case";
import { ListCategoriesUseCase } from "./application/use-cases/list-categories.use-case";
import { UpdateCategoryUseCase } from "./application/use-cases/update-category.use-case";
import { CATEGORIES_REPOSITORY } from "./domain/interfaces/categories.repository.interface";
import { TypeormCategoriesRepository } from "./infrastructure/repositories/typeorm-categories.repository";
import { Category } from "../../tables/categories/entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [
    ListCategoriesUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    TypeormCategoriesRepository,
    {
      provide: CATEGORIES_REPOSITORY,
      useExisting: TypeormCategoriesRepository,
    },
  ],
})
export class CategoriesFeatureModule {}
