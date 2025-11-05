import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";

import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.shopSearch);
  const { productList, productDetails, currentPage, hasMore, isLoading } = useSelector(
    (state) => state.shopProducts
  );
   
  

  const { user } = useSelector((state) => state.auth);

  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  useEffect(() => {
    const handler = setTimeout(() => {
      if (keyword.trim() === "") {
        dispatch(resetSearchResults());
        setSearchParams(new URLSearchParams());
      } else {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      }
    }, 300); // Adjust the delay as necessary);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword, dispatch]);

 function handleAddtoCart(getCurrentProductId) {
   
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      // if (indexOfCurrentItem > -1) {
      //   const getQuantity = getCartItems[indexOfCurrentItem].quantity;
      //   if (getQuantity + 1 > getTotalStock) {
      //     toast({
      //       title: `Only ${getQuantity} quantity can be added for this item`,
      //       variant: "destructive",
      //     });

      //     return;
      //   }
      // }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        
      }
    });
  }

function handleUpdateQuantity(productId, value) {
  let getCartItems = cartItems.items || [];
  const cartItem = getCartItems.find((item) => item.productId === productId);

  if (!cartItem) {
    toast({
      title: "Product not found in the cart",
      variant: "destructive",
    });
    return;
  }

  // Now we will check `searchResults` instead of `productList`
  const product = searchResults.find((item) => item._id === productId);
  if (!product) {
    toast({
      title: "Product details not found",
      variant: "destructive",
    });
    return;
  }

  // const getTotalStock = product.totalStock; // Uncomment if totalStock logic needed
  let newQuantity = value;

  if (newQuantity < 1) {
    dispatch(deleteCartItem({ userId: user?.id, productId })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
      } else {
        toast({
          title: "Failed to delete cart item",
          variant: "destructive",
        });
      }
    });
    return;
  }

  dispatch(
    updateCartQuantity({
      userId: user?.id,
      productId,
      quantity: newQuantity,
    })
  ).then((data) => {
    if (data?.payload?.success) {
      dispatch(fetchCartItems(user?.id));
    } else {
      toast({
        title: "Failed to update cart item",
        variant: "destructive",
      });
    }
  });
}



  function handleGetProductDetails(getCurrentProductId) {
   
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  

  return (
    <div className="container mx-auto md:px-6 px-4 py-8 mt-16">
      <div className="flex justify-center mb-8">
        <div className="w-full flex items-center">
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-6"
            placeholder="Search Products..."
          />
        </div>
      </div>
       {/* Display loading and results message */}
      
      {searchResults.length === 0 && (
        <h1 className="text-2xl font-bold">No results found!</h1>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {searchResults.map((item) => (
          <ShoppingProductTile
            product={item}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddtoCart}
            cartItems={cartItems}
            handleUpdateQuantity={handleUpdateQuantity}
          />
        ))}
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default SearchProducts;
