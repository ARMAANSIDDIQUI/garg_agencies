import { Fragment, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { getAllBrands } from "@/store/admin/brands-slice";
import { getAllCategories } from "@/store/admin/category-slice";
import { ChevronRight } from "lucide-react"; // Import ChevronRight icon

function ProductFilter({ filters, handleFilter }) {
  const dispatch = useDispatch();

  // State to manage expanded sections for brands, categories, and subcategories
  const [expandedSections, setExpandedSections] = useState({
    brand: false,
    category: false,
    subcategory: false, // Add subcategory section
  });

  // State to manage selected brands and their subcategories
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Fetch brands and categories from Redux store
  const { brandsList } = useSelector((state) => state.brands);
  const { categoriesList } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getAllBrands()); // Fetch brands when component mounts
    dispatch(getAllCategories()); // Fetch categories when component mounts
  }, [dispatch]);

  // Prepare filter options by combining dynamic brands and categories
  const filterOptions = {
    brand: brandsList.map((brand) => ({
      id: brand.brandName,
      label: brand.brandName,
      subcategories: brand.subcategories || [], // Ensure subcategories array exists
    })),
    category: categoriesList.map((category) => ({
      id: category.categoryName,
      label: category.categoryName,
    })),
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section], // Toggle the selected section
    }));
  };

  // Handle brand selection
  const handleBrandChange = (brand) => {
    let updatedBrands = [...selectedBrands];

    if (updatedBrands.some((item) => item.id === brand.id)) {
      updatedBrands = updatedBrands.filter((item) => item.id !== brand.id);
      // Remove subcategories of the deselected brand
      setSubcategories((prevSubcategories) =>
        prevSubcategories.filter((subcat) => !brand.subcategories.includes(subcat))
      );
    } else {
      updatedBrands.push(brand);
      // Add subcategories of the newly selected brand
      setSubcategories((prevSubcategories) => [
        ...prevSubcategories,
        ...brand.subcategories,
      ]);
    }

    setSelectedBrands(updatedBrands);
    handleFilter("brand", brand.id); // Update filter for the brand
  };
  

  // Handle category selection separately
  const handleCategoryChange = (category) => {
    handleFilter("category", category.id); // Directly update filter for the category
  };

  const handleSubcategoryChange = (subcategory) => {
    handleFilter("subcategory", subcategory); // Call handleFilter with the subcategory
  };

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3
                className="text-base font-bold flex items-center cursor-pointer"
                onClick={() => toggleSection(keyItem)} // Toggle on click
              >
                <ChevronRight
                  className={`transition-transform duration-300 ${
                    expandedSections[keyItem] ? "rotate-90" : ""
                  }`}
                /> {/* Rotate icon when expanded */}
                {keyItem.charAt(0).toUpperCase() + keyItem.slice(1)}
              </h3>
              {expandedSections[keyItem] && ( // Conditionally show filter options
                <div className="grid gap-2 mt-2">
                  {filterOptions[keyItem].map((option) => (
                    <Label
                      key={option.id}
                      className="flex font-medium items-center gap-2"
                    >
                      <Checkbox
                        checked={
                          keyItem === "brand"
                            ? selectedBrands.some((item) => item.id === option.id)
                            : filters?.category?.includes(option.id) || false
                        } // Properly check if the brand or category is selected
                        onCheckedChange={() =>
                          keyItem === "brand"
                            ? handleBrandChange(option) // Handle brand select/deselect
                            : handleCategoryChange(option) // Handle category select/deselect
                        }
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
              )}
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>

      {/* Subcategories Section */}
      {subcategories.length > 0 && (
        <div className="p-4 space-y-4">
          <h3
            className="text-base font-bold flex items-center cursor-pointer"
            onClick={() => toggleSection("subcategory")} // Toggle subcategory section
          >
            <ChevronRight
              className={`transition-transform duration-300 ${
                expandedSections.subcategory ? "rotate-90" : ""
              }`}
            /> {/* Rotate icon when expanded */}
            Subcategories
          </h3>
          {expandedSections.subcategory && ( // Conditionally show subcategories
            <div className="grid gap-2 mt-2">
              {subcategories.map((subcat, index) => (
                <Label key={index} className="flex font-medium items-center gap-2">
                  <Checkbox
                    checked={filters?.subcategory?.includes(subcat) || false} // Ensure subcategory is checked if selected
                    onCheckedChange={() => handleSubcategoryChange(subcat)} // Handle subcategory select/deselect
                  />
                  {subcat}
                </Label>
              ))}
            </div>
          )}
          <Separator />
        </div>
      )}
    </div>
  );
}

export default ProductFilter;
