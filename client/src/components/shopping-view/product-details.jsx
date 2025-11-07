import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);


  

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");

  }

 
  
  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] h-[80vh] overflow-y-auto">
        <div className="relative overflow-hidden rounded-lg h-[300px] sm:h-[400px]">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-extrabold">{productDetails?.title}</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-muted-foreground text-lg sm:text-2xl mb-5 mt-2">
              {productDetails?.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-2xl sm:text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ₹{productDetails?.price}
            </p>
            { productDetails?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Coming Soon
            </Badge>
          ) : null}
          </div>
          {/* <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-muted-foreground">
              ({averageReview.toFixed(2)})
            </span>
          </div> */}
          {/* <div className="mt-5 mb-5">
          { productQuantity > 0 ? (
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="outline"
              className="h-8 w-8 rounded-full"
              size="icon"
              onClick={handleDecrement}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange} // Handle input change
              onBlur={handleBlur} // Handle when input loses focus
              className="w-1/3 text-center border"
            />
            <Button
              variant="outline"
              className="h-8 w-8 rounded-full"
              size="icon"
              onClick={handleIncrement}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={handleAddToCartClick} className="w-full">
            Add to cart
          </Button>
        )}
          </div> */}
          <Separator />
          
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
