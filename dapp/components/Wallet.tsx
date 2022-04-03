import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { Web3Provider } from "@ethersproject/providers";
import { useEffect } from "react";

const Wallet = () => {
  const injectedConnector = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  });
  const { chainId, account, active, activate, library } =
    useWeb3React<Web3Provider>();

  useEffect(() => {
    injectedConnector.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injectedConnector);
      }
    });
  }, []);

  const truncateAddress = (account: string) => {
    const regex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = account.match(regex);
    if (match) {
      return `${match[1]}...${match[2]}`;
    }
    return account;
  };

  return (
    <>
      {active ? (
        <div className="text-lg outline p-1 rounded-md">
          {truncateAddress(account!)}
        </div>
      ) : (
        <button
          className="text-lg outline p-1 rounded-md"
          onClick={() => activate(injectedConnector)}
        >
          Connect Wallet
        </button>
      )}
    </>
  );
};

export default Wallet;
