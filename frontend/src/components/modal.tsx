import clsx from "clsx";
import { FC } from "react";

type Props = {
  hidden: boolean;
  close(): void;
  disabled: boolean;
  content: string;
  heading?: string;
  secondaryAction?(): void;
  secondaryText?: string;
};

const Modal: FC<Props> = ({
  hidden,
  close,
  disabled,
  content,
  heading,
  secondaryAction,
  secondaryText,
}) => {
  return (
    <div
      id="verificationModal"
      tabIndex={-1}
      aria-hidden="true"
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 flex h-40 w-full",
        "items-center justify-center overflow-y-auto overflow-x-hidden",
        "p-4 md:inset-0 md:h-full",
        { hidden }
      )}
    >
      <div className="relative h-full w-full max-w-2xl md:h-auto">
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {heading}
            </h3>
            <button
              type="button"
              className={clsx(
                "ml-auto inline-flex items-center",
                "rounded-lg bg-transparent p-1.5 text-sm text-gray-400",
                "hover:bg-gray-200 hover:text-gray-900",
                "dark:hover:bg-gray-600 dark:hover:text-white"
              )}
              data-modal-hide="verificationModal"
              onClick={() => close()}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="space-y-6 p-6">
            <p className="text-white">{content}</p>
          </div>

          <div
            className={clsx(
              "flex items-center space-x-2 rounded-b",
              "border-t border-gray-200 p-6 dark:border-gray-600"
            )}
          >
            <button
              data-modal-hide="verificationModal"
              type="button"
              className={clsx(
                "rounded-lg bg-blue-700 px-5 py-2.5",
                "text-center text-sm font-medium text-white",
                "hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300",
                "dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              )}
              disabled={disabled}
              onClick={() => close()}
            >
              OK
            </button>
            {secondaryAction && (
              <button
                data-modal-hide="defaultModal"
                type="button"
                className={clsx(
                  "rounded-lg border border-gray-200 bg-white",
                  "px-5 py-2.5 text-sm font-medium text-gray-500",
                  "hover:bg-gray-100 hover:text-gray-900",
                  "focus:z-10 focus:outline-none focus:ring-4 focus:ring-blue-300",
                  "dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300",
                  "dark:hover:bg-gray-600 dark:hover:text-white",
                  "dark:focus:ring-gray-600"
                )}
                disabled={disabled}
                onClick={() => secondaryAction()}
              >
                {secondaryText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
