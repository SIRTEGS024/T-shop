import { motion } from "framer-motion";
import { useState } from "react";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useUserStore();

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800  rounded-2xl shadow-2xl p-8 w-full sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Forgot Password
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-300 mb-6 text-center">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900 text-white font-bold rounded-lg shadow-lg  transition duration-200"
              type="submit"
            >
              {isLoading ? (
                <Loader className="size-6 animate-spin mx-auto" />
              ) : (
                "Send Reset Link"
              )}
            </motion.button>
          </form>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <p className="text-gray-300 mb-6">
              If an account exists for {email}, you will receive a password
              reset link shortly in your email.
            </p>
          </div>
        )}
        <div className="px-8 py-4 bg-opacity-50 flex justify-center">
          <Link
            to={"/login"}
            className="text-sm text-emerald-400 hover:underline flex items-center"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2"  /> Back to Login
          </Link>
        </div>
        <div className="px-8 py-4 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray-400">
            Didn’t get password reset link or it expired?{" "}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`text-emerald-400 underline disabled:opacity-50 bg-transparent border-none p-0`}
            >
              Resend
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPasswordPage;
