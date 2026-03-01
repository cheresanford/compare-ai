import { CategoryEntity } from "src/categories/entities/category.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { log } from "console";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const novaCategoria = this.categoriesRepository.create(createCategoryDto);

    return this.categoriesRepository.save(novaCategoria);
  }

  async findAll() {
    const todasCategorias = await this.categoriesRepository.find();
    log("todas categorias: ", todasCategorias);

    return todasCategorias;
  }

  async findOne(id: number): Promise<CategoryEntity> {
    console.log("category id: ", id);
    const category = await this.categoriesRepository.findOne({
      where: { id: id },
    });
    console.log("category: ", category);
    if (!category) {
      throw new NotFoundException("Categoria não encontrada!");
    }
    return category;
  }
  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  async remove(
    id: number,
  ): Promise<{ deleted: true } & Pick<CategoryEntity, "id">> {
    const existing = await this.findOne(id);
    await this.categoriesRepository.remove(existing);
    return { id, deleted: true };
  }
}
