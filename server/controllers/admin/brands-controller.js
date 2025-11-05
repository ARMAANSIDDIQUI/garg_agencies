const Brands = require("../../models/Brands");

// Add a new brand
const addBrand = async (req, res) => {
  const { imageUrl, brandName,subcategories } = req.body; // Extract brandName from the body
  try {
    const checkbrand = await Brands.findOne({ brandName });
    if (checkbrand) {
      return res.json({
        success: false,
        message: "Brand already exists with the same name! Please try again.",
      });
    }

    const newbrand = new Brands({
      imageUrl,
      brandName, // Use the string value here
      subcategories,
    });

    await newbrand.save();
    res.status(201).json({
      success: true,
      message: "Brand added successfully.",
      brand: newbrand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding a new brand.",
    });
  }
};

// Get all brands
const getBrands = async (req, res) => {
  try {
    const brands = await Brands.find(); // Fetch all brands
    res.status(200).json({
      success: true,
      message: "Brands retrieved successfully.",
      brands,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching brands.",
    });
  }
};

// Edit/Update a brand by ID
const editBrand = async (req, res) => {
  const { brandId } = req.params; // Extract brandId from URL params
  const { imageUrl, brandName,subcategories } = req.body; // Get updated details from the request body
  try {
    const updatedBrand = await Brands.findByIdAndUpdate(
      brandId,
      { imageUrl, brandName, subcategories },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brand updated successfully.",
      brand: updatedBrand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the brand.",
    });
  }
};

// Delete a brand by ID
const deleteBrand = async (req, res) => {
  const { brandId } = req.params; // Extract brandId from URL params
  try {
    const deletedBrand = await Brands.findByIdAndDelete(brandId);

    if (!deletedBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the brand.",
    });
  }
};

module.exports = {
  addBrand,
  getBrands,
  editBrand,
  deleteBrand,
};
