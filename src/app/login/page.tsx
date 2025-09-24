'use client';

import { ArrowRight, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
	const [email, setEmail] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
		e.preventDefault();
		setLoading(true);

		try {
			const { data } = await axios.post(`http://localhost:5000/api/v1/user/login`, { email });
			alert(data.message);
			router.push(`/verify?email=${email}`);
		} catch (error: any) {
			alert(error.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
			<div className='max-w-md w-full'>
				<div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
					<div className='text-center mb-8'>
						<div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
							<Mail size={40} className='text-white' />
						</div>
						<h1 className='text-4xl font-bold text-white mb-3'>Welcome the ChatApp</h1>
						<p className='text-gray-300 text-lg'>Enter your email to continue your journey</p>
					</div>
					<form className='space-y-6' onSubmit={handleSubmit}>
						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>
								Email Address
							</label>
							<input
								type='email'
								id='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className='w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400'
								placeholder='Enter your email address'
								required
							/>
						</div>
						<button
							type='submit'
							className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
							<div className='flex items-center justify-center gap-2'>
								<span>Send Verfication Code</span>
								<ArrowRight className='w-5 h-5' />
							</div>
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
