import React, { useCallback, useEffect, useState } from "react";
import { providers, utils } from "near-api-js";
import type {
  AccountView,
  CodeResult,
} from "near-api-js/lib/providers/provider";

import type { Account } from "../interfaces";
import { useWalletSelector } from "../context/WalletSelectorContext";

import { env } from "../env/client.mjs";
import Form from "./form";

const { NEXT_PUBLIC_CONTRACT_ID } = env;

type Submitted = SubmitEvent & {
  target: { elements: { [key: string]: HTMLInputElement } };
};

const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const Content: React.FC = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [entry, setEntry] = useState<string | null>(null);
  const [trust, setTrust] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return null;
    }

    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const result = await provider.query<AccountView>({
      request_type: "view_account",
      finality: "final",
      account_id: accountId,
    });

    return { ...result, account_id: accountId };
  }, [accountId, selector.options]);

  const getTrust = useCallback(
    async (entry_id: string) => {
      const { network } = selector.options;
      const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

      const result = await provider.query<CodeResult>({
        request_type: "call_function",
        account_id: NEXT_PUBLIC_CONTRACT_ID,
        method_name: "get_verification",
        args_base64: Buffer.from(JSON.stringify({ entry_id })).toString(
          "base64"
        ),
        finality: "optimistic",
      });

      return JSON.parse(Buffer.from(result.result).toString());
    },
    [selector]
  );

  useEffect(() => {
    if (!accountId) {
      return setAccount(null);
    }

    setLoading(true);

    getAccount().then((nextAccount) => {
      setAccount(nextAccount);

      setLoading(false);
    });
  }, [accountId, getAccount]);

  const handleSignIn = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  const handleSwitchWallet = () => {
    modal.show();
  };

  const handleSwitchAccount = () => {
    const currentIndex = accounts.findIndex((x) => x.accountId === accountId);
    const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;

    const nextAccountId = accounts[nextIndex]?.accountId!;

    selector.setActiveAccount(nextAccountId);

    alert("Switched account to " + nextAccountId);
  };

  const submitVerification = useCallback(
    async (source: string, trusted: boolean) => {
      const { contract } = selector.store.getState();
      const wallet = await selector.wallet();

      return wallet
        .signAndSendTransaction({
          signerId: accountId!,
          receiverId: contract?.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "submit_verification",
                args: { entry_id: source, trusted },
                gas: BOATLOAD_OF_GAS,
                deposit: "1",
              },
            },
          ],
        })
        .catch((err) => {
          alert("Failed to add message");
          console.log("Failed to add message");

          throw err;
        });
    },
    [selector, accountId]
  );

  const handleSubmit = useCallback(
    async (e: Submitted) => {
      e.preventDefault();

      const { fieldset, source, trusted } = e.target.elements;

      fieldset!.disabled = true;

      try {
        await submitVerification(source!.value, trusted!.checked);
      } catch (error) {
        console.error(error);
      } finally {
        fieldset!.disabled = false;
      }
    },
    [submitVerification]
  );

  const handleSearch = useCallback(
    async (e: Submitted) => {
      e.preventDefault();

      const { fieldset, entry_id } = e.target.elements;

      fieldset!.disabled = true;

      try {
        const trust = await getTrust(entry_id!.value);

        setTrust(trust);
        setEntry(entry_id!.value);
      } catch (error) {
        console.error(error);
      } finally {
        fieldset!.disabled = false;
      }
    },
    [getTrust, setTrust]
  );

  if (loading) {
    return null;
  }

  if (!account) {
    return (
      <div>
        <button onClick={handleSignIn}>Log in</button>
      </div>
    );
  }

  return (
    <>
      <div>
        <button onClick={handleSignOut}>Log out</button>
        <button onClick={handleSwitchWallet}>Switch Wallet</button>
        {accounts.length > 1 && (
          <button onClick={handleSwitchAccount}>Switch Account</button>
        )}
      </div>
      <form onSubmit={(e) => handleSearch(e as unknown as Submitted)}>
        <fieldset>
          <label htmlFor="entry_id">Enter source to check:</label>
          <input
            type="text"
            autoFocus
            autoComplete="off"
            id="entry_id"
            required
          />
          <button type="submit">Check verification</button>
        </fieldset>
      </form>
      <div>
        {entry ? <p>{entry}:</p> : null}
        {trust ? <p>{trust}</p> : null}
      </div>
      <Form onSubmit={(e) => handleSubmit(e as unknown as Submitted)} />
    </>
  );
};

export default Content;
