import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog } from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchSalesmen,
    fetchSalesmenOrders,
} from "@/store/salesman";
import AdminOrderDetailsView from "../../components/admin-view/salesmenOrderDetails";

function SalesmenPage() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const { salesmen, salesmenOrders } = useSelector((state) => state.salesman);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchSalesmen());
  }, [dispatch]);

  function handleFetchOrders(salesmanId) {
    dispatch(fetchSalesmenOrders(salesmanId));
    setSelectedSalesmanId(salesmanId);
    setShowOrders(prev=>!prev);
    setOpenDetailsDialog(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Salesmen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Salesman Name</TableHead>
                <TableHead>Phone No.</TableHead>
                <TableHead>
                  <span className="sr-only">View Orders</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesmen && salesmen.length > 0 ? (
                salesmen.map((salesman) => (
                  <TableRow key={salesman?._id}>
                    <TableCell>{salesman?.userName}</TableCell>
                    <TableCell>{salesman?.phoneNo}</TableCell>
                    <TableCell>
                      {showOrders ? (
                        <Button
                        onClick={() => handleFetchOrders(salesman?._id)}
                      >
                        

                        Hide Orders
                      </Button>
                      ):<Button
                      onClick={() => handleFetchOrders(salesman?._id)}
                    >
                      

                      View Order
                    </Button>}
                      
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No Salesmen Found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog
        open={openDetailsDialog}
        onOpenChange={() => {
          setOpenDetailsDialog(false);
          dispatch(resetOrderDetails());
          setShowOrders(false);
        }}
        className="max-w-lg mx-auto p-4"
      >
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          {showOrders ? (
            <div>
              <AdminOrderDetailsView 
                ordersList={salesmenOrders[selectedSalesmanId] || []}
              />
              <Button
                onClick={() => setShowOrders(false)}
                className="mt-4 hidden"
              >
                Hide Orders
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setShowOrders(true);
                dispatch(fetchSalesmenOrders(selectedSalesmanId)); // Fetch orders again if needed
              }}
              className="mt-4 hidden"
            >
              Show Orders
            </Button>
          )}
        </div>
      </Dialog>
    </Card>
  );
}

export default SalesmenPage;
