import React, { createContext, useState, useContext } from 'react';

interface WalletContextType {
  walletBalance: number;
  setWalletBalance: (b: number) => void;
}

const WalletContext = createContext<WalletContextType>({
  walletBalance: 0,
  setWalletBalance: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  return (
    <WalletContext.Provider value={{ walletBalance, setWalletBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
