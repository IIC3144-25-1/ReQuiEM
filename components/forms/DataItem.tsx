import React, { FC, ReactNode } from "react";
import { Edit2Icon, Trash2 } from "lucide-react";

type DataItemProps = {
  label: string;
  id: number;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  tag?: ReactNode;
}

const DataItem: FC<DataItemProps> = (props) => {
  return (
    <div
      role="button"
      className="text-slate-800 dark:text-gray-200 flex w-full items-center rounded-md px-2 pl-3 
                 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100 
                 dark:hover:bg-slate-700 dark:focus:bg-slate-700 dark:active:bg-slate-700"
    >
      {props.label}
      {props.tag}
      <div className="ml-auto flex items-center space-x-2">
        <button
          className="rounded-md border border-transparent p-0.5 text-center text-sm transition-all 
                     text-slate-600 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200 
                     dark:text-gray-400 dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:active:bg-slate-800 
                     disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button"
          onClick={() => props.handleEdit(props.id)}
        >
          <Edit2Icon className="w-5 h-5" />
        </button>
        <button
          className="rounded-md border border-transparent p-0.5 text-center text-sm transition-all 
                     text-slate-600 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200 
                     dark:text-gray-400 dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:active:bg-slate-800 
                     disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button"
          onClick={() => props.handleDelete(props.id)}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DataItem;