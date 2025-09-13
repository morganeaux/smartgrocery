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
    try {
      const filters = productSearchSchema.parse(req.query);
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Laden der Produkte" });
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
