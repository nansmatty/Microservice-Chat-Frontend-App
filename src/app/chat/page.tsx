'use client';

import ChatSidebar from '@/component/ChatSidebar';
import Loading from '@/component/Loading';
import { chatService, useAppData, User } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '@/component/ChatHeader';
import ChatMessages from '@/component/ChatMessages';

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

	async function fetchChat() {
		const token = Cookies.get('token');
		try {
			const { data } = await axios.get(`${chatService}/chat/${selectedUser}/messages`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setMessages(data.messages);
			setUser(data.user);
			await fetchChats();
		} catch (error) {
			console.log(error);
			toast.error('Failed to load messages.');
		}
	}

	async function createChat(user: User) {
		try {
			const token = Cookies.get('token');
			const { data } = await axios.post(
				`${chatService}/chat/message`,
				{
					// userId: loggedInUser?._id,
					recipientId: user._id,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setSelectedUser(data.chatId);
			setShowAllUser(false);
			await fetchChats();
		} catch (error) {
			toast.error('Failed to start chat');
		}
	}

	useEffect(() => {
		if (selectedUser) {
			fetchChat();
		}
	}, [selectedUser]);

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
				createChat={createChat}
			/>
			<div className='flex flex-1 flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-[1px] border-white/10'>
				<ChatHeader user={user} setSidebarOpen={setSideBarOpen} isTyping={isTyping} />
				<ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser} />
			</div>
		</div>
	);
};

export default ChatPage;
