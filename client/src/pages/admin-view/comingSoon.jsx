import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
  fetchOutOfStockProducts, // Import the new thunk
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminComingSoon() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList, outOfStockProducts } = useSelector((state) => state.adminProducts); // Use outOfStockProducts
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Function to submit the form
  function onSubmit(event) {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
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
            toast({
              title: "Product added successfully",
            });
          }
        });
  }

  // Function to handle deletion of products
  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  // Function to validate the form
  function isFormValid() {
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  // Function to mark a product as in stock
  function markInStock(productId) {
    dispatch(editProduct({ id: productId, formData: { salePrice: 0 } }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts()); // Fetch updated product list
          window.location.reload();
          toast({
            title: "Product marked as in stock",
          });
        } else {
          toast({
            title: "Failed to mark product as in stock",
            description: data?.payload?.message || "Something went wrong.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Error marking product as in stock:", error);
        toast({
          title: "Error",
          description: "Failed to mark product as in stock.",
          variant: "destructive",
        });
      });
  }

  // Function to mark a product as out of stock
  const markOutOfStock = (productId) => {
    dispatch(editProduct({ id: productId, formData: { salePrice: 10 } }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts()); // Fetch updated product list
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

  // useEffect to fetch all products and out-of-stock products
  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchOutOfStockProducts()); // Fetch out-of-stock products
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <h2>Out of Stock Products</h2> {/* Heading for out-of-stock products */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {outOfStockProducts.length > 0 ? ( // Check if there are out-of-stock products
          outOfStockProducts.map((productItem) => (
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
          <p>No products are out of stock!</p>
        )}
      </div>
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
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminComingSoon;
