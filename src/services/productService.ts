import { Product, ProductMovement } from '../types';

class ProductService {
  private readonly PRODUCTS_KEY = 'centro_acopio_products';
  private readonly MOVEMENTS_KEY = 'centro_acopio_movements';

  // Obtener todos los productos
  async getAllProducts(): Promise<Product[]> {
    const products = localStorage.getItem(this.PRODUCTS_KEY);
    return products ? JSON.parse(products) : [];
  }

  // Buscar producto por código de barras
  async findByBarcode(barcode: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find(p => p.barcode === barcode) || null;
  }

  // Agregar nuevo producto
  async addProduct(product: Omit<Product, 'id' | 'lastUpdated'>): Promise<Product> {
    const products = await this.getAllProducts();
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      lastUpdated: new Date()
    };
    
    products.push(newProduct);
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  }

  // Actualizar producto existente
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
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
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    return updatedProduct;
  }

  // Registrar movimiento
  async registerMovement(movement: Omit<ProductMovement, 'id'>): Promise<ProductMovement> {
    const movements = await this.getMovements();
    const newMovement: ProductMovement = {
      ...movement,
      id: crypto.randomUUID()
    };

    // Actualizar cantidad del producto
    const product = await this.findByBarcode(movement.productId);
    if (product) {
      const newQuantity = movement.type === 'entrada'
        ? product.quantity + movement.quantity
        : product.quantity - movement.quantity;

      await this.updateProduct(product.id, { quantity: newQuantity });
    }

    movements.push(newMovement);
    localStorage.setItem(this.MOVEMENTS_KEY, JSON.stringify(movements));
    return newMovement;
  }

  // Obtener movimientos
  private async getMovements(): Promise<ProductMovement[]> {
    const movements = localStorage.getItem(this.MOVEMENTS_KEY);
    return movements ? JSON.parse(movements) : [];
  }
}

export const productService = new ProductService();
