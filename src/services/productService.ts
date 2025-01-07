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

  async addProduct(product: Omit<Product, 'id' | 'lastUpdated'>): Promise<Product> {
    this.validateProduct(product);
    
    const products = await this.getAllProducts();
    if (products.some(p => p.barcode === product.barcode)) {
      throw new Error('Ya existe un producto con este código de barras');
    }

    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
      quantity: product.quantity || 0,
      status: product.status || 'active'
    };
    
    products.push(newProduct);
    await this.saveToStorage(this.PRODUCTS_KEY, products);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!id?.trim()) {
      throw new Error('El ID del producto es requerido');
    }

    this.validateProduct(updates);
    const products = await this.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    const updatedProduct = {
      ...products[index],
      ...updates,
      lastUpdated: new Date()
    };

    products[index] = updatedProduct;
    await this.saveToStorage(this.PRODUCTS_KEY, products);
    return updatedProduct;
  }

  async registerMovement(movement: Omit<ProductMovement, 'id'>): Promise<ProductMovement> {
    if (!movement.productId?.trim()) {
      throw new Error('El ID del producto es requerido');
    }
    if (movement.quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    const product = await this.findByBarcode(movement.productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Validar stock suficiente para salidas
    if (movement.type === 'salida' && product.quantity < movement.quantity) {
      throw new Error('Stock insuficiente para realizar la salida');
    }

    const movements = await this.getMovements();
    const newMovement: ProductMovement = {
      ...movement,
      id: crypto.randomUUID(),
      date: new Date()
    };

    // Actualizar cantidad del producto
    const newQuantity = this.calculateNewQuantity(product.quantity, movement.quantity, movement.type);
    await this.updateProduct(product.id, { quantity: newQuantity });

    // Verificar si se alcanzó la cantidad mínima
    if (product.minQuantity && newQuantity <= product.minQuantity) {
      console.warn(`Alerta: Producto ${product.name} ha alcanzado su cantidad mínima`);
      // Aquí se podría implementar un sistema de notificaciones
    }

    movements.push(newMovement);
    await this.saveToStorage(this.MOVEMENTS_KEY, movements);
    return newMovement;
  }

  private calculateNewQuantity(currentQuantity: number, movementQuantity: number, type: MovementType): number {
    switch (type) {
      case 'entrada':
        return currentQuantity + movementQuantity;
      case 'salida':
        return currentQuantity - movementQuantity;
      case 'ajuste':
        return movementQuantity;
      case 'merma':
        return currentQuantity - movementQuantity;
      default:
        throw new Error('Tipo de movimiento no válido');
    }
  }

  async registerNewProduct(productData: Omit<Product, 'id' | 'lastUpdated'>): Promise<Product> {
    this.validateProduct(productData);
    
    const existingProduct = await this.findByBarcode(productData.barcode);
    if (existingProduct) {
      throw new Error('Ya existe un producto con este código de barras');
    }

    const product: Product = {
      ...productData,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
      quantity: productData.quantity || 0,
      status: 'active'
    };

    const products = await this.getAllProducts();
    products.push(product);
    await this.saveToStorage(this.PRODUCTS_KEY, products);
    return product;
  }

  async getMovements(): Promise<ProductMovement[]> {
    return this.getFromStorage<ProductMovement>(this.MOVEMENTS_KEY);
  }

  async getProductMovements(productId: string): Promise<ProductMovement[]> {
    if (!productId?.trim()) {
      throw new Error('El ID del producto es requerido');
    }
    const movements = await this.getMovements();
    return movements.filter(m => m.productId === productId);
  }
}

export const productService = new ProductService();
