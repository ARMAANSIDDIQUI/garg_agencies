import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  
  

  // Redirect if user is not authenticated
  if (!isAuthenticated) {
    if (
      !location.pathname.includes("/login") &&
      !location.pathname.includes("/register")&&
      !location.pathname.includes("/forgot")
    ) {
      return <Navigate to="/auth/login" />;
    }
  }

  // Redirect if user is authenticated but on login or register page
  if (isAuthenticated) {
    if (
      location.pathname === "/" || // Base URL should also be redirected
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    ) {
      // Redirect based on user role
      if (user?.role === "admin") {
        return <Navigate to="/admin/dashboard" />;
      } else if (user?.role === "salesman") {
        return <Navigate to="/salesman/shops" />;
      } else {
        return <Navigate to="/shop/home" />;
      }
    }
  }

  // Redirect if authenticated user tries to access admin or salesman areas
  if (isAuthenticated && user?.role !== "admin" && location.pathname.includes("admin")) {
    return <Navigate to="/unauth-page" />;
  }

  if (isAuthenticated && user?.role !== "salesman" && location.pathname.includes("salesman")) {
    return <Navigate to="/unauth-page" />;
  }

  // Allow rendering of children if everything is okay
  return <>{children}</>;
}

export default CheckAuth;
