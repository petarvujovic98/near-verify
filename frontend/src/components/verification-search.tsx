import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { getTrust } from "../lib/verify-functions";
import { useWalletSelector } from "../context/WalletSelectorContext";
import Modal from "./modal";
import { useRouter } from "next/router";

const validation = z.object({
  search: z.string(),
  // .min(2)
  // .max(64)
  // .regex(/^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/),
});

type Schema = z.infer<typeof validation>;

const VerificationSearch: FC = () => {
  const router = useRouter();
  const { search } = router.query as Schema;
  const { handleSubmit, register } = useForm<Schema>({
    defaultValues: { search },
    resolver: zodResolver(validation),
  });
  const { selector } = useWalletSelector();
  const [trust, setTrust] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (search) {
      setLoading(true);
      getTrust(search, selector.options.network.nodeUrl).then((trust) => {
        setTrust(trust);
        setLoading(false);
        setModalVisible(true);
      });
    }
  }, [router.query]);

  const handleGetTrust = useCallback(
    async ({ search }: Schema) => {
      setLoading(true);

      const updatedURL = new URL(window.location.href);
      updatedURL.searchParams.set("search", search);

      router.replace(updatedURL);

      const result = await getTrust(search, selector.options.network.nodeUrl);

      setLoading(false);
      setTrust(result);
    },
    [selector]
  );

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <form onSubmit={handleSubmit(handleGetTrust)}>
        <label
          htmlFor="search"
          className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Check
        </label>
        <div className="relative w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            {...register("search")}
            type="search"
            id="search"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Check validation for source..."
            required
          />
          <button
            type="submit"
            data-modal-show="verificationModal"
            data-modal-target="verificationModal"
            className="absolute right-2.5 bottom-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setModalVisible(true)}
          >
            Check
          </button>
        </div>
      </form>

      <Modal
        hidden={!modalVisible}
        disabled={loading}
        close={() => setModalVisible(false)}
        heading="Trust score"
        content={
          loading
            ? "Loading..."
            : trust !== null
              ? `The trust score for this source is: ${trust}`
              : "This source has no trust score yet"
        }
        {...{
          ...(trust !== null
            ? {}
            : {
              secondaryAction: () => {
                const { search } = router.query as Schema;
                const submitURL = new URL(
                  "/submit",
                  new URL(window.location.href).origin
                );
                submitURL.searchParams.set("source", search);

                router.push(submitURL);
              },
              secondaryText: "Submit a verification",
            }),
        }}
      />
    </div>
  );
};

export default VerificationSearch;
