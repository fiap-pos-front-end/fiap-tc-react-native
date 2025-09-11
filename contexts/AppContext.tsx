import React, { ReactNode } from "react";
import { CategoryProvider } from "./CategoryContext";
import { DashboardProvider } from "./DashboardContext";
import { TransferProvider } from "./TransferContext";

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  return (
    <CategoryProvider usePaged pageSize={10} mode="snapshot">
      <TransferProvider usePaged pageSize={10} mode="snapshot">
        <DashboardProvider>{children}</DashboardProvider>
      </TransferProvider>
    </CategoryProvider>
  );
};
