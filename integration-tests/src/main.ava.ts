import { Worker, NearAccount } from "near-workspaces";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount("test-account");
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2]);

  // Initialize the contracts authorities
  await contract.call(contract, "new", {
    authorities: [contract.accountId, root.accountId],
  });

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});

test("pin a entry and get the verification score", async (t) => {
  const { contract } = t.context.accounts;
  await contract.call(
    contract,
    "pin_verification",
    {
      entry_id: "test",
      trusted: true,
    },
    {
      attachedDeposit: "1",
    }
  );
  const verification = await contract.view("get_verification", {
    entry_id: "test",
  });

  t.is(verification, 1);
});

test("vote for an entry and get cumulative trust", async (t) => {
  const { root, contract } = t.context.accounts;
  await root.call(
    contract,
    "submit_verification",
    {
      entry_id: "test",
      trusted: true,
    },
    {
      attachedDeposit: "1",
    }
  );
  await contract.call(
    contract,
    "submit_verification",
    {
      entry_id: "test",
      trusted: false,
    },
    {
      attachedDeposit: "1",
    }
  );
  const verification = await contract.view("get_verification", {
    entry_id: "test",
  });

  t.is(verification, 0.5);
});
