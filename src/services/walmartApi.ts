import { WALMART_API_CONFIG } from './config';

interface WalmartProduct {
    itemId: string;
    name: string;
    salePrice: number;
    upc: string;
    categoryPath: string;
    shortDescription: string;
    thumbnailImage: string;
    // Agrega más campos según necesites
}

interface WalmartSearchResponse {
    items: WalmartProduct[];
    totalResults: number;
    // Agrega más campos según la respuesta de la API
}

class WalmartApiService {
    private static instance: WalmartApiService;
    private headers: HeadersInit;

    private constructor() {
        this.headers = {
            'Authorization': `Bearer ${WALMART_API_CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
        };
    }

    public static getInstance(): WalmartApiService {
        if (!WalmartApiService.instance) {
            WalmartApiService.instance = new WalmartApiService();
        }
        return WalmartApiService.instance;
    }

    async searchProducts(query: string): Promise<WalmartProduct[]> {
        try {
            const response = await fetch(
                `${WALMART_API_CONFIG.BASE_URL}/search?query=${encodeURIComponent(query)}`,
                {
                    method: 'GET',
                    headers: this.headers,
                }
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data: WalmartSearchResponse = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    async getProductByUPC(upc: string): Promise<WalmartProduct | null> {
        try {
            const products = await this.searchProducts(upc);
            return products.find(product => product.upc === upc) || null;
        } catch (error) {
            console.error('Error getting product by UPC:', error);
            throw error;
        }
    }
}

export const walmartApi = WalmartApiService.getInstance();
