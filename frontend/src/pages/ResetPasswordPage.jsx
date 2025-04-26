import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "../store/useUserStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState("");
  const { resetPassword, isLoading } = useUserStore();

  const { token } = useParams();
  const navigate = useNavigate();

  const getStrength = (password) => {
    let newStrength = 0;
    if (password.length >= 6) newStrength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) newStrength++;
    if (password.match(/\d/)) newStrength++;
    if (password.match(/[^a-zA-Z\d]/)) newStrength++;
    setStrength(newStrength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match", { id: "passwordMismatch" });
        return;
      }
      await resetPassword(token, password);
      navigate("/login");
    } catch (error) {
      
    }
  };

  return (
    <div className="flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800  rounded-2xl shadow-2xl p-3 w-full sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Reset Password
          </h2>
          <form onSubmit={handleSubmit}>
            <Input
              icon={Lock}
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                getStrength(e.target.value);
              }}
              required
            />

            <Input
              icon={Lock}
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <PasswordStrengthMeter strength={strength} password={password} />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 text-white font-bold rounded-lg shadow-lg  focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50"
              type="submit"
              disabled={isLoading || strength < 4}
            >
              {isLoading ? "Resetting..." : "Set New Password"}
            </motion.button>
          </form>
          <div className="px-6 py-4  bg-opacity-50 flex justify-center">
            <p className="text-sm text-gray-400">
              Didn’t get the password reset link or it expired?{" "}
              <Link
                to="/forgot-password"
                disabled={isLoading}
                className="text-sm text-emerald-400 hover:underline"
              >
                Forgot Password
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default ResetPasswordPage;
