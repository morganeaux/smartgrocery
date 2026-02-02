import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShoppingListItemSchema, insertProductSchema, insertSupermarketSchema, insertHealthCriteriaSchema, productSearchSchema } from "@shared/schema";
import { evaluateProduct, findProductRecommendations } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Shopping List Items Routes
  app.get("/api/shopping-list", async (req, res) => {
    try {
      const items = await storage.getShoppingListItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Laden der Einkaufsliste" });
    }
  });

  app.post("/api/shopping-list", async (req, res) => {
    try {
      const validatedData = insertShoppingListItemSchema.parse(req.body);
      const item = await storage.createShoppingListItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Ungültige Daten für Einkaufslisteneintrag" });
    }
  });

  app.patch("/api/shopping-list/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const item = await storage.updateShoppingListItem(id, updates);
      
      if (!item) {
        return res.status(404).json({ message: "Einkaufslisteneintrag nicht gefunden" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Aktualisieren des Eintrags" });
    }
  });

  app.delete("/api/shopping-list/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteShoppingListItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Einkaufslisteneintrag nicht gefunden" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Löschen des Eintrags" });
    }
  });

  // Products Routes
  app.get("/api/products", async (req, res) => {
    // Wenn ein Suchbegriff übergeben wird, hole Produktvorschläge von OpenFoodFacts
      const query = String(req.query.query || '');
      const limit = Number(req.query.limit || 10);
      // optional supermarket param: filter by selected supermarket
      const supermarketParam = typeof req.query.supermarket === 'string' ? req.query.supermarket : '';
      // optional criteria param: comma-separated list of enabled criteria names
      const criteriaParam = typeof req.query.criteria === 'string' ? req.query.criteria : '';
      const filters: Record<string, any> = { query, limit };
      
      // Add supermarket filter if provided
      if (supermarketParam) {
        filters.supermarket = supermarketParam;
      }
      
      if (criteriaParam) {
        const list = criteriaParam.split(',').map((s) => s.trim()).filter(Boolean);
        // map known criteria names to boolean flags used in Product
        for (const c of list) {
          // basic normalization to lower-case for substring checks
          const key = c.toLowerCase();
          if (key.includes('gluten')) {
            filters.isGlutenFree = true;
            continue;
          }
          if (key.includes('lakt')) {
            filters.isLactoseFree = true;
            continue;
          }
          if (key.includes('soja') || key.includes('soy')) {
            filters.isSoyFree = true;
            continue;
          }
          if (key.includes('süß') || key.includes('suss') || key.includes('sweetener')) {
            filters.hasNoSweeteners = true;
            continue;
          }
          if (key.includes('ultra') || key.includes('ultraverarbeitet') || key.includes('ultraprocess')) {
            filters.isNotUltraProcessed = true;
            continue;
          }
          if (key.includes('bio') || key.includes('organic')) {
            filters.isOrganic = true;
            continue;
          }
          // unknown criteria - skip
        }
      }

      if (!query) return res.json([]);
      try {
        // Zuerst in-memory Produkte suchen
        let products = await storage.getProducts(filters);
        
        // Wenn keine gefunden, von OpenFoodFacts holen
        if (products.length === 0) {
          const { fetchProductsFromOpenFoodFacts } = await import('./services/openfoodfacts-products');
          const openFoodFactsProducts = await fetchProductsFromOpenFoodFacts(query, limit);
          
          // Filter anwenden (falls vorhanden)
          let filteredProducts = openFoodFactsProducts;
          
          if (filters.supermarket) {
            // OpenFoodFacts Produkte haben meist "OpenFoodFacts" als supermarket
            // Wir filtern nur, wenn der Filter nicht "OpenFoodFacts" ist
            if (filters.supermarket !== "OpenFoodFacts") {
              // Bei OpenFoodFacts können wir nicht nach Supermarkt filtern
              // Aber wir können trotzdem die Produkte zurückgeben
            }
          }
          
          // Health Criteria Filter anwenden
          if (filters.isOrganic) {
            filteredProducts = filteredProducts.filter(p => p.isOrganic);
          }
          if (filters.isGlutenFree) {
            filteredProducts = filteredProducts.filter(p => p.isGlutenFree);
          }
          if (filters.isLactoseFree) {
            filteredProducts = filteredProducts.filter(p => p.isLactoseFree);
          }
          if (filters.isSoyFree) {
            filteredProducts = filteredProducts.filter(p => p.isSoyFree);
          }
          if (filters.hasNoSweeteners) {
            filteredProducts = filteredProducts.filter(p => p.hasNoSweeteners);
          }
          if (filters.isNotUltraProcessed) {
            filteredProducts = filteredProducts.filter(p => p.isNotUltraProcessed);
          }
          
          products = filteredProducts.slice(0, limit);
        }
        
        res.json(products);
      } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'failed' });
      }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produkt nicht gefunden" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Laden des Produkts" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Ungültige Produktdaten" });
    }
  });

  app.post("/api/products/:id/evaluate", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produkt nicht gefunden" });
      }

      const evaluation = await evaluateProduct(
        product.name,
        product.brand || "",
        product.nutritionData
      );

      // Update product with evaluation results
      await storage.updateProduct(id, {
        healthScore: evaluation.healthScore,
        aiEvaluation: evaluation.evaluation,
      });

      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ message: "Fehler bei der Produktbewertung: " + (error as Error).message });
    }
  });

  // Supermarkets Routes
  app.get("/api/supermarkets", async (req, res) => {
    try {
      const supermarkets = await storage.getSupermarkets();
      res.json(supermarkets);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Laden der Supermärkte" });
    }
  });

  app.get("/api/supermarkets/selected", async (req, res) => {
    try {
      const supermarket = await storage.getSelectedSupermarket();
      res.json(supermarket);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Laden des ausgewählten Supermarkts" });
    }
  });

  app.post("/api/supermarkets/:id/select", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.selectSupermarket(id);
      
      if (!success) {
        return res.status(404).json({ message: "Supermarkt nicht gefunden" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Auswählen des Supermarkts" });
    }
  });

  // Health Criteria Routes
  app.get("/api/health-criteria", async (req, res) => {
    try {
      const criteria = await storage.getHealthCriteria();
      res.json(criteria);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Laden der Gesundheitskriterien" });
    }
  });

  app.patch("/api/health-criteria/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const criteria = await storage.updateHealthCriteria(id, updates);
      
      if (!criteria) {
        return res.status(404).json({ message: "Gesundheitskriterium nicht gefunden" });
      }
      
      res.json(criteria);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Aktualisieren des Kriteriums" });
    }
  });

  // Product Search Route - matches shopping list items to existing products
  app.post("/api/products/search", async (req, res) => {
    try {
      const { query, filters } = req.body;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Suchbegriff ist erforderlich" });
      }

      // Search for products matching the query
      const searchFilters = {
        query: query.trim(),
        ...filters
      };

      const matchingProducts = await storage.getProducts(searchFilters);
      
      // Sort by price ascending 
      const sortedProducts = matchingProducts.sort((a, b) => a.price - b.price);

      res.json(sortedProducts);
    } catch (error) {
      res.status(500).json({ message: "Fehler bei der Produktsuche: " + (error as Error).message });
    }
  });

  // Product Recommendations Route
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { shoppingListItems, selectedCriteria, supermarket } = req.body;
      
      if (!shoppingListItems || !Array.isArray(shoppingListItems)) {
        return res.status(400).json({ message: "Einkaufsliste ist erforderlich" });
      }

      const recommendations = await findProductRecommendations(
        shoppingListItems,
        selectedCriteria || [],
        supermarket || "REWE"
      );

      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ message: "Fehler bei der Erstellung von Empfehlungen: " + (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
