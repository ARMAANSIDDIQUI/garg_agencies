import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  // Function to open Google Maps in a new tab with latitude and longitude
  const handleOpenMap = () => {
    const { latitude, longitude } = orderDetails?.location || {};
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, "_blank");
    } else {
      toast({
        title: "Location information is missing",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Placed By</p>
            {orderDetails?.salesmanId !== null ? (
              <p className="font-medium">Salesman</p>
            ) : (
              <p className="font-medium">Shop</p>
            )}
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${orderDetails?.orderStatus === "delivered"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                      ? "bg-red-600"
                      : "bg-black"
                  }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>

        <Separator />

        <div className="mt-4">
  <div className="font-medium text-lg mb-2">Order Details</div>
  <table className="table-auto w-full border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-300 px-4 py-2">S.No</th>
        <th className="border border-gray-300 px-4 py-2">Image</th>
        <th className="border border-gray-300 px-4 py-2">Title</th>
        <th className="border border-gray-300 px-4 py-2">Quantity</th>
        <th className="border border-gray-300 px-4 py-2">Price (₹)</th>
        <th className="border border-gray-300 px-4 py-2">Total Price (₹)</th>
      </tr>
    </thead>
    <tbody>
      {orderDetails?.cartItems && orderDetails.cartItems.length > 0 ? (
        orderDetails.cartItems.map((item, index) => (
          <tr key={item.id} className="text-center">
            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
            <td className="border border-gray-300 px-4 py-2">
              <img
                src={item.image}
                alt={item.title}
                style={{ width: "50px", height: "50px" }}
                className="mx-auto"
              />
            </td>
            <td className="border border-gray-300 px-4 py-2">{item.title}</td>
            <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
            <td className="border border-gray-300 px-4 py-2">₹{item.price}</td>
            <td className="border border-gray-300 px-4 py-2">
              ₹{item.price * item.quantity}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" className="border border-gray-300 px-4 py-2 text-center">
            No items found
          </td>
        </tr>
      )}
    </tbody>
  </table>

  <div className="flex mt-4 items-center justify-between">
    <p className="font-medium">Order Status:</p>
    <Badge
      className={`py-1 px-3 ${
        orderDetails?.orderStatus === "delivered"
          ? "bg-green-500"
          : orderDetails?.orderStatus === "rejected"
          ? "bg-red-600"
          : "bg-black"
      } text-white`}
    >
      {orderDetails?.orderStatus}
    </Badge>
  </div>
</div>


        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>Shop Name: {orderDetails?.addressInfo?.shopName}</span>
              <span>Shop Address: {orderDetails?.addressInfo?.address}</span>
              <span>Shop Phone No: {orderDetails?.addressInfo?.phone}</span>
              <h3>Note: {orderDetails?.notes}</h3>
            </div>

            {/* Display Latitude and Longitude if available */}
            {orderDetails?.location?.latitude && orderDetails?.location?.longitude ? (
              <div className="mt-4">
                <p className="font-medium">Location</p>
                <div>
                  Latitude: {orderDetails?.location?.latitude} <br />
                  Longitude: {orderDetails?.location?.longitude}
                </div>

                {/* Button to open Google Maps */}
                <button
                  className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={handleOpenMap}
                >
                  Open in Google Maps
                </button>
              </div>
            ) : (
              <div className="text-red-500 mt-2">Location data not available</div>
            )}
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
