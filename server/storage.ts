import { type ShoppingListItem, type InsertShoppingListItem, type Product, type InsertProduct, type Supermarket, type InsertSupermarket, type HealthCriteria, type InsertHealthCriteria, type ProductSearchFilters } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Shopping List Items
  getShoppingListItems(): Promise<ShoppingListItem[]>;
  createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem>;
  updateShoppingListItem(id: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem | undefined>;
  deleteShoppingListItem(id: string): Promise<boolean>;

  // Products
  getProducts(filters?: ProductSearchFilters): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Supermarkets
  getSupermarkets(): Promise<Supermarket[]>;
  getSelectedSupermarket(): Promise<Supermarket | undefined>;
  createSupermarket(supermarket: InsertSupermarket): Promise<Supermarket>;
  updateSupermarket(id: string, updates: Partial<Supermarket>): Promise<Supermarket | undefined>;
  selectSupermarket(id: string): Promise<boolean>;

  // Health Criteria
  getHealthCriteria(): Promise<HealthCriteria[]>;
  updateHealthCriteria(id: string, updates: Partial<HealthCriteria>): Promise<HealthCriteria | undefined>;
}

export class MemStorage implements IStorage {
  private shoppingListItems: Map<string, ShoppingListItem>;
  private products: Map<string, Product>;
  private supermarkets: Map<string, Supermarket>;
  private healthCriteria: Map<string, HealthCriteria>;

