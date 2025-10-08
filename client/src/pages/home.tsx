import Navigation from "@/components/navigation";
import ShoppingListSidebar from "@/components/shopping-list-sidebar";
import SupermarketSelector from "@/components/supermarket-selector";
import FilterControls from "@/components/filter-controls";
import ProductDetailModal from "@/components/product-detail-modal";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-green-600 rounded-lg p-8 mb-8 text-white" data-testid="welcome-section">
          <h2 className="text-3xl font-bold mb-4">Willkommen bei GesundEinkauf</h2>
          <p className="text-green-100 text-lg mb-6">Finden Sie gesunde Produkte, die Ihren Ernährungskriterien entsprechen</p>
          {/* Redundante Buttons entfernt, da die Funktionen im Body verfügbar sind */}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shopping List Sidebar */}
          <div className="lg:col-span-1">
            <ShoppingListSidebar onProductSelect={setSelectedProductId} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <SupermarketSelector />
            <FilterControls />
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal 
        productId={selectedProductId} 
        onClose={() => setSelectedProductId(null)} 
      />
    </div>
  );
}
