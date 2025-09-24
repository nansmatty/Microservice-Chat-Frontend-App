import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Chat App',
	description: 'Microservice chat app',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body>{children}</body>
		</html>
	);
}
