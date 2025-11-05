import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config"; // Make sure this allows for dynamic options
import { registerUser } from "@/store/auth-slice";
import { getAllBeats } from "@/store/admin/beats-slice"; // Import the thunk to fetch beats
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  userAddress: "",
  phoneNo: "",
  beatName: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetching the beats from the Redux store
  const beatsList = useSelector((state) => state.beats.beatsList);

 

  useEffect(() => {
    dispatch(getAllBeats()); // Fetch beats when component mounts
  }, [dispatch]);

  function onSubmit(event) {
    event.preventDefault();
    const validatePhoneNumber = (phoneNo) => {
      const phoneRegex = /^[0-9]{10}$/;
      return phoneRegex.test(phoneNo);
    };

    if (!validatePhoneNumber(formData.phoneNo)) {
      toast({
        title: "Invalid phone number. It must be 10 digits without country code.",
        variant: "destructive",
      });
      return; // Prevent form submission
    }
     // Check if beatName is selected
     if (!formData.beatName) {
      toast({
        title: "Please select a Area.",
        variant: "destructive",
      });
      return; // Prevent form submission
    }

    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  

  // Update the registerFormControls to include the beats
  const updatedRegisterFormControls = registerFormControls.map((control) => {
    if (control.name === "beatName") {
      return {
        ...control,
        options: beatsList.map((beat) => ({
          id: beat.beatName, 
          label: beat.beatName,
        })),
      };
    }
    return control;
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new Shop Account
        </h1>
        <p className="mt-2">
          Already have a Shop Account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={updatedRegisterFormControls} // Use updated controls with beat options
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthRegister;
