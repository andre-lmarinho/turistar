import MarketingLayout from './(marketing)/layout';
import MarketingHomePage from './(marketing)/page';

export default function RootMarketingPage() {
  return (
    <MarketingLayout>
      <MarketingHomePage />
    </MarketingLayout>
  );
}
