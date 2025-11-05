import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [phoneNo, setPhoneNo] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP
    const { toast } = useToast();
    const navigate = useNavigate();

    const requestOtp = async () => {

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/request-otp",
                { phoneNo }
            );
            if (response.data.success) {
                toast({ title: "OTP sent to your phone!", variant: "success" });
                setStep(2);
            } else {
                toast({ title: response.data.message, variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to send OTP", variant: "destructive" });
        }
    };

    const verifyOtp = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/verify-otp",
                { phoneNo, otp, newPassword }
            );
            if (response.data.success) {
                toast({ title: "Password updated successfully!", variant: "success" });
                navigate("/auth/login");
            } else {
                toast({ title: response.data.message, variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to verify OTP", variant: "destructive" });
        }
    };

    const resendOtp = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/request-otp",
                { phoneNo }
            );
            if (response.data.success) {
                toast({ title: "OTP resent to your phone!", variant: "success" });
            } else {
                toast({ title: response.data.message, variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to resend OTP", variant: "destructive" });
        }
    };

    return (
        <div className="mx-auto w-full max-w-md space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Forgot Password
                </h1>
                <p className="mt-2">
                    Remembered your password?{" "}
                    <Link
                        className="font-medium ml-2 text-primary hover:underline"
                        to="/auth/login"
                    >
                        Login
                    </Link>
                </p>
            </div>

            {step === 1 && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); requestOtp(); }}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            pattern="[0-9]{10}"
                            maxLength={10} 
                            required
                            placeholder="Enter your phone number"
                            value={phoneNo}
                            title="Please enter a 10-digit mobile number without country code."
                            onChange={(e) => setPhoneNo(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 text-white bg-primary rounded-md hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    >
                        Send OTP
                    </button>
                </form>
            )}

            {step === 2 && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); verifyOtp(); }}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            OTP
                        </label>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 text-white bg-primary rounded-md hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    >
                        Verify and Change Password
                    </button>
                    <p className="mt-4 text-sm text-center text-gray-600">
                        Didn't receive the OTP?{" "}
                        <button
                            type="button"
                            onClick={resendOtp}
                            className="font-medium text-primary hover:underline"
                        >
                            Resend OTP
                        </button>
                    </p>
                </form>
            )}
        </div>
    );
}

export default ForgotPassword;
