import React, { FC } from "react";
import EditModalWrapper from "./EditModalWrapper";

interface DeleteModalProps {
  value: string;
  label: string;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteModal: FC<DeleteModalProps> = (props) => (
  <EditModalWrapper title="" onClose={props.onClose} onConfirm={props.onDelete}>
    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
      Eliminar {props.label}
    </h2>
    <h3 className="text-center mt-2">
      <strong className="text-3xl text-red-600 dark:text-red-400">{props.value}</strong>
    </h3>
    <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
      Esta acción <span className="text-black dark:text-white font-bold">no se puede deshacer</span>.
    </p>
  </EditModalWrapper>
);

export default DeleteModal;
