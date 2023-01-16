import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useWalletSelector } from "../context/WalletSelectorContext";
import { pinVerification, submitVerification } from "../lib/verify-functions";
import Modal from "./modal";
import { useRouter } from "next/router";

type FormProps = {
  defautValue?: string;
  pin?: boolean;
};

type QueryParams = {
  transactionHashes?: string;
};

const formSchema = z.object({
  source: z.string().min(1),
  trusted: z.boolean(),
});

type Schema = z.infer<typeof formSchema>;

const Form: React.FC<FormProps> = ({ defautValue, pin }) => {
  const router = useRouter();
  const { transactionHashes } = router.query as QueryParams;
  const { handleSubmit, register } = useForm<Schema>({
    defaultValues: { source: defautValue, trusted: false },
    resolver: zodResolver(formSchema),
  });
  const { accountId, selector } = useWalletSelector();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(!!transactionHashes);
  const [content, setContent] = useState(
    "Successfully submitted verification score!"
  );

  useEffect(() => {
    setModalVisible(!!transactionHashes);
  }, [transactionHashes]);

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center">
      <form
        className="flex min-w-[60rem] flex-col items-center justify-center"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(async ({ source, trusted }) => {
          const wallet = await selector.wallet();

          try {
            setLoading(true);
            if (pin) {
              await pinVerification(source, trusted, accountId!, wallet);
            } else {
              await submitVerification(source, trusted, accountId!, wallet);
            }
            setLoading(false);
            setModalVisible(true);
          } catch (error) {
            console.error(error);
            setContent("There was an error submitting a verification score!");
          }
        })}
      >
        <div className="mb-6">
          <div>
            <label
              htmlFor="source"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Source
            </label>
            <input
              type="text"
              id="source"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="near.org"
              {...register("source")}
              required
            />
          </div>
        </div>
        <div className="mb-6 flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="trusted"
              type="checkbox"
              value=""
              className="focus:ring-3 h-4 w-4 rounded border border-gray-300 bg-gray-50 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              {...register("trusted")}
            />
          </div>
          <label
            htmlFor="trusted"
            className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Trusted
          </label>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
        >
          Submit
        </button>
      </form>

      <Modal
        hidden={!modalVisible}
        disabled={loading}
        close={() => setModalVisible(false)}
        content={content}
        heading="Verification submission"
        secondaryText="Check out transaction"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        secondaryAction={async () => {
          const explorerURL = new URL(
            `/transactions/${transactionHashes!}`,
            selector.options.network.explorerUrl
          );
          await router.push(explorerURL);
        }}
      />
    </div>
  );
};

export default Form;
