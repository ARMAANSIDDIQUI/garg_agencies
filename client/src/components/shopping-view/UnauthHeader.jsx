import { Menu } from "lucide-react";
import { FcStumbleupon } from "react-icons/fc";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useState } from "react";

function MenuItems({ closeSheet }) {
  const navigate = useNavigate();

  const unauthMenuItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "products", label: "Products", path: "/listing" },
  ];

  function handleNavigate(getCurrentMenuItem) {
    navigate(getCurrentMenuItem.path);
    if (closeSheet) {
      closeSheet();
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {unauthMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer"
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

import PWAInstallButton from "../common/PWAInstallButton";

function UnauthHeader() {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <FcStumbleupon className="h-6 w-6" />
          <span className="font-bold">Garg Agencies</span>
        </Link>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <div className="lg:hidden flex items-center gap-2">
            <PWAInstallButton />
            <Button onClick={() => navigate("/auth/login")}>Login</Button>
          </div>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSheetOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-full max-w-xs flex flex-col gap-4">
            <MenuItems closeSheet={() => setIsSheetOpen(false)} />
            <PWAInstallButton className="w-full" />
            <Button onClick={() => navigate("/auth/login")} className="w-full">Login</Button>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <PWAInstallButton />
          <Button onClick={() => navigate("/auth/login")}>Login</Button>
        </div>
      </div>
    </header>
  );
}

export default UnauthHeader;
