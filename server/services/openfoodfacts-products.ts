import type { Product } from "@shared/schema";

export async function fetchProductsFromOpenFoodFacts(query: string): Promise<Product[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1`;
  const res = await fetch(url);
  const data = await res.json();

  return (data.products || []).map((p: any) => {
    const imageUrl = p.image_front_url || p.image_url || p.image_small_url || "";
    const name = p.product_name || p.generic_name || p.brands || "Unbekanntes Produkt";
    const brand = Array.isArray(p.brands_tags) && p.brands_tags.length ? p.brands_tags[0] : (p.brands || "");
    const size = p.quantity || p.packaging || p.packaging_tags?.join(", ") || "";

    const product: Product = {
      id: p.id || p.code || Math.random().toString(36).slice(2, 9),
      name,
      brand,
      price: 0, // OpenFoodFacts enthält meist keine Preise — leave 0 as fallback
      size,
      supermarket: "OpenFoodFacts",
      imageUrl,
      isOrganic: !!(p.labels_tags && p.labels_tags.includes("en:organic")),
      isGlutenFree: false,
      isLactoseFree: false,
      isSoyFree: false,
      hasNoSweeteners: false,
      isNotUltraProcessed: false,
      sugarPerServing: 0,
      fiberRatio: 0,
      omega6Percentage: 0,
      sodiumCalorieRatio: 0,
      healthScore: 0,
      aiEvaluation: "",
      nutritionData: p.nutriments || null,
    };

    return product;
  });
}

/**
 * Weitere APIs für vollständige Supermarkt-Sortimente inkl. Preise/Verfügbarkeit (Partnerschaften oder kommerzielle Nutzung nötig):
 * - Edeka API (https://developer.edeka.de/)
 * - Rewe API (https://developer.rewe.de/)
 * - Kaufland API (https://developer.kaufland.com/)
 * - Globus API (https://www.globus.de/developer/)
 * - Metro API (https://developer.metro.de/)
 * - Open Product Data (https://product-open-data.com/)
 * - GS1 SmartSearch (https://www.gs1.org/standards/smartsearch)
 *
 * Hinweis: Für Preis- und Verfügbarkeitsdaten ist meist eine Partnerschaft mit dem jeweiligen Supermarkt erforderlich.
 */