  constructor() {
    this.shoppingListItems = new Map();
    this.products = new Map();
    this.supermarkets = new Map();
    this.healthCriteria = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default supermarkets
    const defaultSupermarkets: Supermarket[] = [
      { id: randomUUID(), name: "REWE", distance: 0.8, isSelected: true },
      { id: randomUUID(), name: "Edeka", distance: 1.2, isSelected: false },
      { id: randomUUID(), name: "Bio Company", distance: 2.1, isSelected: false },
    ];

    defaultSupermarkets.forEach(market => {
      this.supermarkets.set(market.id, market);
    });

    // Initialize default health criteria
    const defaultCriteria: HealthCriteria[] = [
      { id: randomUUID(), name: "100% Bio-zertifiziert", isEnabled: true, description: "Certified organic products only" },
      { id: randomUUID(), name: "Glutenfrei", isEnabled: true, description: "Gluten-free products" },
      { id: randomUUID(), name: "Laktosefrei", isEnabled: false, description: "Lactose-free products" },
      { id: randomUUID(), name: "Sojafrei", isEnabled: true, description: "Soy-free products" },
      { id: randomUUID(), name: "Ohne Süßstoffe", isEnabled: false, description: "No artificial sweeteners" },
      { id: randomUUID(), name: "Nicht ultraverarbeitet", isEnabled: true, description: "Minimally processed foods" },
    ];

    defaultCriteria.forEach(criteria => {
      this.healthCriteria.set(criteria.id, criteria);
    });

    // Initialize some sample products  
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Bio-Vollkornbrot",
        brand: "Alnatura",
        price: 2.49,
        size: "500g", 
        supermarket: "REWE",
        imageUrl: null,
        isOrganic: true,
        isGlutenFree: false,
        isLactoseFree: true,
        isSoyFree: true,
        hasNoSweeteners: true,
        isNotUltraProcessed: true,
        sugarPerServing: 1.2,
        fiberRatio: 0.15,
        omega6Percentage: null,
        sodiumCalorieRatio: null,
        healthScore: 5,
        aiEvaluation: "Ausgezeichnetes Bio-Vollkornbrot mit hohem Ballaststoffgehalt und minimaler Verarbeitung.",
        nutritionData: null
      },
      {
        id: randomUUID(),
        name: "Glutenfreie Pasta",
        brand: "Schär",
        price: 3.99,
        size: "250g",
        supermarket: "REWE", 
        imageUrl: null,
        isOrganic: false,
        isGlutenFree: true,
        isLactoseFree: true,
        isSoyFree: true,
        hasNoSweeteners: true,
        isNotUltraProcessed: false,
        sugarPerServing: 0.8,
        fiberRatio: 0.05,
        omega6Percentage: null,
        sodiumCalorieRatio: null,
        healthScore: 3,
        aiEvaluation: "Gute glutenfreie Alternative, jedoch verarbeitet und geringerer Nährwert als Vollkorn.",
        nutritionData: null
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // Shopping List Items
  async getShoppingListItems(): Promise<ShoppingListItem[]> {
    return Array.from(this.shoppingListItems.values());
  }

  async createShoppingListItem(insertItem: InsertShoppingListItem): Promise<ShoppingListItem> {
    const id = randomUUID();
    const item: ShoppingListItem = {
      ...insertItem,
      id,
      quantity: insertItem.quantity ?? "1x",
      completed: insertItem.completed ?? false,
      category: insertItem.category ?? null
    };
    this.shoppingListItems.set(id, item);
    return item;
  }

  async updateShoppingListItem(id: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem | undefined> {
    const item = this.shoppingListItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.shoppingListItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteShoppingListItem(id: string): Promise<boolean> {
    return this.shoppingListItems.delete(id);
  }

  // Products
  async getProducts(filters?: ProductSearchFilters): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (!filters) return products;

    if (filters.query) {
      const query = filters.query.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );
    }

    if (filters.supermarket) {
      products = products.filter(product => product.supermarket === filters.supermarket);
    }

    if (filters.isOrganic !== undefined) {
      products = products.filter(product => product.isOrganic === filters.isOrganic);
    }

    if (filters.isGlutenFree !== undefined) {
      products = products.filter(product => product.isGlutenFree === filters.isGlutenFree);
    }

    if (filters.isLactoseFree !== undefined) {
      products = products.filter(product => product.isLactoseFree === filters.isLactoseFree);
    }

    if (filters.isSoyFree !== undefined) {
      products = products.filter(product => product.isSoyFree === filters.isSoyFree);
    }

    if (filters.hasNoSweeteners !== undefined) {
      products = products.filter(product => product.hasNoSweeteners === filters.hasNoSweeteners);
    }

    if (filters.isNotUltraProcessed !== undefined) {
      products = products.filter(product => product.isNotUltraProcessed === filters.isNotUltraProcessed);
    }

    if (filters.minHealthScore !== undefined) {
      products = products.filter(product => product.healthScore >= filters.minHealthScore!);
    }

    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      brand: insertProduct.brand ?? null,
      imageUrl: insertProduct.imageUrl ?? null,
      isOrganic: insertProduct.isOrganic ?? false,
      isGlutenFree: insertProduct.isGlutenFree ?? false,
      isLactoseFree: insertProduct.isLactoseFree ?? false,
      isSoyFree: insertProduct.isSoyFree ?? false,
      hasNoSweeteners: insertProduct.hasNoSweeteners ?? false,
      isNotUltraProcessed: insertProduct.isNotUltraProcessed ?? false,
      sugarPerServing: insertProduct.sugarPerServing ?? null,
      fiberRatio: insertProduct.fiberRatio ?? null,
      omega6Percentage: insertProduct.omega6Percentage ?? null,
      sodiumCalorieRatio: insertProduct.sodiumCalorieRatio ?? null,
      healthScore: insertProduct.healthScore ?? 0,
      aiEvaluation: insertProduct.aiEvaluation ?? null,
      nutritionData: insertProduct.nutritionData ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Supermarkets
  async getSupermarkets(): Promise<Supermarket[]> {
    return Array.from(this.supermarkets.values());
  }

  async getSelectedSupermarket(): Promise<Supermarket | undefined> {
    return Array.from(this.supermarkets.values()).find(market => market.isSelected);
  }

  async createSupermarket(insertSupermarket: InsertSupermarket): Promise<Supermarket> {
    const id = randomUUID();
    const supermarket: Supermarket = {
      ...insertSupermarket,
      id,
      isSelected: insertSupermarket.isSelected ?? false
    };
    this.supermarkets.set(id, supermarket);
    return supermarket;
  }

  async updateSupermarket(id: string, updates: Partial<Supermarket>): Promise<Supermarket | undefined> {
    const supermarket = this.supermarkets.get(id);
    if (!supermarket) return undefined;
    
    const updatedSupermarket = { ...supermarket, ...updates };
    this.supermarkets.set(id, updatedSupermarket);
    return updatedSupermarket;
  }

  async selectSupermarket(id: string): Promise<boolean> {
    // First, deselect all supermarkets
    Array.from(this.supermarkets.entries()).forEach(([marketId, market]) => {
      this.supermarkets.set(marketId, { ...market, isSelected: false });
    });
    
    // Then select the specified supermarket
    const supermarket = this.supermarkets.get(id);
    if (!supermarket) return false;
    
    this.supermarkets.set(id, { ...supermarket, isSelected: true });
    return true;
  }

  // Health Criteria
  async getHealthCriteria(): Promise<HealthCriteria[]> {
    return Array.from(this.healthCriteria.values());
  }

  async updateHealthCriteria(id: string, updates: Partial<HealthCriteria>): Promise<HealthCriteria | undefined> {
    const criteria = this.healthCriteria.get(id);
    if (!criteria) return undefined;
    
    const updatedCriteria = { ...criteria, ...updates };
    this.healthCriteria.set(id, updatedCriteria);
    return updatedCriteria;
  }
}

export const storage = new MemStorage();
