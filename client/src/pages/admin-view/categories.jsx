import React, { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCategories, deleteCategoryById, addCategory, editCategory } from '@/store/admin/category-slice'; // Adjust path based on your structure
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Adjust path
import { Button } from '@/components/ui/button'; // Adjust path
import ProductImageUpload from "@/components/admin-view/image-upload"; // Adjust path

function AdminCategory() {
  const dispatch = useDispatch();
  const { categoriesList, isLoading } = useSelector((state) => state.category);
  
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null); // For identifying the category being edited
  const [newCategoryName, setNewCategoryName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageLoadingState, setImageLoadingState] = useState(false);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category? All products under this category will also be deleted.")) {
      dispatch(deleteCategoryById(categoryId));
    }
  };

  const handleEditCategory = (category) => {
    setCurrentEditedId(category._id);
    setNewCategoryName(category.categoryName);
    setUploadedImageUrl(category.imageUrl); // Assume category has an imageUrl property
    setSheetOpen(true);
  };

  const handleAddCategory = () => {
    setCurrentEditedId(null);
    setNewCategoryName('');
    setImageFile(null);
    setUploadedImageUrl('');
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    const categoryData = {
      categoryName: newCategoryName,
      imageUrl: uploadedImageUrl, // Assuming you handle image upload separately
    };

    if (currentEditedId) {
      // Editing an existing category
      dispatch(editCategory({ id: currentEditedId, ...categoryData }));
    } else {
      // Adding a new category
      dispatch(addCategory(categoryData));
    }
    setSheetOpen(false); // Close the sheet after submission
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Categories</h1>
        <button 
          onClick={handleAddCategory} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
        >
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading categories...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {categoriesList.map((category) => (
              <li key={category._id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{category.categoryName}</h3>
                  <p className="text-sm text-gray-500">Category ID: {category._id}</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-400"
                  >
                    <Pencil size={20} />
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(category._id)}
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

      {/* Sheet for Add/Edit Category */}
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{currentEditedId ? "Edit Category" : "Add New Category"}</SheetTitle>
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
              placeholder="Enter category name" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <Button
              onClick={handleSubmit} 
              className="mt-4 bg-blue-500 text-white"
            >
              {currentEditedId ? "Update Category" : "Submit"} 
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminCategory;
