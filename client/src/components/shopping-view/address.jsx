import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";

const initialAddressFormData = {
  address: "",
  phone: "",
  email: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  function handleManageAddress(event) {
    event.preventDefault();
    const validatePhoneNumber = (phoneNo) => {
      const phoneRegex = /^[0-9]{10}$/;
      return phoneRegex.test(phoneNo);
    };
    console.log(formData)

    if (!validatePhoneNumber(formData.phone)) {
      toast({
        title: "Invalid phone number. It must be 10 digits without country code.",
        variant: "destructive",
      });
      return; // Prevent form submission
    }

    if (addressList.length >= 10 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 10 addresses",
        variant: "destructive",
      });

      return;
    }

    currentEditedId !== null
      ? dispatch(
          editaAddress({
            userId: user?.id,
            addressId: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setCurrentEditedId(null);
            setFormData(initialAddressFormData);
            toast({
              title: "Address updated successfully",
            });
          }
        })
      : dispatch(
          addNewAddress({
            ...formData,
            userId: user?.id,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setFormData(initialAddressFormData);
            toast({
              title: "Address added successfully",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({
          title: "Address deleted successfully",
        });
      }
    });
  }

  function handleEditAddress(getCurrentAddress) {
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      ...formData,
      address: getCurrentAddress?.address || "",
      phone: getCurrentAddress?.phone || null,
      email: getCurrentAddress?.email || "",
    });
  }
  
  function isFormValid() {
    return Object.keys(formData)
      .map((key) => {
        const value = formData[key];
        // Check if the value is valid based on its type
        if (typeof value === "string") {
          return value !== ""; // Ensure the string is not empty
        } else if (typeof value === "number") {
          return !isNaN(value); // Ensure the number is valid
        } else if (key === "email") {
          return value === "" || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        }
        return false; // Invalid if not string or number
      })
      .every((item) => item); // All fields must be valid
  }
  useEffect(() => {
    dispatch(fetchAllAddresses(user?.id));
  }, [dispatch]);

  

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2  gap-2">
        {addressList && addressList.length > 0
          ? addressList.map((singleAddressItem) => (
              <AddressCard
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))
          : null}
      </div>
      <CardHeader>
        <CardTitle>
          {currentEditedId !== null ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? "Edit" : "Add"}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
}

export default Address;
