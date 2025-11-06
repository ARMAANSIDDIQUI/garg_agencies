import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

function BulkEditProductTile({
  product,
  onProductChange,
}) {
  return (
    <Card className="w-full mx-auto flex flex-col md:flex-row">
      {/* Left Section: Uneditable Details */}
      <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-gray-200">
        <div className="flex flex-col items-center mb-4">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-16 h-16 object-contain rounded-md mb-2"
          />
          <h3 className="text-lg font-bold text-center">{product?.title}</h3>
        </div>
        <div className="mb-2">
          <Label className="font-semibold">MRP:</Label>
          <p>₹{product?.price}</p>
        </div>
        <div className="mb-2">
          <Label className="font-semibold">Description:</Label>
          <p className="text-sm text-gray-600 line-clamp-3">{product?.description}</p>
        </div>
      </div>

      {/* Right Section: Editable Fields */}
      <div className="w-full md:w-1/2 p-4">
        <div className="mb-4">
          <Label htmlFor={`title-${product._id}`}>Title</Label>
          <Input
            id={`title-${product._id}`}
            value={product?.title}
            onChange={(e) => onProductChange(product._id, "title", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor={`description-${product._id}`}>Description</Label>
          <Textarea
            id={`description-${product._id}`}
            value={product?.description}
            onChange={(e) => onProductChange(product._id, "description", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor={`price-${product._id}`}>Price</Label>
          <Input
            id={`price-${product._id}`}
            type="number"
            value={product?.price}
            onChange={(e) => onProductChange(product._id, "price", parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor={`salePrice-${product._id}`}>Sale Price</Label>
          <Input
            id={`salePrice-${product._id}`}
            type="number"
            value={product?.salePrice}
            onChange={(e) => onProductChange(product._id, "salePrice", parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>
    </Card>
  );
}

export default BulkEditProductTile;