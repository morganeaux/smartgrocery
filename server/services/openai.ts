import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ProductEvaluation {
  healthScore: number; // 1-5 scale
  evaluation: string; // German explanation
  meetsAllCriteria: boolean;
  criteriaAnalysis: {
    noTransFats: boolean;
    lowSugar: boolean;
    noHarmfulAdditives: boolean;
    goodSodiumRatio: boolean;
    noHarmfulSweeteners: boolean;
    lowOmega6: boolean;
    goodFiberRatio: boolean;
    organic: boolean;
    nonGMO: boolean;
    coldPressedOils: boolean;
    noSweeteners: boolean;
    noSugarAlcohols: boolean;
    notUltraProcessed: boolean;
    soyFree: boolean;
    glutenFree: boolean;
    lactoseFree: boolean;
  };
  recommendations?: string[];
}

export async function evaluateProduct(
  productName: string,
  brand: string,
  nutritionData: any
): Promise<ProductEvaluation> {
  try {
    const prompt = `
Du bist ein Ernährungsexperte. Bewerte das folgende Produkt basierend auf diesen strengen Gesundheitskriterien:

1. Keine Trans-Fette oder künstlich gehärtete/teilweise gehärtete Pflanzenöle oder Margarine
2. Maximal 4g zugesetzter Zucker pro Portion (2g bei Getränken)
3. Keine Zusatzstoffe mit Gesundheitsrisiken
4. Keine synthetischen Emulgatoren in fermentierten Milchprodukten
5. Weniger als 2:1 Verhältnis von Kilokalorien zu Milligramm Natrium
6. Keine schädlichen Süßstoffe
7. Keine Öle mit mehr als 40% Omega-6-Fettsäuren (Sonnenblumen-, Baumwollsamen-, Soja- oder Maisöl)
8. Ballaststoff-Verhältnis (zu Kohlenhydraten) >1:10
9. 100% Bio-zertifiziert
10. Ohne Gentechnik
11. Nur kaltgepresste pflanzliche Öle
12. Keine Süßstoffe
13. Keine Zuckeralkohole
14. Nicht ultraverarbeitet
15. Sojafrei
16. Glutenfrei
17. Laktosefrei

Produkt: ${productName} von ${brand}
Nährstoffdaten: ${JSON.stringify(nutritionData)}

Gib eine Bewertung von 1-5 Sternen ab (5 = exzellent, erfüllt alle Kriterien).
Erkläre auf Deutsch, warum das Produkt diese Bewertung erhält.
Analysiere jedes Kriterium einzeln.

Antworte im JSON-Format:
{
  "healthScore": number,
  "evaluation": "string",
  "meetsAllCriteria": boolean,
  "criteriaAnalysis": {
    "noTransFats": boolean,
    "lowSugar": boolean,
    "noHarmfulAdditives": boolean,
    "goodSodiumRatio": boolean,
    "noHarmfulSweeteners": boolean,
    "lowOmega6": boolean,
    "goodFiberRatio": boolean,
    "organic": boolean,
    "nonGMO": boolean,
    "coldPressedOils": boolean,
    "noSweeteners": boolean,
    "noSugarAlcohols": boolean,
    "notUltraProcessed": boolean,
    "soyFree": boolean,
    "glutenFree": boolean,
    "lactoseFree": boolean
  },
  "recommendations": ["string array with improvement suggestions if any"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Du bist ein Ernährungsexperte, der Produkte nach strengen Gesundheitskriterien bewertet. Antworte immer auf Deutsch und sei sehr detailliert in deiner Analyse."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      healthScore: Math.max(1, Math.min(5, Math.round(result.healthScore))),
      evaluation: result.evaluation || "Bewertung konnte nicht erstellt werden.",
      meetsAllCriteria: result.meetsAllCriteria || false,
      criteriaAnalysis: result.criteriaAnalysis || {},
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("Failed to evaluate product:", error);
    throw new Error("Produktbewertung fehlgeschlagen: " + (error as Error).message);
  }
}

export async function findProductRecommendations(
  shoppingListItems: string[],
  selectedCriteria: string[],
  supermarket: string
): Promise<string[]> {
  try {
    const prompt = `
Du bist ein Ernährungsberater. Empfiehl gesunde Produkte für diese Einkaufsliste in ${supermarket}.

Einkaufsliste: ${shoppingListItems.join(", ")}
Ausgewählte Kriterien: ${selectedCriteria.join(", ")}

Empfiehl spezifische Produktnamen und Marken, die in deutschen Supermärkten verfügbar sind und die Kriterien erfüllen.
Antworte mit einer JSON-Liste von Produktempfehlungen:

{
  "recommendations": ["Produktname 1", "Produktname 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Du bist ein Ernährungsberater, der gesunde Produktempfehlungen für deutsche Supermärkte gibt."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations || [];
  } catch (error) {
    console.error("Failed to get product recommendations:", error);
    throw new Error("Produktempfehlungen konnten nicht erstellt werden: " + (error as Error).message);
  }
}
