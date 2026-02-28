export interface CategoryItem {
  id: number;
  name: string;
}

export const CATEGORIES_REPOSITORY = Symbol("CATEGORIES_REPOSITORY");

export interface CategoriesRepository {
  list(): Promise<CategoryItem[]>;
  findById(categoryId: number): Promise<CategoryItem | null>;
  findByName(name: string): Promise<CategoryItem | null>;
  create(name: string): Promise<CategoryItem>;
  update(categoryId: number, name: string): Promise<CategoryItem>;
  delete(categoryId: number): Promise<void>;
}
