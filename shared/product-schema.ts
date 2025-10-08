// Gemeinsames Produkt-Schema für alle Supermärkte
export interface SupermarketProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  supermarketId: string;
  available: boolean;
  description?: string;
  brand?: string;
  unit?: string;
  updatedAt?: string;
}