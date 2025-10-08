import { Leaf, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navigation() {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Supermärkte", href: "/supermarket" },
    { label: "Profil", href: "/profile" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center" data-testid="logo">
              <Leaf className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-foreground">GesundEinkauf</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                className="text-foreground hover:text-primary transition-colors"
                data-testid={`nav-link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </a>
            ))}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <a 
                    key={item.label}
                    href={item.href} 
                    className="text-foreground hover:text-primary transition-colors"
                    data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
