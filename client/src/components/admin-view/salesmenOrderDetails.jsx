import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import AdminOrderDetailsView from "./order-details";
import { Dialog } from "../ui/dialog";


function SalesmenOrderDetails({ ordersList }) {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  // Open the dialog and fetch order details
  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId)).then((response) => {
      if (response.meta.requestStatus === 'fulfilled') {  // Checking if the action succeeded
        setOpenDetailsDialog(true);  // Open the dialog once order details are fetched
      }
    });
  }

  return (
    <div className="p-4">
      {ordersList && ordersList.length > 0 ? (
        <div className="overflow-x-auto">
          {/* Container for mobile and desktop views */}
          <div className="hidden md:block">
            {/* Table for Desktop */}
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Order Price</TableHead>
                  <TableHead>Order View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersList.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.orderDate.split("T")[0]}</TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          order.orderStatus === "confirmed"
                            ? "bg-green-500"
                            : order.orderStatus === "rejected"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                      >
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{order.totalAmount}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleFetchOrderDetails(order._id)}>
                        View Details
                      </Button>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Grid for Mobile */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {ordersList.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded shadow-md"> {/* Individual Order Card */}
                <h3 className="text-lg font-bold">Order ID: {order._id}</h3>
                <p>Order Date: {order.orderDate.split("T")[0]}</p>
                <p>
                  <Badge
                    className={`py-1 px-3 ${
                      order.orderStatus === "confirmed"
                        ? "bg-green-500"
                        : order.orderStatus === "rejected"
                        ? "bg-red-600"
                        : "bg-black"
                    }`}
                  >
                    {order.orderStatus}
                  </Badge>
                </p>
                <p>Price: ₹{order.totalAmount}</p>
                <Button onClick={() => handleFetchOrderDetails(order._id)}>
                  View Details
                </Button>
                <Dialog
                  open={openDetailsDialog}
                  onOpenChange={() => {
                    setOpenDetailsDialog(false);
                    dispatch(resetOrderDetails());
                  }}
                >
                  <AdminOrderDetailsView orderDetails={orderDetails} />
                </Dialog>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center">No orders found for this salesman.</p>
      )}
    </div>
  );

}

export default SalesmenOrderDetails;


