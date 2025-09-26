'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export const userService = 'http://localhost:5000/api/v1';
export const chatService = 'http://localhost:5002/api/v1';

export interface User {
	_id: string;
	name: string;
	email: string;
}

export interface Chat {
	_id: string;
	users: string[];
	latestMessage: {
		text: string;
		sender: string;
	};
	createdAt: string;
	updatedAt: string;
	unseenCount?: number;
}

export interface Chats {
	_id: string;
	user: string;
	chat: Chat;
}

interface AppContextType {
	user: User | null;
	loading: boolean;
	isAuth: boolean;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
	children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);

	async function fetchUser() {
		try {
			const token = Cookies.get('token');

			const { data } = await axios.get(`${userService}/user/me`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setUser(data);
			setIsAuth(true);
			setLoading(false);
		} catch (error: any) {
			toast.error(error.response.data.message);
			setLoading(false);
		}
	}

	async function logoutUser() {
		Cookies.remove('token');
		setUser(null);
		setIsAuth(false);
		toast.success('User Logged Out');
	}

	useEffect(() => {
		fetchUser();
	}, []);

	return (
		<AppContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading }}>
			{children}
			<Toaster position='top-right' />
		</AppContext.Provider>
	);
};

export const useAppData = (): AppContextType => {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error('useAppData must be used within AppProvider');
	}

	return context;
};
