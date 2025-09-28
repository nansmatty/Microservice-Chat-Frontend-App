'use client';

import ChatSidebar from '@/component/ChatSidebar';
import Loading from '@/component/Loading';
import { useAppData, User } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export interface Message {
	_id: string;
	chatId: string;
	sender: string;
	text?: string;
	image?: {
		url: string;
		publicId: string;
	};
	messageType: 'text' | 'image';
	seen: boolean;
	seenAt?: string;
	createdAt: string;
}

const ChatPage = () => {
	const { loading, isAuth, logoutUser, chats, user: loggedInUser, users, fetchChats, setChats } = useAppData();

	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [message, setMessage] = useState('');
	const [sideBarOpen, setSideBarOpen] = useState(false);
	const [messages, setMessages] = useState<Message[] | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [showAllUser, setShowAllUser] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);

	const router = useRouter();

	useEffect(() => {
		if (!isAuth && !loading) {
			router.push('/login');
		}
	}, [isAuth, router, loading]);

	const handleLogout = () => logoutUser();

	if (loading) return <Loading />;

	return (
		<div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
			<ChatSidebar
				sidebarOpen={sideBarOpen}
				setSideBarOpen={setSideBarOpen}
				showAllUsers={showAllUser}
				setShowAllUsers={setShowAllUser}
				users={users}
				loggedInUser={loggedInUser}
				handleLogout={handleLogout}
				chats={chats}
				selectedUser={selectedUser}
				setSeletedUser={setSelectedUser}
			/>
		</div>
	);
};

export default ChatPage;
