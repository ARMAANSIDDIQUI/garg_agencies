import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '@/store/salesman/index';
import { getAllBeats } from '@/store/admin/beats-slice'; // Fetch beats from Redux store
import { useNavigate } from 'react-router-dom';
import { logoutUser } from "@/store/auth-slice";

const Shop = () => {
    const dispatch = useDispatch();
    const { users: userResponse, isLoading, error } = useSelector((state) => state.salesman);
    const beatsList = useSelector((state) => state.beats.beatsList); // Assuming you have beats in Redux store
    
    
    const [filter, setFilter] = useState('');
    const [selectedBeats, setSelectedBeats] = useState([]);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const salesmanId = user?.id;

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(getAllBeats()); // Fetch beats when component mounts
    }, [dispatch]);

    function handleLogout() {
        // Step 1: Remove salesmanId from local storage
        localStorage.removeItem("salesmanId");
      
        // Step 2: Dispatch the logout action
        dispatch(logoutUser()).then(() => {
          // Step 3: Reload the page after logout is complete
          window.location.reload();
        });
      }

    const handleImpersonate = async (userId) => {
       
      
        try {
          // Send the API request to impersonate the user
          const response = await fetch(`/api/salesman/impersonate/${userId}/${salesmanId}`, {
            method: 'POST',
            credentials: 'include', // This allows sending and receiving cookies in the request
          });
      
          const result = await response.json();
          if (result.success) {
            

            // Store salesmanId in local storage
            localStorage.setItem('salesmanId', result.salesmanId);
      
            // After impersonation, navigate to the desired page
            window.location.href='/shop/home';
          } else {
            console.error('Impersonation failed:', result.message);
          }
        } catch (error) {
          console.error('Error during impersonation:', error);
        }
      };

    // Check if userResponse is an object and has users array
    const users = userResponse?.success ? userResponse.users : [];
    const beats = beatsList // Get beats from Redux store

    // Filter users based on selected beats and search filter
    const filteredUsers = users.filter(user => {
        const matchesFilter = user.userAddress.toLowerCase().includes(filter.toLowerCase()) ||
            user.userName.toLowerCase().includes(filter.toLowerCase()) ||
            user.phoneNo.toString().includes(filter);

        const matchesBeats = selectedBeats.length === 0 || selectedBeats.includes(user.beatName); // Check if user beatName is in selected beats

        return matchesFilter && matchesBeats;
    });

    const handleBeatChange = (beat) => {
        setSelectedBeats(prev =>
            prev.includes(beat) ? prev.filter(b => b !== beat) : [...prev, beat]
        );
    };

    return (
        <div className="container mx-auto p-5">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-3xl font-bold text-blue-600">Shops</h1>
                <div className="space-x-2">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200"
                        onClick={() => navigate("/salesman/create-shop")}
                    >
                        Add Shop
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <input
                type="text"
                placeholder="Search by address, name, or phone..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full max-w-md p-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
            />

            {/* Beats Filter Section */}
            <div className="mb-5 ">
                <h2 className="text-lg font-bold">Filter by Beats:</h2>
                {beats.map((beat) => (
                    <div key={beat._id} className="flex items-center mb-2 "> {/* Added flex and margin bottom */}
                    <label className="text-sm font-medium "> {/* Increased font size and made it bold */}
                        <input
                            type="checkbox"
                            checked={selectedBeats.includes(beat.beatName)}
                            onChange={() => handleBeatChange(beat.beatName)}
                            className="mr-2 w-4 h-4" // Added margin right for spacing
                        />
                        {beat.beatName}
                    </label>
                </div>
                
                ))}
            </div>

            

            {isLoading && <p className="text-center">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div
                        key={user._id}
                        className="bg-white shadow-lg rounded-lg p-4 transform transition duration-200 hover:scale-105 cursor-pointer"
                        onClick={() => handleImpersonate(user._id)}
                    >
                        <h2 className="text-xl font-semibold text-gray-800">{user.userName}</h2>
                        <p className="text-gray-600">Address: {user.userAddress}</p>
                        <p className="text-gray-600">Phone: {user.phoneNo}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
