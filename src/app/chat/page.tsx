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
import MessageInput from '@/component/MessageInput';
import { SocketData } from '@/context/SocketContext';

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

	const { onlineUsers, socket } = SocketData();

	console.log(onlineUsers);

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
			const { data } = await axios.get(`${chatService}/api/v1/chat/${selectedUser}/messages`, {
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
				`${chatService}/api/v1/chat/message`,
				{
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

	const handleMessageSend = async (e: any, imageFile?: File | null) => {
		e.preventDefault();

		if (!message.trim() && !imageFile) return;

		if (!selectedUser) return;

		//socket work
		if (typingTimeOut) {
			clearTimeout(typingTimeOut);
			setTypingTimeOut(null);
		}

		socket?.emit('stopTyping', {
			chatId: selectedUser,
			userId: loggedInUser?._id,
		});

		const token = Cookies.get('token');

		try {
			const formData = new FormData();
			formData.append('chatId', selectedUser);

			if (message.trim()) {
				formData.append('text', message);
			}

			if (imageFile) {
				formData.append('image', imageFile);
			}

			const { data } = await axios.post(`${chatService}/api/v1/chat/send`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/form-data',
				},
			});

			setMessages((prev) => {
				const currentMessages = prev || [];
				const messageExists = currentMessages.some((msg) => msg._id === data.message._id);

				if (!messageExists) {
					return [...currentMessages, data.message];
				}

				return currentMessages;
			});

			setMessage('');
			const displayText = imageFile ? '📷 image' : message;
		} catch (error: any) {
			toast.error(error.response.data.message);
		}
	};

	const handleTyping = (value: string) => {
		setMessage(value);
		if (!selectedUser || !socket) return;

		// socket setup
		if (value.trim()) {
			socket.emit('typing', {
				chatId: selectedUser,
				userId: loggedInUser?._id,
			});
		}

		if (typingTimeOut) {
			clearTimeout(typingTimeOut);
		}

		const timeout = setTimeout(() => {
			socket.emit('stopTyping', {
				chatId: selectedUser,
				userId: loggedInUser?._id,
			});
		}, 2000);

		setTypingTimeOut(timeout);
	};

	useEffect(() => {
		socket?.on('userTyping', (data) => {
			console.log('received user typing', data);
			if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
				setIsTyping(true);
			}
		});

		socket?.on('userStoppedTyping', (data) => {
			console.log('received user stopped typing', data);
			if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
				setIsTyping(false);
			}
		});

		return () => {
			socket?.off('userTyping');
			socket?.off('userStoppedTyping');
		};
	}, [socket, selectedUser, loggedInUser?._id]);

	useEffect(() => {
		if (selectedUser) {
			fetchChat();
			setIsTyping(false);

			socket?.emit('joinChat', selectedUser);

			return () => {
				socket?.emit('leaveChat', selectedUser);
				setMessages(null);
			};
		}
	}, [selectedUser, socket]);

	useEffect(() => {
		return () => {
			if (typingTimeOut) {
				clearTimeout(typingTimeOut);
			}
		};
	}, [typingTimeOut]);

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
				onlineUsers={onlineUsers}
			/>
			<div className='flex flex-1 flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-[1px] border-white/10'>
				<ChatHeader user={user} setSidebarOpen={setSideBarOpen} isTyping={isTyping} onlineUsers={onlineUsers} />
				<ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser} />
				<MessageInput selectedUser={selectedUser} message={message} setMessage={handleTyping} handleMessageSend={handleMessageSend} />
			</div>
		</div>
	);
};

export default ChatPage;
