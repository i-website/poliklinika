import './globals.scss';
import CallPopup from '../components/CallPopup/CallPopup';

export const metadata = {
  title: 'Поликлиника',
  description: 'Поликлиника',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <CallPopup />
      </body>
    </html>
  );
}
