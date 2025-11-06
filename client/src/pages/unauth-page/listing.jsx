
import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams,  useNavigate } from "react-router-dom";
import { resetProducts, setCurrentPage,resetPaginations } from "@/store/shop/products-slice";
import EnquiryDialog from "@/components/shopping-view/EnquiryDialog";

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


function UnauthShoppingListing() {
  const navigate = useNavigate();
  let lastFetchedPage = 0;
  const dispatch = useDispatch();
  const { productList, productDetails, currentPage, hasMore, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const isInitialRender = useRef(true);
  
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("title-atoz");
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEnquiryDialog, setOpenEnquiryDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isEnquiryLoading, setIsEnquiryLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
   // State to manage selected brands and their subcategories
   const [selectedBrands, setSelectedBrands] = useState([]);
   const [subcategories, setSubcategories] = useState([]);
   const [showArrow, setShowArrow] = useState(false); 
  
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");
  const brandSearchParam = searchParams.get("brand");


  const clearUrl = () => {
    // Get the current URL
    const url = new URL(window.location.href);
    
    // Get the search parameters
    const params = url.searchParams;

    // Loop through each parameter and set its value to an empty string
    for (const key of params.keys()) {
        params.set(key, ''); // Set the value to an empty string
    }

    // Update the URL without refreshing the page
    window.history.replaceState({}, '', url);
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


  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleEnquire(productId) {
    setSelectedProductId(productId);
    setOpenEnquiryDialog(true);
  }

  async function handleSendEnquiry({ productId, email, message, phone }) {
    setIsEnquiryLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/shop/enquire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, email, message, phone }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Enquiry sent successfully!",
        });
        setOpenEnquiryDialog(false);
      } else {
        toast({
          title: "Failed to send enquiry.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsEnquiryLoading(false);
    }
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

  // Handle sort change
  const handleSort = (newSort) => {
    setSort(newSort);
    dispatch(resetProducts());
    dispatch(setCurrentPage(1)); // Reset page when sort changes
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const savedFilters = JSON.parse(sessionStorage.getItem("filters"));
    if (savedFilters) setFilters(savedFilters);
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      // Skip the initial render
      isInitialRender.current = false;
      return;
    }
    
    fetchProducts(); // Fetch products only when currentPage, filters, or sort changes
  }, [currentPage, filters, sort]);

    useEffect(() => {

    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      dispatch(resetProducts())
      dispatch(resetPaginations());
      setSearchParams(new URLSearchParams(createQueryString));

    }
  }, [filters]);
  
  const handleScroll = ()=>{
     // Check if the user has scrolled down more than 50px (desktop) or 30px (mobile)
     if (document.documentElement.scrollTop > (window.innerWidth < 768 ? 2 : 50)) {
      setShowArrow(true); // Show the arrow button
    } else {
      setShowArrow(false); // Hide the arrow button
    }

    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >=
      document.documentElement.scrollHeight &&
      hasMore &&
      !isLoading
    ) {
      
      dispatch(setCurrentPage(currentPage + 1)); // Load more products
    }
  };

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
    
      <ProductFilter filters={filters} handleFilter={handleFilter} setFilters={setFilters} fetchProducts={fetchProducts}  clearUrl={clearUrl} />
      
      
    </div>

    <button
        className="p-2 bg-gray-200 rounded-md mb-2 md:hidden flex items-center gap-2"
        onClick={() => navigate('/shop/search')} // Navigate without reload
      >
        <Search className="h-4 w-4" /> {/* Search Icon */}
        Search
      </button>

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-4 md:p-6">
          {productList?.length > 0 ? (
            productList.map((productItem) => (
              <ShoppingProductTile
                key={productItem._id}
                product={productItem}
                handleGetProductDetails={handleGetProductDetails}
                handleEnquire={handleEnquire}
                isAuthPage={false}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
         {/* Scroll-to-Top Arrow Button */}
      {/* {showArrow && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-3 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 transition duration-300"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )} */}
      </div>
    
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />

      <EnquiryDialog
        open={openEnquiryDialog}
        setOpen={setOpenEnquiryDialog}
        productId={selectedProductId}
        handleSendEnquiry={handleSendEnquiry}
        isLoading={isEnquiryLoading}
      />
    </div>
  );
}

export default UnauthShoppingListing;
