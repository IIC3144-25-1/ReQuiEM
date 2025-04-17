import React, { FC, ReactNode } from "react";
import AddButton from "./Add";

type DataListProps = {
  children: ReactNode;
  buttonText: string;
  onSaveAddModal: () => void;
  modal: ReactNode;
};

const DataList: FC<DataListProps> = (props) => {
  return (
    <div className="flex justify-center p-4">
      <div className="relative flex flex-col rounded-lg bg-white shadow-md border border-slate-300 
                      dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all max-w-md w-full">
        <nav className="flex flex-col gap-1 p-1.5">
          {props.children}
          <AddButton textToShow={props.buttonText} onClick={props.onSaveAddModal} />
        </nav>
      </div>
      {props.modal}
    </div>
  );
};

export default DataList;
