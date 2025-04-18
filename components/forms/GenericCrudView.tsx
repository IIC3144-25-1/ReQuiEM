import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { ModalMessageAsEnum } from '@/utils/enums/ModalMessageAsEnum';
import StateMessage from './StateMessage';
import DataList from './DataList';
import DataItem from './DataItem';
import SelectPagination from './SelectPagination';
import LoadingState from './LoadingState';

export interface GenericCrudViewProps<T> {
  stateMessage: string;
  typeStateMessage: ModalMessageAsEnum | null;
  setTypeStateMessage: Dispatch<SetStateAction<ModalMessageAsEnum | null>>;

  buttonText: string;

  isDeleteModalOpen: boolean;
  onOpenDeleteModal: (item: T) => void;
  deleteModalComponent: ReactNode;

  items: T[];
  currentItem: T | null;
  setCurrentItem: (item: T) => void;

  getItemKey: (item: T) => number;
  getItemLabel: (item: T) => string;
  
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;

  showSelector?: boolean;
  isLoading?: boolean;
}

const GenericCrudView = <T,>({
  stateMessage,
  typeStateMessage,
  setTypeStateMessage,
  buttonText,
  isDeleteModalOpen,
  onOpenDeleteModal,
  deleteModalComponent,
  items,
  currentItem,
  setCurrentItem,
  getItemKey,
  getItemLabel,
  currentPage,
  totalPages,
  setCurrentPage,
  isLoading = false,
}: GenericCrudViewProps<T>) => {
  
  if (isLoading) return <LoadingState />;

  return (
    <>
      <StateMessage
        stateMessage={stateMessage}
        typeStateMessage={typeStateMessage}
        setTypeStateMessage={setTypeStateMessage}
      />

      <DataList
        buttonText={buttonText}
        // TODO
        onSaveAdd={() => {}}
      >
        {totalPages > 1 && (
          <SelectPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
        {items.map((item, index) => (
          <div key={index}>
            <div
              key={getItemKey(item)}
              className={`rounded-md cursor-pointer p-2 transition-all 
                ${
                  currentItem && getItemKey(currentItem) === getItemKey(item)
                    ? "bg-blue-100 border border-blue-500 dark:bg-blue-900/40 dark:border-blue-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              onClick={() => {
                if (!isDeleteModalOpen) {
                  setCurrentItem(item);
                }
              }}
            >
              <DataItem
                label={getItemLabel(item)}
                id={getItemKey(item)}
                // TODO
                handleEdit={() => {}}
                handleDelete={() => onOpenDeleteModal(item)}
              />
            </div>
          </div>
        ))}
      </DataList>
      

      {isDeleteModalOpen && currentItem && deleteModalComponent}

    </>
  );
};

export default GenericCrudView;
