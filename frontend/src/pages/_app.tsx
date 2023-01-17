import type { AppType } from "next/dist/shared/lib/utils";
import { WalletSelectorContextProvider } from "../context/WalletSelectorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../styles/globals.css";
import "@near-wallet-selector/modal-ui/styles.css";
import Header from "../components/header";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WalletSelectorContextProvider>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen bg-gray-300 dark:bg-gray-700">
          <Header />
          <Component {...pageProps} />
        </div>
      </QueryClientProvider>
    </WalletSelectorContextProvider>
  );
};

export default MyApp;
