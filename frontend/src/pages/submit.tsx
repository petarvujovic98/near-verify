import type { NextPage } from "next";
import { useRouter } from "next/router";
import Form from "../components/form";
import { useWalletSelector } from "../context/WalletSelectorContext";

type QueryParams = {
  source: string;
};

const Submit: NextPage = () => {
  const { query } = useRouter();
  const { source } = query as QueryParams;
  const { accountId, modal } = useWalletSelector();

  if (!accountId) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center">
        <button
          onClick={() => modal.show()}
          type="submit"
          className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
        >
          Sign in
        </button>
        <p>
          In order to submit verifications you need to sign in using your NEAR
          account
        </p>
      </div>
    );
  }

  return <Form defautValue={source} />;
};

export default Submit;
