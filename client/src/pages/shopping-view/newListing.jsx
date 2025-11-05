import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { resetProducts, setCurrentPage,resetPaginations } from "@/store/shop/products-slice";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(","); // Handle multiple values for filters like brand, category, etc.
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    } else if (value) {
      queryParams.push(`${key}=${encodeURIComponent(value)}`); // Handle single filter options
    }
  }

  return queryParams.join("&"); // Join all query params into a string
}


function ShoppingListing() {
  let lastFetchedPage = 0;
  const dispatch = useDispatch();
  const { productList, productDetails, currentPage, hasMore, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  console.log(currentPage)
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("title-atoz");
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
   // State to manage selected brands and their subcategories
   const [selectedBrands, setSelectedBrands] = useState([]);
   const [subcategories, setSubcategories] = useState([]);
  
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");
  const brandSearchParam = searchParams.get("brand");
  

  // function handleSort(value) {
  //   setSort(value);
  // }
  const clearFilters = () => {
    setFilters({}); // Reset filters to their initial state
    setSearchParams()
    dispatch(setCurrentPage(1));
  };

  function handleFilter(getSectionId, getCurrentOption) {
    const updatedFilters = { ...filters };
    if (!updatedFilters[getSectionId]) {
      updatedFilters[getSectionId] = [getCurrentOption];
    } else {
      const index = updatedFilters[getSectionId].indexOf(getCurrentOption);
      if (index === -1) {
        updatedFilters[getSectionId].push(getCurrentOption);
      } else {
        updatedFilters[getSectionId].splice(index, 1);
      }
    }
    setFilters(updatedFilters);
    sessionStorage.setItem("filters", JSON.stringify(updatedFilters));
    dispatch(setCurrentPage(1)); // Reset current page when filters change
  }

useEffect(() => {
    // Reset products when the filters or sorting change
    dispatch(resetProducts());
    dispatch(resetPaginations());
    fetchProducts(); // Call to fetch products with updated filters and reset page
}, [filters, sort]);


  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    // Get current cart items
    let getCartItems = cartItems.items || [];

    // Check if the item is already in the cart
    const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
    );

    // If the item is already in the cart, increment the quantity
    if (indexOfCurrentItem > -1) {
        // Increment the quantity of the existing item
        dispatch(
            updateCartItemQuantity({
                userId: user?.id,
                productId: getCurrentProductId,
                quantity: getCartItems[indexOfCurrentItem].quantity + 1,
            })
        );
    } else {
        // If the item is not in the cart, add it
        dispatch(
            addToCart({
                userId: user?.id,
                productId: getCurrentProductId,
                quantity: 1,
            })
        );
    }

    // Dispatch the fetchCartItems action after adding/updating
    dispatch(fetchCartItems(user?.id));

    // Notify the user
    
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

    const product = productList.find((item) => item._id === productId);
    if (!product) {
      toast({
        title: "Product details not found",
        variant: "destructive",
      });
      return;
    }

    // const getTotalStock = product.totalStock;
    let newQuantity = value;

    // if (newQuantity > getTotalStock) {
    //   toast({
    //     title: `Only ${getTotalStock} items are available in stock`,
    //     variant: "destructive",
    //   });
    //   return;
    // }

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

   // Function to fetch products, only if not loading and has more products
   const fetchProducts = () => {
    if (!isLoading && hasMore) {
      const pageToFetch = currentPage;
  
      if (pageToFetch !== lastFetchedPage) {
        const queryString = createSearchParamsHelper(filters); // Create query string based on filters
        
        dispatch(
          fetchAllFilteredProducts({
            filterParams: filters, // Pass filters directly to the API call
            sortParams: sort,
            page: pageToFetch,
            queryString, // Add the query string here
          })
        );
        lastFetchedPage = pageToFetch;
      }
    }
  };
  

  useEffect(() => {
    // setSort("price-lowtohigh");
    dispatch(setCurrentPage(1));
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParam]);
  useEffect(() => {
    // setSort("price-lowtohigh");
    dispatch(setCurrentPage(1));
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [brandSearchParam]);
  // Fetch products when filters or sorting changes


  

 

  // Handle sort change
  const handleSort = (newSort) => {
    setSort(newSort);
    dispatch(setCurrentPage(1)); // Reset page when sort changes
  };

  useEffect(() => {
    const savedFilters = JSON.parse(sessionStorage.getItem("filters"));
    if (savedFilters) setFilters(savedFilters);
  }, []);
  useEffect(() => {
    fetchProducts(currentPage); // Fetch products when current page, filters, or sort changes
  }, [currentPage, filters, sort]);

    useEffect(() => {

    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      dispatch(resetProducts())
      dispatch(resetPaginations());
      setSearchParams(new URLSearchParams(createQueryString));

    }
  }, [filters]);

  useEffect(() => {
    // Check if query params have brand or category
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");
  
    if (brand || category) {
      // Set filters based on query params
      const updatedFilters = { ...filters };
      if (brand) {
        updatedFilters.brand = [brand]; // Assuming 'brand' is an array of brands
      }
      if (category) {
        updatedFilters.category = [category]; // Assuming 'category' is an array of categories
      }
  
      setFilters(updatedFilters);
      dispatch(setCurrentPage(1)); // Reset current page to 1 if brand or category is present
    }
  }, [searchParams, dispatch]);
  
  

  // Handle infinite scroll for fetching more products
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >=
      document.documentElement.scrollHeight &&
      hasMore &&
      !isLoading
    ) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };

  // Attach scroll event listener for infinite scroll
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Clean up on component unmount
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4 md:p-6 mt-16">
    {/* Toggle button for filters, visible only on mobile and tablet */}
    <button 
      className="p-2 bg-gray-200 rounded-md mb-4 md:hidden" // Hide on md and larger
      onClick={() => setShowFilters(prev => !prev)} // Toggle filter visibility
    >
      {showFilters ? "Hide Filters" : "Show Filters"}
    </button>

    {/* Filter component, shown only on mobile and tablet */}
    <div className={`transition-all duration-300 ease-in-out ${showFilters ? "block" : "hidden"} md:block`}>
      <ProductFilter filters={filters} handleFilter={handleFilter}  />
      {/* Clear Filters button, shown after filters */}
      <button 
        className="mt-2 p-2 bg-red-500 text-white rounded-md"
        onClick={clearFilters}
      >
        Clear Filters
      </button>
    </div>

      <div className="bg-background w-full rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-extrabold">All Products</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">{productList?.length} results</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Sort <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={handleSort}
                >
                  {sortOptions.map((option, index) => (
                    <DropdownMenuRadioItem key={index} value={option.id}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
          {productList?.length > 0 ? (
            productList.map((productItem) => (
              <ShoppingProductTile
                key={productItem._id}
                product={productItem}
                handleGetProductDetails={handleGetProductDetails}
                handleAddtoCart={handleAddtoCart}
                cartItems={cartItems}
                handleUpdateQuantity={handleUpdateQuantity}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>
      {console.log(productDetails)}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />

      
    </div>
  );
}

export default ShoppingListing;  