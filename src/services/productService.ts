import { Product, ProductMovement, MovementType } from '../types';

class ProductService {
  private readonly PRODUCTS_KEY = 'centro_acopio_products';
  private readonly MOVEMENTS_KEY = 'centro_acopio_movements';

  private async saveToStorage<T>(key: string, data: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to storage: ${key}`, error);
      throw new Error('Error al guardar datos en el almacenamiento local');
    }
  }

  private async getFromStorage<T>(key: string): Promise<T[]> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      throw new Error('Error al leer datos del almacenamiento local');
    }
  }

  private validateProduct(product: Partial<Product>): void {
    if (!product.name?.trim()) {
      throw new Error('El nombre del producto es requerido');
    }
    if (!product.category?.trim()) {
      throw new Error('La categoría es requerida');
    }
    if (product.quantity !== undefined && product.quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    if (product.minQuantity !== undefined && product.minQuantity < 0) {
      throw new Error('La cantidad mínima no puede ser negativa');
    }
  }

  async getAllProducts(): Promise<Product[]> {
    return this.getFromStorage<Product>(this.PRODUCTS_KEY);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    if (!barcode?.trim()) {
      throw new Error('El código de barras es requerido');
    }
    const products = await this.getAllProducts();
    return products.find(p => p.barcode === barcode) || null;
  }

  async addProduct(product: Partial<Product>): Promise<Product> {
    this.validateProduct(product);
    
    if (product.barcode) {
      const existingProduct = await this.findByBarcode(product.barcode);
      if (existingProduct) {
        throw new Error('Ya existe un producto con este código de barras');
      }
    }

    const products = await this.getAllProducts();
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: product.name!,
      category: product.category!,
      barcode: product.barcode || '',
      quantity: product.quantity || 0,
      minQuantity: product.minQuantity || 0,
      description: product.description || '',
      location: product.location || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    await this.saveToStorage(this.PRODUCTS_KEY, products);

    await this.addMovement({
      id: crypto.randomUUID(),
      productId: newProduct.id,
      type: MovementType.ALTA,
      quantity: newProduct.quantity,
      date: new Date().toISOString(),
      notes: 'Alta inicial de producto'
    });

    return newProduct;
  }

  async getMovements(): Promise<ProductMovement[]> {
    return this.getFromStorage<ProductMovement>(this.MOVEMENTS_KEY);
  }

  async getProductMovements(productId: string): Promise<ProductMovement[]> {
    const movements = await this.getMovements();
    return movements.filter(m => m.productId === productId);
  }

  async addMovement(movement: Omit<ProductMovement, 'id'>): Promise<ProductMovement> {
    const movements = await this.getMovements();
    const newMovement: ProductMovement = {
      id: crypto.randomUUID(),
      ...movement
    };

    movements.push(newMovement);
    await this.saveToStorage(this.MOVEMENTS_KEY, movements);
    return newMovement;
  }
}

export const productService = new ProductService();
