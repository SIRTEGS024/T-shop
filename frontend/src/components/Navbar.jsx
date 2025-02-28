import {
  Loader,
  Lock,
  LogIn,
  LogOut,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { useCartStore } from "../store/useCartStore";

const Navbar = () => {
  const { user, logout, loading } = useUserStore();
  const isAdmin = user?.role === "admin" || false;
  const { cart, cartStoreLoading } = useCartStore();
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900/90 bg-opacity-90  shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center flex-wrap">
          <Link
            to="/"
            className="flex text-2xl font-bold text-emerald-400 items-center space-x-2"
          >
            T-Shop
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to={"/"}
              className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
            >
              Home
            </Link>
            {user && (
              <Link
                to={"/cart"}
                className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
                disabled={cartStoreLoading}
              >
                <ShoppingCart
                  className="inline-block mr-1 group-hover:text-emerald-400"
                  size={20}
                />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span
                    className={`absolute -top-2 -left-2 text-white rounded-full px-2 py-0.5 text-xs transition duration-300 ease-in-out ${
                      !cartStoreLoading
                        ? "bg-emerald-500 group-hover:bg-emerald-400"
                        : ""
                    }`}
                  >
                    {cartStoreLoading ? (
                      <Loader className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      cart.length
                    )}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link
                className="flex items-center bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out"
                to={"/secret-dashboard"}
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            {user ? (
              <button
                className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
                onClick={logout}
                disabled={loading}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Log Out</span>
              </button>
            ) : (
              <>
                <Link
                  to={"/signup"}
                  className="flex items-center bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>
                <Link
                  to={"/login"}
                  className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
