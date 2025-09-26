'use client';

import Loading from '@/component/Loading';
import { useAppData } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const ChatPage = () => {
	const { loading, isAuth } = useAppData();
	const router = useRouter();

	useEffect(() => {
		if (!isAuth && !loading) {
			router.push('/login');
		}
	}, [isAuth, router, loading]);

	if (loading) return <Loading />;

	return <div>Chat App</div>;
};

export default ChatPage;
