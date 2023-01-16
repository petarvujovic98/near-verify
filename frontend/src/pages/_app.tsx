import type { AppType } from "next/dist/shared/lib/utils";
import { WalletSelectorContextProvider } from "../context/WalletSelectorContext";

import "../styles/globals.css";
import "@near-wallet-selector/modal-ui/styles.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WalletSelectorContextProvider>
      <div className="h-screen bg-gray-300 dark:bg-gray-700">
        <Component {...pageProps} />
      </div>
    </WalletSelectorContextProvider>
  );
};

export default MyApp;
