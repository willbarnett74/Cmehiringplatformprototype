import { useLocation } from 'react-router-dom';
import { MarketingPlaceholderPage } from './components/marketing/MarketingPlaceholderPage';
import { ProductPage } from './components/marketing/ProductPage';

export default function App() {
  const location = useLocation();

  if (location.pathname.startsWith('/loop')) {
    return <MarketingPlaceholderPage kind="loop" />;
  }

  if (location.pathname.startsWith('/sample-profile')) {
    return <MarketingPlaceholderPage kind="sampleProfile" />;
  }

  if (location.pathname.startsWith('/talk-to-us')) {
    return <MarketingPlaceholderPage kind="talkToUs" />;
  }

  return <ProductPage />;
}
