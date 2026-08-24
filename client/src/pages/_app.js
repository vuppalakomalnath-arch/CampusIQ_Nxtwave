import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <Component {...pageProps} />;
}
