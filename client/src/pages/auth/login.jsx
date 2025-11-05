import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const initialState = {
  phoneNo: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const location = useLocation();
  const [phoneNo, setPhoneNo] = useState();
  const [password, setPassword] = useState();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const phoneNo = searchParams.get('phoneNo');
    setPhoneNo(phoneNo);
    const password = searchParams.get('password');
    setPassword(password);
  }, [location]);

  function onSubmit(event) {
    event.preventDefault();
    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      {/* Animation for mobile screens only */}
      <div className="block sm:hidden flex justify-center mb-2">
        <lottie-player 
          src="https://lottie.host/c26e049f-fd6b-4621-829e-596adafdaedc/W2Msx2kjHZ.json" 
          background="transparent"
          speed="1"
          style={{ width: '180px', height: '180px' }} 
          loop 
          autoplay 
          direction="1" 
          mode="normal"
        ></lottie-player>
      </div>
      <div className="w-full max-w-md space-y-6  bg-white rounded-lg shadow-lg p-6 z-10 relative">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to your Shop Account
          </h1>
          <p className="mt-2">
            Don't have a Shop Account?
            <Link className="font-medium ml-2 text-blue-600 hover:underline" to="/auth/register">
              Register
            </Link>
          </p>
          <p className="mt-2 text-orange-600">
            <Link className="font-medium text-blue-600 hover:underline" to="/auth/forgot">
              Forgot Password?
            </Link>
          </p>
        </div>
        <CommonForm
          formControls={loginFormControls}
          buttonText={"Sign In"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          phoneNo={phoneNo}
          password={password}
        />
      </div>
    </div>
  );
}

export default AuthLogin;
