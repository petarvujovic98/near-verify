import { type AppType } from "next/dist/shared/lib/utils";
import { WalletSelectorContextProvider } from "../context/WalletSelectorContext";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WalletSelectorContextProvider>
      <Component {...pageProps} />
    </WalletSelectorContextProvider>
  );
};

export default MyApp;
