import CallScreen from '../../components/CallScreen/CallScreen';

// Страница не привязана к навигации и закрыта от поисковиков — открывается только по прямой ссылке
export const metadata = {
  title: 'Вызов пациента',
  robots: { index: false, follow: false },
};

export default function CallPage() {
  return <CallScreen />;
}
