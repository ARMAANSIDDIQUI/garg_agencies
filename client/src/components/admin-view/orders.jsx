import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersForAdmin, getOrderDetailsForAdmin, resetOrderDetails } from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import Loader from "../Loader"; // Import your Loader component
import DatePicker from "react-datepicker"; // Import the date picker
import "react-datepicker/dist/react-datepicker.css"; // Import date picker styles

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    setIsLoading(true); // Start loading
    dispatch(getOrderDetailsForAdmin(getId)).finally(() => {
      setIsLoading(false); // End loading after fetch
    });
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Filter orders by selected date
  const filteredOrders = selectedDate
    ? orderList.filter((orderItem) =>
        new Date(orderItem.createdAt).toDateString() === selectedDate.toDateString()
      )
    : orderList;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Date Picker */}
        <div className="mb-4">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select a date"
            className="border p-2 rounded"
          />
          <Button onClick={() => setSelectedDate(null)} className="ml-2">
            Clear Date
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Order Price</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders && filteredOrders.length > 0
                ? filteredOrders.map((orderItem) => (
                    <TableRow key={orderItem?._id}>
                      <TableCell>{orderItem?._id}</TableCell>
                      <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                      <TableCell>
                        <Badge
                          className={`py-1 px-3 ${
                            orderItem?.orderStatus === "confirmed"
                              ? "bg-green-500"
                              : orderItem?.orderStatus === "rejected"
                              ? "bg-red-600"
                              : "bg-black"
                          }`}
                        >
                          {orderItem?.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{orderItem?.totalAmount}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                        >
                          View Details
                        </Button>
                        <Dialog
                          open={openDetailsDialog}
                          onOpenChange={() => {
                            setOpenDetailsDialog(false);
                            dispatch(resetOrderDetails());
                          }}
                        >
                          {isLoading && ( // Show Loader while loading
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                              <Loader /> {/* Show your Loader component */}
                            </div>
                          )}
                          {!isLoading && <AdminOrderDetailsView orderDetails={orderDetails} />}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                : <TableRow><TableCell colSpan={5}>No orders found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Grid */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredOrders && filteredOrders.length > 0
            ? filteredOrders.map((orderItem) => (
                <div key={orderItem?._id} className="bg-white p-4 rounded shadow-md">
                  <h3 className="text-lg font-bold">Order ID: {orderItem?._id}</h3>
                  <p>Order Date: {orderItem?.orderDate.split("T")[0]}</p>
                  <p>
                    <Badge
                      className={`py-1 px-3 ${
                        orderItem?.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem?.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-black"
                      }`}
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </p>
                  <p>Price: ₹{orderItem?.totalAmount}</p>
                  <Button onClick={() => handleFetchOrderDetails(orderItem?._id)}>
                    View Details
                  </Button>
                  <Dialog
                    open={openDetailsDialog}
                    onOpenChange={() => {
                      setOpenDetailsDialog(false);
                      dispatch(resetOrderDetails());
                    }}
                  >
                    {isLoading && ( // Show Loader while loading
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                        <Loader /> {/* Show your Loader component */}
                      </div>
                    )}
                    {!isLoading && <AdminOrderDetailsView orderDetails={orderDetails} />}
                  </Dialog>
                </div>
              ))
            : <p>No orders found.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
