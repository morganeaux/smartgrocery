import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shoppingListItems = pgTable("shopping_list_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  quantity: text("quantity").notNull().default("1x"),
  completed: boolean("completed").notNull().default(false),
  category: text("category"),
  imageUrl: text("image_url"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand"),
  price: real("price").notNull(),
  size: text("size").notNull(),
  supermarket: text("supermarket").notNull(),
  imageUrl: text("image_url"),
  isOrganic: boolean("is_organic").notNull().default(false),
  isGlutenFree: boolean("is_gluten_free").notNull().default(false),
  isLactoseFree: boolean("is_lactose_free").notNull().default(false),
  isSoyFree: boolean("is_soy_free").notNull().default(false),
  hasNoSweeteners: boolean("has_no_sweeteners").notNull().default(false),
  isNotUltraProcessed: boolean("is_not_ultra_processed").notNull().default(false),
  sugarPerServing: real("sugar_per_serving").default(0),
  fiberRatio: real("fiber_ratio").default(0),
  omega6Percentage: real("omega6_percentage").default(0),
  sodiumCalorieRatio: real("sodium_calorie_ratio").default(0),
  healthScore: integer("health_score").notNull().default(0), // 1-5 scale
  aiEvaluation: text("ai_evaluation"),
  nutritionData: jsonb("nutrition_data"),
});

export const supermarkets = pgTable("supermarkets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  distance: real("distance").notNull(), // in km
  isSelected: boolean("is_selected").notNull().default(false),
});

export const healthCriteria = pgTable("health_criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  description: text("description"),
});

// Insert schemas
export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertSupermarketSchema = createInsertSchema(supermarkets).omit({
  id: true,
});

export const insertHealthCriteriaSchema = createInsertSchema(healthCriteria).omit({
  id: true,
});

// Types
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Supermarket = typeof supermarkets.$inferSelect;
export type InsertSupermarket = z.infer<typeof insertSupermarketSchema>;

export type HealthCriteria = typeof healthCriteria.$inferSelect;
export type InsertHealthCriteria = z.infer<typeof insertHealthCriteriaSchema>;

// Product search filters
export const productSearchSchema = z.object({
  query: z.string().optional(),
  supermarket: z.string().optional(),
  isOrganic: z.string().transform((val) => val === 'true').optional(),
  isGlutenFree: z.string().transform((val) => val === 'true').optional(),
  isLactoseFree: z.string().transform((val) => val === 'true').optional(),
  isSoyFree: z.string().transform((val) => val === 'true').optional(),
  hasNoSweeteners: z.string().transform((val) => val === 'true').optional(),
  isNotUltraProcessed: z.string().transform((val) => val === 'true').optional(),
  minHealthScore: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(5)).optional(),
});

export type ProductSearchFilters = z.infer<typeof productSearchSchema>;
