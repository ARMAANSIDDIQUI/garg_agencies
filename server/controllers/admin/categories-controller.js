const Category = require("../../models/Category");

// Add a new category
const addCategory = async (req, res) => {
  const { categoryName, imageUrl } = req.body; // Extract category data from the body
  try {
    // Check if the category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists with the same CategoryName!",
      });
    }

    // Create a new category
    const newCategory = new Category({
      categoryName,
      imageUrl,
    });

    // Save the new category
    await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Category added successfully.",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding a new category.",
    });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch all categories
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully.",
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching categories.",
    });
  }
};

// Edit/Update a category by ID
const editCategory = async (req, res) => {
  const { categoryId } = req.params; // Extract category ID from URL params
  const { categoryName, imageUrl } = req.body; // Extract updated category details
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { categoryName, imageUrl },
      { new: true, runValidators: true } // Return the updated category
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the category.",
    });
  }
};

// Delete a category by ID
const deleteCategory = async (req, res) => {
  const { categoryId } = req.params; // Extract category ID from URL params
  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the category.",
    });
  }
};

module.exports = {
  addCategory,
  getCategories,
  editCategory,
  deleteCategory,
};

module.exports ={
    addCategory,
    getCategories,
    editCategory,
    deleteCategory
}