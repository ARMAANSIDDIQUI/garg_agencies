import { Fragment, useEffect, useState, useMemo } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

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

  const filterOptions = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0)
      return { brand: [], category: [] };

    const extractBrandName = (p) =>
      p.brand?.brandName ||
      p.brand?.name ||
      p.brandName ||
      (typeof p.brand === "string" ? p.brand : null);

    const extractCategoryName = (p) =>
      p.category?.categoryName ||
      p.category?.name ||
      p.categoryName ||
      (typeof p.category === "string" ? p.category : null);

    const brands = [
      ...new Set(products.map(extractBrandName).filter(Boolean)),
    ].map((b) => ({ id: b, label: b }));

    const categories = [
      ...new Set(products.map(extractCategoryName).filter(Boolean)),
    ].map((c) => ({ id: c, label: c }));

    return { brand: brands, category: categories };
  }, [products]);

  useEffect(() => {
    const brandSubcatMap = {};

    products.forEach((p) => {
      const brandName =
        p.brand?.brandName || p.brand?.name || p.brandName || p.brand;
      if (!brandName) return;

      const subcats =
        p.brand?.subcategories ||
        p.subcategories ||
        (p.subcategory ? [p.subcategory] : []);

      if (!brandSubcatMap[brandName]) brandSubcatMap[brandName] = [];
      brandSubcatMap[brandName].push(...subcats.filter(Boolean));
      brandSubcatMap[brandName] = [...new Set(brandSubcatMap[brandName])];
    });

    setBrandSubcategories(brandSubcatMap);
  }, [products]);

  useEffect(() => {
    let filteredProducts = [...products];

    if (filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        filters.brand.includes(
          p.brand?.brandName || p.brand?.name || p.brandName || p.brand
        )
      );
    }

    if (filters.category.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        filters.category.includes(
          p.category?.categoryName ||
            p.category?.name ||
            p.categoryName ||
            p.category
        )
      );
    }

    if (filters.subcategory.length > 0) {
      filteredProducts = filteredProducts.filter((p) => {
        const subcats =
          p.brand?.subcategories ||
          p.subcategories ||
          (p.subcategory ? [p.subcategory] : []);
        return subcats.some((sc) => filters.subcategory.includes(sc));
      });
    }

    onFiltered?.(filteredProducts);
  }, [filters, products, onFiltered]);

  const handleFilter = (type, value) => {
    setFilters((prevFilters) => {
      const current = prevFilters[type];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prevFilters, [type]: newValues };
    });
  };

  const handleBrandChange = (brand) => {
    setFilters((prevFilters) => {
      const isSelected = prevFilters.brand.includes(brand.id);
      const newBrandFilters = isSelected
        ? prevFilters.brand.filter((b) => b !== brand.id)
        : [...prevFilters.brand, brand.id];

      const updatedSubcategories = newBrandFilters.reduce((acc, b) => {
        if (brandSubcategories[b]) {
          acc.push(...brandSubcategories[b]);
        }
        return acc;
      }, []);
      const uniqueSubcats = [...new Set(updatedSubcategories)];
      setSubcategories(uniqueSubcats);

      const newFilters = { ...prevFilters, brand: newBrandFilters };

      if (isSelected) {
        const deselectedSubcats = brandSubcategories[brand.id] || [];
        newFilters.subcategory = newFilters.subcategory.filter(
          (sc) => !deselectedSubcats.includes(sc)
        );
      }

      return newFilters;
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      brand: [],
      category: [],
      subcategory: [],
    });
    setSubcategories([]);
  };

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Filters</h2>
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
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
                        checked={
                          filters[keyItem]?.includes(option.id) || false
                        }
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
                <Label
                  key={index}
                  className="flex font-medium items-center gap-2"
                >
                  <Checkbox
                    checked={filters.subcategory.includes(subcat)}
                    onCheckedChange={() =>
                      handleFilter("subcategory", subcat)
                    }
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
