import Address from "@/components/shopping-view/address";
import img from "../../assets/account.webp";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { clearCart } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { clearCartFromDB } from "@/store/shop/cart-slice"; // Import the thunk to clear cart from DB

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [notes, setNotes] = useState("");
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [userLocation, setUserLocation] = useState(null); // State to store user location
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem?.salePrice > 0
            ? currentItem?.salePrice
            : currentItem?.price) *
          currentItem?.quantity,
        0
      )
      : 0;

  // Function to fetch user location
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          toast({
            title: error.message,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  function handlePlaceOrder() {
    if (isLoading) return; // Prevent multiple clicks

    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: "Unable to retrieve your location.",
        variant: "destructive",
      });
      return;
    }

    const { lat, lng } = userLocation;
    placeOrder(lat, lng); // Call the function to place the order
  }

  // Function to handle order placement logic
  function placeOrder(latitude, longitude) {
    const salesmanId = localStorage.getItem('salesmanId') || null;

    const orderData = {
      userId: user?.id,
      salesmanId: salesmanId || null,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        brand: singleCartItem?.brand,
        subcategory: singleCartItem?.subcategory,
        image: singleCartItem?.image,
        price: singleCartItem?.salePrice > 0
          ? singleCartItem?.salePrice
          : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        shopName: user?.userName,
        address: currentSelectedAddress?.address,
        phone: currentSelectedAddress?.phone,
      },
      notes: notes.trim(),
      orderStatus: "pending",
      paymentMethod: "cash-on-delivery",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      location: { latitude, longitude }, // Include the location in the order
    };

    console.log("Order Data:", orderData);

    setIsLoading(true); // Disable button immediately

    dispatch(createNewOrder(orderData)).then((data) => {
      setIsLoading(false); // Re-enable button on completion

      if (data?.payload?.success) {
        dispatch(clearCartFromDB(user?.id)); // Clear cart in DB
        dispatch(clearCart()); // Clear Redux cart
        navigate("/shop/orderSuccess"); // Redirect to success page
      } else {
        toast({
          title: "Order placement failed. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount}</span>
            </div>
          </div>

          {/* Notes Input Field */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 mt-4 border rounded"
            placeholder="Add any notes for your order (optional)"
            rows="4"
          />
          <div className="mt-4 w-full">
            <Button onClick={handlePlaceOrder} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Placing Order...
                </div>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
