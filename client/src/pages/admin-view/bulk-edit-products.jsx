import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from 'lodash';
import { ChevronUp } from "lucide-react";
import BulkEditProductTile from "@/components/admin-view/bulk-edit-product-tile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fetchProductsForBulkEdit, bulkUpdateProducts, setSearchQuery, resetProducts } from "@/store/admin/products-slice";

function BulkEditProducts() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { searchQuery } = useSelector((state) => state.adminProducts);

  const [editableProducts, setEditableProducts] = useState([]);
  const [productsToUpdate, setProductsToUpdate] = useState({});
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const fetchedPages = useRef(new Set());
  const [localCurrentPage, setLocalCurrentPage] = useState(1); // Local currentPage state

  const isFetchingRef = useRef(isFetching);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetchProducts = useCallback(async (pageToFetch) => {
    if (isFetchingRef.current || fetchedPages.current.has(pageToFetch) || !hasMoreRef.current) {
        console.log(`Skipping fetch: isFetching=${isFetchingRef.current}, fetchedPagesContains=${fetchedPages.current.has(pageToFetch)}, hasMore=${hasMoreRef.current}`);
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
  }, [dispatch, searchQuery, toast]); // isFetching and hasMore are accessed via refs

  useEffect(() => {
    dispatch(resetProducts()); // Clear previous products on mount
    setEditableProducts([]);
    setProductsToUpdate({});
    setHasMore(true);
    fetchedPages.current.clear();
    setLocalCurrentPage(1); // Reset local currentPage
    fetchProducts(1);
  }, [searchQuery, dispatch, fetchProducts]);

  const handleScroll = useCallback(
    debounce(() => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.scrollHeight - 100;

      if (document.documentElement.scrollTop > (window.innerWidth < 768 ? 30 : 50)) {
        setShowArrow(true);
      } else {
        setShowArrow(false);
      }

      if (scrollPosition >= threshold && hasMoreRef.current && !isFetchingRef.current) {
        setLocalCurrentPage((prev) => prev + 1); // Increment local currentPage
      }
    }, 300),
    [] // Dependencies are now empty because hasMoreRef and isFetchingRef are used
  );

  useEffect(() => {
    // Fetch products when localCurrentPage changes, but only if it's not the initial load (page 1)
    if (localCurrentPage > 1) {
      fetchProducts(localCurrentPage);
    }
  }, [localCurrentPage, fetchProducts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      fetchProducts(1);
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

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {editableProducts && editableProducts.length > 0 ? (
          editableProducts.map((productItem) => (
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

      {showArrow && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-3 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 transition duration-300"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
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