import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from 'lodash';
import BulkEditProductTile from "@/components/admin-view/bulk-edit-product-tile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fetchProductsForBulkEdit, bulkUpdateProducts, setSearchQuery, resetProducts } from "@/store/admin/products-slice";
import BulkProductFilters from "@/components/admin-view/BulkProductFilters";

function BulkEditProducts() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { searchQuery } = useSelector((state) => state.adminProducts);

  const [editableProducts, setEditableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProductsForFilters, setAllProductsForFilters] = useState([]);
  const [productsToUpdate, setProductsToUpdate] = useState({});
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const fetchedPages = useRef(new Set());

  const fetchProducts = useCallback(async (pageToFetch) => {
    if (isFetching || fetchedPages.current.has(pageToFetch) || !hasMore) {
        console.log(`Skipping fetch: isFetching=${isFetching}, fetchedPagesContains=${fetchedPages.current.has(pageToFetch)}, hasMore=${hasMore}`);
        return;
    }

    setIsFetching(true);
    fetchedPages.current.add(pageToFetch);

    const response = await dispatch(fetchProductsForBulkEdit({ page: pageToFetch, limit: 12, searchQuery }));

    if (response.payload?.success) {
      setEditableProducts((prev) => {
        const newProducts = response.payload.data.filter(
          (newProd) => !prev.some((prevProd) => prevProd._id === newProd._id)
        );
        return [...prev, ...newProducts];
      });
      // Check if more products can be fetched
      if (response.payload.data.length < 12 || pageToFetch >= response.payload.totalPages) {
        setHasMore(false);
      }
    } else {
      toast({
        title: "Error fetching products",
        description: response.payload?.message || "Something went wrong.",
        variant: "destructive",
      });
      // On error, also stop trying to fetch more
      setHasMore(false);
    }
    setIsFetching(false);
  }, [dispatch, searchQuery, isFetching, hasMore, toast]);

  useEffect(() => {
    dispatch(resetProducts()); // Clear previous products on mount
    setEditableProducts([]);
    setProductsToUpdate({});
    setHasMore(true);
    fetchedPages.current.clear();
    fetchProducts(1);

    const fetchAllProductsForFilters = async () => {
      const response = await dispatch(fetchProductsForBulkEdit({ limit: 10000, searchQuery }));
      if (response.payload?.success) {
        setAllProductsForFilters(response.payload.data);
      }
    };

    fetchAllProductsForFilters();
  }, [searchQuery, dispatch]);

  useEffect(() => {
    dispatch(resetProducts()); // Clear previous products on mount
    setEditableProducts([]);
    setProductsToUpdate({});
    setHasMore(true);
    fetchedPages.current.clear();
    fetchProducts(1);

    const fetchAllProductsForFilters = async () => {
      const response = await dispatch(fetchProductsForBulkEdit({ limit: 10000, searchQuery }));
      if (response.payload?.success) {
        setAllProductsForFilters(response.payload.data);
      }
    };

    fetchAllProductsForFilters();
  }, [searchQuery, dispatch]);



  const handleProductChange = (productId, field, value) => {
    setEditableProducts((prev) =>
      prev.map((product) =>
        product._id === productId ? { ...product, [field]: value } : product
      )
    );
    setProductsToUpdate((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleBulkUpdate = async () => {
    const updates = Object.keys(productsToUpdate).map((productId) => ({
      productId,
      updatedFields: productsToUpdate[productId],
    }));

    if (updates.length === 0) {
      toast({
        title: "No changes to update",
        description: "Please make changes to at least one product.",
        variant: "info",
      });
      setOpenConfirmationModal(false);
      return;
    }

    const response = await dispatch(bulkUpdateProducts({ updates }));

    if (response.payload?.success) {
      toast({
        title: "Bulk update successful",
        description: response.payload.message,
      });
      setOpenConfirmationModal(false);
      setProductsToUpdate({}); // Clear updates after successful submission
      // Re-fetch products to get the latest data
      dispatch(resetProducts());
      setEditableProducts([]);
      setHasMore(true);
      fetchedPages.current.clear();
    } else {
      toast({
        title: "Bulk update failed",
        description: response.payload?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <Fragment>
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
        <Button
          onClick={() => setOpenConfirmationModal(true)}
          size="sm"
          disabled={Object.keys(productsToUpdate).length === 0}
        >
          Update {Object.keys(productsToUpdate).length} Products
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <BulkProductFilters products={allProductsForFilters} onFiltered={setFilteredProducts} />
        </div>
        <div className="md:col-span-3">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((productItem) => (
                <BulkEditProductTile
                  key={productItem._id}
                  product={productItem}
                  onProductChange={handleProductChange}
                />
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>
        </div>
      </div>

      {hasMore && isFetching && <div className="text-center py-4"><Loader /></div>}

      <Dialog open={openConfirmationModal} onOpenChange={setOpenConfirmationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Update</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to update {Object.keys(productsToUpdate).length} products?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirmationModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default BulkEditProducts;