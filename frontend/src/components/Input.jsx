import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ icon: Icon, type, ...props }) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === "password";

	return (
		<div className='relative mb-6'>
			{/* Left icon */}
			<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
				<Icon className='size-5 text-gray-300' />
			</div>

			{/* Input field */}
			<input
				{...props}
				type={isPassword && showPassword ? "text" : type}
				className='block w-full px-3 py-2 pl-10 pr-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
			/>

			{/* Eye icon toggle (only for password) */}
			{isPassword && (
				<div
					className='absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer'
					onClick={() => setShowPassword((prev) => !prev)}
				>
					{showPassword ? (
						<EyeOff className='size-5 text-gray-300' />
					) : (
						<Eye className='size-5 text-gray-300' />
					)}
				</div>
			)}
		</div>
	);
};

export default Input;
