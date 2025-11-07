import { Fragment, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronRight } from "lucide-react";

function BulkProductFilters({ products = [], onFiltered }) {
  const [filters, setFilters] = useState({
    brand: [],
    category: [],
    subcategory: [],
  });
  const [expandedSections, setExpandedSections] = useState({
    brand: false,
    category: false,
    subcategory: false,
  });

  const [brandSubcategories, setBrandSubcategories] = useState({});
  const [subcategories, setSubcategories] = useState([]);

  const filterOptions = {
    brand:
      products && products.length > 0
        ? [...new Set(products.map(p =>
            p.brand?.brandName || p.brand?.name || p.brand
          ).filter(Boolean))].map(b => ({ id: b, label: b }))
        : [],
    category:
      products && products.length > 0
        ? [...new Set(products.map(p =>
            p.category?.categoryName || p.category?.name || p.category
          ).filter(Boolean))].map(c => ({ id: c, label: c }))
        : [],
  };

  useEffect(() => {
    const brandSubcatMap = {};
    products.forEach(p => {
      const brandName = p.brand?.brandName || p.brand?.name || p.brand;
      const subcats = p.brand?.subcategories || p.subcategories || (p.subcategory ? [p.subcategory] : []);
      if (!brandSubcatMap[brandName]) brandSubcatMap[brandName] = [];
      brandSubcatMap[brandName].push(...subcats.filter(Boolean));
      brandSubcatMap[brandName] = [...new Set(brandSubcatMap[brandName])];
    });
    setBrandSubcategories(brandSubcatMap);
  }, [products]);

  useEffect(() => {
    let filteredProducts = [...products];
    if (filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter((p) => filters.brand.includes(p.brand?.brandName || p.brand?.name || p.brand));
    }
    if (filters.category.length > 0) {
      filteredProducts = filteredProducts.filter((p) => filters.category.includes(p.category?.categoryName || p.category?.name || p.category));
    }
    if (filters.subcategory.length > 0) {
      filteredProducts = filteredProducts.filter((p) => {
        const subcats = p.brand?.subcategories || p.subcategories || (p.subcategory ? [p.subcategory] : []);
        return subcats.some(sc => filters.subcategory.includes(sc));
      });
    }
    onFiltered(filteredProducts);
  }, [filters, products, onFiltered]);

  const handleFilter = (type, value) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter((item) => item !== value);
      } else {
        newFilters[type] = [...newFilters[type], value];
      }
      return newFilters;
    });
  };

  const handleBrandChange = (brand) => {
    handleFilter("brand", brand.id);
    
    let updatedSubcategories = [];
    const newBrandFilters = filters.brand.includes(brand.id)
      ? filters.brand.filter(b => b !== brand.id)
      : [...filters.brand, brand.id];

    newBrandFilters.forEach(b => {
        if(brandSubcategories[b]) {
            updatedSubcategories = [...new Set([...updatedSubcategories, ...brandSubcategories[b]])];
        }
    });
    setSubcategories(updatedSubcategories);

    // when a brand is deselected, we need to remove its subcategories from the filter
    if (filters.brand.includes(brand.id)) {
        const brandSubcats = brandSubcategories[brand.id] || [];
        setFilters(prevFilters => ({
            ...prevFilters,
            subcategory: prevFilters.subcategory.filter(sc => !brandSubcats.includes(sc))
        }));
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
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
                onClick={() => toggleSection(keyItem)}
              >
                <ChevronRight
                  className={`transition-transform duration-300 ${
                    expandedSections[keyItem] ? "rotate-90" : ""
                  }`}
                />
                {keyItem.charAt(0).toUpperCase() + keyItem.slice(1)}
              </h3>
              {expandedSections[keyItem] && (
                <div className="grid gap-2 mt-2">
                  {filterOptions[keyItem].map((option) => (
                    <Label
                      key={option.id}
                      className="flex font-medium items-center gap-2"
                    >
                      <Checkbox
                        checked={filters[keyItem]?.includes(option.id) || false}
                        onCheckedChange={() =>
                          keyItem === "brand"
                            ? handleBrandChange(option)
                            : handleFilter(keyItem, option.id)
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

      {subcategories.length > 0 && (
        <div className="p-4 space-y-4">
          <h3
            className="text-base font-bold flex items-center cursor-pointer"
            onClick={() => toggleSection("subcategory")}
          >
            <ChevronRight
              className={`transition-transform duration-300 ${
                expandedSections.subcategory ? "rotate-90" : ""
              }`}
            />
            Subcategories
          </h3>
          {expandedSections.subcategory && (
            <div className="grid gap-2 mt-2">
              {subcategories.map((subcat, index) => (
                <Label key={index} className="flex font-medium items-center gap-2">
                  <Checkbox
                    checked={filters?.subcategory?.includes(subcat) || false}
                    onCheckedChange={() => handleFilter("subcategory", subcat)}
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

export default BulkProductFilters;
