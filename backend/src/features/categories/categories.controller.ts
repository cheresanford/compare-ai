import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateCategoryDto } from "./application/dtos/create-category.dto";
import { UpdateCategoryDto } from "./application/dtos/update-category.dto";
import { CreateCategoryUseCase } from "./application/use-cases/create-category.use-case";
import { DeleteCategoryUseCase } from "./application/use-cases/delete-category.use-case";
import { ListCategoriesUseCase } from "./application/use-cases/list-categories.use-case";
import { UpdateCategoryUseCase } from "./application/use-cases/update-category.use-case";

@Controller("categories")
export class CategoriesController {
  constructor(
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Get()
  async list() {
    return this.listCategoriesUseCase.execute();
  }

  @Post()
  async create(@Body() body: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(body);
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.updateCategoryUseCase.execute(id, body);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.deleteCategoryUseCase.execute(id);
    return { success: true };
  }
}
