import './globals.scss';

export const metadata = {
  title: 'Поликлиника',
  description: 'Поликлиника',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
