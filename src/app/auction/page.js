import { Suspense } from 'react';
import AuctionScreen from '../../components/AuctionScreen/AuctionScreen';

export const metadata = {
  title: 'Аукцион записей',
};

export default function AuctionPage() {
  return (
    <Suspense>
      <AuctionScreen />
    </Suspense>
  );
}
