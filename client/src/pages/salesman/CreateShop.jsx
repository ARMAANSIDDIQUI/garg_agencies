import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Assuming you're using Redux
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom'; // For navigation
import { registerUser } from "@/store/auth-slice";
import { getAllBeats } from "@/store/admin/beats-slice";

const CreateShop = () => {
    const [userName, setUserName] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [beatName, setBeatname] = useState('');
    const [password] = useState('ShashwatShop@1');
    const dispatch = useDispatch(); // Redux dispatch
    const navigate = useNavigate(); // Hook for navigation
    const { toast } = useToast();

    // Fetching the beats from the Redux store
  const beatsList = useSelector((state) => state.beats.beatsList);



    useEffect(() => {
        dispatch(getAllBeats()); // Fetch beats when component mounts
      }, [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = {
            userName,
            userAddress,
            phoneNo,
            beatName,
            password,
        };

        const validatePhoneNumber = (phoneNo) => {
            const phoneRegex = /^[0-9]{10}$/;
            return phoneRegex.test(phoneNo);
        };

        if (!validatePhoneNumber(phoneNo)) {
            toast({
                title: "Invalid phone number. It must be 10 digits without country code.",
                variant: "destructive",
              });
            return; // Prevent form submission
        }

        dispatch(registerUser(formData)).then((data) => {
            if (data?.payload?.success) {
                toast({
                    title: data?.payload?.message,
                  });
                navigate("/salesman/shops");
            } else {
                toast({
                    title: data?.payload?.message,
                    variant: "destructive",
                  });
            }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form 
                onSubmit={handleSubmit} 
                className="bg-white shadow-md rounded-lg p-8 w-full max-w-md transition-transform duration-200 transform hover:scale-105"
            >
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Add Shop</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="userName">Shop Name</label>
                    <input 
                        type="text" 
                        id="userName" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        required 
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" 
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="userAddress">Shop Address </label>
                    <input 
                        type="text" 
                        id="userAddress" 
                        value={userAddress} 
                        onChange={(e) => setUserAddress(e.target.value)} 
                        required 
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" 
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phoneNo">Phone No</label>
                    <input 
                        type="tel" 
                        id="phoneNo" 
                        value={phoneNo} 
                        onChange={(e) => setPhoneNo(e.target.value)} 
                        required 
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="beatId">Select Beat</label>
                    <select 
                        id="beatId" 
                        value={beatName} 
                        onChange={(e) => setBeatname(e.target.value)} 
                        required 
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    >
                        <option value="">Select a beat</option>
                        {beatsList.map((beat) => (
                            <option key={beat._id} value={beat.beatName}>
                                {beat.beatName} {/* Assuming beat has a 'name' field */}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4 hidden">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        readOnly 
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 bg-gray-200" 
                    />
                </div>

                <button 
                    type="submit" 
                    className="bg-blue-600 text-white font-semibold py-2 rounded-lg w-full hover:bg-blue-700 transition duration-200"
                >
                    Create Shop
                </button>
            </form>
        </div>
    );
};

export default CreateShop;
