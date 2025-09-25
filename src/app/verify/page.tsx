'use client';

import Loading from '@/component/Loading';
import VerifyOTP from '@/component/VerifyOTP';
import { Suspense } from 'react';

const VerifyPage = () => {
	return (
		<Suspense fallback={<Loading />}>
			<VerifyOTP />
		</Suspense>
	);
};

export default VerifyPage;
