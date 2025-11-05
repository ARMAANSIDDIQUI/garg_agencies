import React, { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBrands, deleteBrandById, addBrand, editBrand } from '@/store/admin/brands-slice'; // Adjust path based on your structure
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Adjust path
import { Button } from '@/components/ui/button'; // Adjust path
import ProductImageUpload from "@/components/admin-view/image-upload";

function AdminBrands() {
  const dispatch = useDispatch();
  const { brandsList, isLoading } = useSelector((state) => state.brands);
  
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null); // For identifying the brand being edited
  const [newBrandName, setNewBrandName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [subcategories, setSubcategories] = useState(['']); // Track subcategories

  useEffect(() => {
    dispatch(getAllBrands());
  }, [dispatch]);

  const handleDeleteBrand = (brandId) => {
    if (window.confirm("Are you sure you want to delete this brand? All products with this brand will also be deleted.")) {
      dispatch(deleteBrandById(brandId));
    }
  };

  const handleEditBrand = (brand) => {
    setCurrentEditedId(brand._id);
    setNewBrandName(brand.brandName);
    setUploadedImageUrl(brand.imageUrl); // Assume brand has an imageUrl property
    setSubcategories(brand.subcategories || ['']); // Set existing subcategories or empty
    setSheetOpen(true);
  };

  const handleAddBrand = () => {
    setCurrentEditedId(null);
    setNewBrandName('');
    setImageFile(null);
    setUploadedImageUrl('');
    setSubcategories(['']); // Reset subcategories
    setSheetOpen(true);
  };

  const handleSubcategoryChange = (index, value) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories[index] = value;
    setSubcategories(updatedSubcategories);
  };

  const handleAddSubcategoryField = () => {
    setSubcategories([...subcategories, '']);
  };

  const handleRemoveSubcategoryField = (index) => {
    const updatedSubcategories = subcategories.filter((_, i) => i !== index);
    setSubcategories(updatedSubcategories);
  };

  const handleSubmit = () => {
    const brandData = {
      brandName: newBrandName,
      imageUrl: uploadedImageUrl,
      subcategories, // Pass the subcategories array
    };

    if (currentEditedId) {
      // Editing an existing brand
      dispatch(editBrand({ id: currentEditedId, brandData }));
    } else {
      // Adding a new brand
      dispatch(addBrand(brandData));
    }
    setSheetOpen(false); // Close the sheet after submission
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Brands</h1>
        <button 
          onClick={handleAddBrand} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
        >
          Add Brand
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading brands...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {brandsList.map((brand) => (
              <li key={brand._id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{brand.brandName}</h3>
                  <p className="text-sm text-gray-500">Brand ID: {brand._id}</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEditBrand(brand)}
                    className="text-blue-600 hover:text-blue-400"
                  >
                    <Pencil size={20} />
                  </button>

                  <button
                    onClick={() => handleDeleteBrand(brand._id)}
                    className="text-red-600 hover:text-red-400"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sheet for Add/Edit Brand */}
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="h-full  overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{currentEditedId ? "Edit Brand" : "Add New Brand"}</SheetTitle>
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

          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter brand name" 
              value={newBrandName} 
              onChange={(e) => setNewBrandName(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />

            {subcategories.map((subcategory, index) => (
              <div key={index} className="flex space-x-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter subcategory"
                  value={subcategory}
                  onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => handleRemoveSubcategoryField(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-md"
                >
                  -
                </button>
              </div>
            ))}

            <button
              onClick={handleAddSubcategoryField}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md"
            >
              + Add Subcategory
            </button>
            <br/>

            <Button
              onClick={handleSubmit} 
              className="mt-4 bg-blue-500 text-white"
            >
              {currentEditedId ? "Update Brand" : "Submit"} 
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminBrands;
