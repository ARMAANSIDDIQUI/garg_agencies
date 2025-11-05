import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { getAllBrands } from '@/store/admin/brands-slice'; // Adjust path based on your structure
import { getAllCategories } from '@/store/admin/category-slice';
import { debounce } from 'lodash'; 
import { RefreshCcw } from 'lucide-react';
import { ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import { fetchAllProductSearch, resetProducts, setSearchQuery} from "@/store/admin/products-slice";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "@/components/Loader";
const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: 0,
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [showArrow, setShowArrow] = useState(false); 
  const {searchQuery, filteredProducts } = useSelector((state) => state.adminProducts);
  // const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(16); // Adjust based on your requirement
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const { productList } = useSelector((state) => state.adminProducts);
  const { categoriesList } = useSelector((state) => state.category);
  const { brandsList } = useSelector((state) => state.brands);
  const [selectedBrand, setSelectedBrand] = useState("");
  const dispatch = useDispatch();
  const { toast } = useToast();
  // Track which pages are already fetched to avoid duplicate fetches
  const fetchedPages = useRef(new Set());


  
  const fetchProducts = useCallback(async () => {
    if (isFetching || fetchedPages.current.has(currentPage) || !hasMore) return;

    setIsFetching(true);
    fetchedPages.current.add(currentPage); // Mark page as fetched to avoid duplicate calls

    const response = await dispatch(fetchAllProducts({ page: currentPage, limit: 12, searchQuery:searchQuery }));

    if(filteredProducts && filteredProducts.length > 0 ){
      setHasMore(false)



    const responses = await dispatch(fetchAllProductSearch({ page: currentPage, limit: 1000, searchQuery:searchQuery }));
    if (responses.payload?.success && response.payload.data.length < 12) {
      setHasMore(false); // Stop fetching if fewer products are returned
    }
    }


    if (response.payload?.success && response.payload.data.length < 12) {
      setHasMore(false); // Stop fetching if fewer products are returned
    }

    setIsFetching(false);
  }, [currentPage, dispatch, hasMore, isFetching]);

  const handleScroll = useCallback(
    debounce(() => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.scrollHeight - 100;


    // Check if the user has scrolled down more than 50px (desktop) or 30px (mobile)
    if (document.documentElement.scrollTop > (window.innerWidth < 768 ? 30 : 50)) {
      setShowArrow(true); // Show the arrow button
    } else {
      setShowArrow(false); // Hide the arrow button
    }

      if (scrollPosition >= threshold && hasMore && !isFetching) {
        setCurrentPage((prev) => prev + 1); // Increment page on scroll
      }
    }, 300),
    [hasMore, isFetching]
  );

  useEffect(() => {
    if( filteredProducts.length <= 0 ){
    fetchProducts(); // Fetch products when page changes
    }
  }, [currentPage, fetchProducts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

   const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function onSubmit(event) {
    event.preventDefault();

    const updatedProduct = {
      ...formData,
      image: uploadedImageUrl || formData.image, // Use uploaded image or existing image
    };

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData: updatedProduct,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            window.location.reload();
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            window.location.href="/admin/products"
            toast({
              title: "Product added successfully",
            });
          }
        });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        window.location.reload()
      }
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }
  
  function markInStock(productId) {
    dispatch(editProduct({ id: productId, formData: { salePrice: 0 } }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          window.location.reload();
          toast({
            title: "Product marked as in stock",
          });
        }
      });
  }
  
  const markOutOfStock = (productId) => {
    dispatch(editProduct({ id: productId, formData: { salePrice: 10 } }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts()); // Fetch updated product list
          window.location.reload();
          toast({
            title: "Product marked as out of stock",
          });
        } else {
          toast({
            title: "Failed to mark product as out of stock",
            description: data?.payload?.message || "Something went wrong.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Error marking product as out of stock:", error);
        toast({
          title: "Error",
          description: "Failed to mark product as out of stock.",
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    dispatch(getAllBrands());
    dispatch(getAllCategories());
  }, [dispatch]);

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    setFormData((prevData) => ({ ...prevData, brand: value, subcategory: "" })); // Reset subcategory when brand changes
  };

  // Update the registerFormControls to include the beats
  const UpdatedaddProductFormElements = addProductFormElements.map((control) => {
    if (control.name === "brand") {
      return {
        ...control,
        options: brandsList.map((brand) => ({
          id: brand.brandName,
          label: brand.brandName,
        })),
      };
    }
    else if (control.name === "subcategory") {
      return {
        ...control,
        options: [
          { id: "all", label: "All" }, // Adding the default "All" option
          ...brandsList
            .filter((brand) => brand.brandName === formData.brand) // Only show subcategories for the selected brand
            .flatMap((brand) => brand.subcategories.map((sub) => ({
              id: sub,
              label: sub,
            }))),
        ],
      };
    } 
    else if (control.name === "category") {
      return {
        ...control,
        options: categoriesList.map((category) => ({
          id: category.categoryName,
          label: category.categoryName,
        })),
      };
    }
    return control;
  });
  const handleSearch = useCallback(
    debounce((query) => {
      dispatch(fetchAllProductSearch({ page: 1, limit: 1000, searchQuery: query }));
      // Optionally, you can update the filtered products in the state
      dispatch(setSearchQuery(query));
    }, 300),
    []
  );
  

  useEffect(() => {
    if (searchQuery) {
      dispatch(resetProducts())
      setHasMore(false)
      dispatch(fetchAllProductSearch({ page: 1, limit: 1000, searchQuery:searchQuery }));
    }
  }, [searchQuery, dispatch]);
  
  return (
    <Fragment>
       {/* Search Bar */}
       <div className="mb-4">
       
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
         
      </div>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)} size="sm">
          Add New Product
        </Button>
        <Button onClick={() => window.location.reload()} size="sm" className="ml-5">
        <RefreshCcw className="w-4 mr-2" /> Reload Product
        </Button>
      </div>
      {/* <div className="mb-5 w-full flex justify-end">
      
      </div> */}
      

      {/* Product Grid */}
      {/* // In the return statement where you render the products grid */}

<div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">


  {console.log(filteredProducts)}
  
  {filteredProducts && filteredProducts.length > 0 ? (
    filteredProducts.map((productItem) => (
      <AdminProductTile
        key={productItem._id}
        setFormData={setFormData}
        setOpenCreateProductsDialog={setOpenCreateProductsDialog}
        setCurrentEditedId={setCurrentEditedId}
        product={productItem}
        handleDelete={handleDelete}
        markInStock={markInStock}
        markOutOfStock={markOutOfStock}
      />
    ))
  ) : (
    // If filteredProducts is empty, but there is no searchQuery, show all products
    !searchQuery && productList.length > 0 ? (
      productList.map((productItem) => (
        <AdminProductTile
          key={productItem._id}
          setFormData={setFormData}
          setOpenCreateProductsDialog={setOpenCreateProductsDialog}
          setCurrentEditedId={setCurrentEditedId}
          product={productItem}
          handleDelete={handleDelete}
          markInStock={markInStock}
          markOutOfStock={markOutOfStock}
        />
      ))
    ) : (
      <p>No products found</p>
    )
  )}
</div>

     
      {/* Scroll-to-Top Arrow Button */}
      {showArrow && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-3 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 transition duration-300"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
      {hasMore && <div className="text-center py-4"><Loader /></div>}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={UpdatedaddProductFormElements}
              isBtnDisabled={!isFormValid()}
              handleBrandChange={handleBrandChange}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;




