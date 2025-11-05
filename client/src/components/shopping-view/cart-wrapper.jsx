import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useMemo } from "react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount = useMemo(() => {
    return cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            ( currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;
  }, [cartItems]);

  return (
    <SheetContent className="sm:max-w-md h-full overflow-y-auto p-4 scrollbar-hidden">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      <div className="mt-4 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item.id} cartItem={item} />
          ))
        ) : (
          <p className="text-center">Your cart is empty.</p> // Message for empty cart
        )}
      </div>
      <div className="mt-4 space-y-4">
        {cartItems.length > 0 && ( // Only show total if there are items in the cart
          <div className="flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold">₹{totalCartAmount.toFixed(2)}</span>
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
        disabled={cartItems.length === 0}
      >
        Checkout
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
