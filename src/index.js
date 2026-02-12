import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const markets = [
  { currency: 'bitcoin', label: 'BTC/USD' },
  { currency: 'ethereum', label: 'ETH/USD' },
  { currency: 'solana', label: 'SOL/USD' },
  { currency: 'dogecoin', label: 'DOGE/USD' },
];

const WALLET_STORAGE_KEY = 'tradesarace_wallet_v1';

function loadSavedWallet() {
  const defaultWallet = {
    usdBalance: 20000,
    btcBalance: 0.35,
    bonus: 185,
  };

  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) return defaultWallet;

    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.usdBalance !== 'number' ||
      typeof parsed?.btcBalance !== 'number' ||
      typeof parsed?.bonus !== 'number'
    ) {
      return defaultWallet;
    }
    return parsed;
  } catch {
    return defaultWallet;
  }
}

function MarketWorkspace() {
  const [activeTab, setActiveTab] = useState(0);
  const [sharedWallet, setSharedWallet] = useState(loadSavedWallet);
  const [sharedPositions, setSharedPositions] = useState([]);

  useEffect(() => {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(sharedWallet));
  }, [sharedWallet]);

  return (
    <Box sx={{ px: { xs: 0.5, sm: 1 }, pt: { xs: 0.5, sm: 1 } }}>
      <Tabs
        value={activeTab}
        onChange={(_, nextValue) => setActiveTab(nextValue)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          minHeight: { xs: 42, sm: 48 },
          '.MuiTabs-flexContainer': { gap: { xs: 0.5, sm: 1 } },
          '.MuiTab-root': {
            fontWeight: 700,
            letterSpacing: '0.04em',
            minHeight: { xs: 42, sm: 48 },
            minWidth: { xs: 90, sm: 120 },
            fontSize: { xs: '0.72rem', sm: '0.84rem' },
            px: { xs: 1, sm: 1.5 },
          },
        }}
      >
        {markets.map((market) => (
          <Tab key={market.currency} label={market.label} />
        ))}
      </Tabs>

      <div
        role="tabpanel"
        id={`market-tabpanel-${activeTab}`}
      >
        <App
          currency={markets[activeTab].currency}
          wallet={sharedWallet}
          setWallet={setSharedWallet}
          positions={sharedPositions}
          setPositions={setSharedPositions}
        />
      </div>
    </Box>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MarketWorkspace />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a functon
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
