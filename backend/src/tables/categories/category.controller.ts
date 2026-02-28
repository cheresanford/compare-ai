import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { CategoryService } from "./category.service";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ListCategoryQueryDto } from "./dto/list-category.query.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  list(@Query() query: ListCategoryQueryDto) {
    return this.categoryService.list(query);
  }

  @Get(":id")
  getById(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.getById(id);
  }

  @Post()
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
