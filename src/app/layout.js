import './globals.scss';
import AiBolit from '../components/AiBolit/AiBolit';
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
        <AiBolit />
        <CallPopup />
      </body>
    </html>
  );
}
