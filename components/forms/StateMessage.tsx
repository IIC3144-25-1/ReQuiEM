import React, { FC, JSX, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ModalMessageAsEnum } from "@/utils/enums/ModalMessageAsEnum";
import { CheckCircle2Icon } from "lucide-react";

import DeleteIcon from "@/images/svg/DeleteIcon";
import ExclamationIcon from "@/images/svg/ExclamationIcon";
import InformationIcon from "@/images/svg/InformationIcon";


interface StateMessageProps {
  stateMessage: string;
  typeStateMessage: ModalMessageAsEnum | null;
  setTypeStateMessage: (type: ModalMessageAsEnum | null) => void;
}

const StateMessage: FC<StateMessageProps> = ({
  stateMessage,
  typeStateMessage,
  setTypeStateMessage,
}) => {
  const messageColors: Record<ModalMessageAsEnum, string> = {
    [ModalMessageAsEnum.Success]: "bg-green-100 text-green-700 border-green-700",
    [ModalMessageAsEnum.Error]: "bg-red-100 text-red-700 border-red-700",
    [ModalMessageAsEnum.Warning]: "bg-orange-100 text-orange-700 border-orange-700",
    [ModalMessageAsEnum.Info]: "bg-blue-100 text-blue-700 border-blue-700",
  };

  const iconsMapping: Record<ModalMessageAsEnum, JSX.Element> = {
    [ModalMessageAsEnum.Success]: (
      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0" />
    ),
    [ModalMessageAsEnum.Error]: (
      <DeleteIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
    ),
    [ModalMessageAsEnum.Warning]: (
      <ExclamationIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
    ),
    [ModalMessageAsEnum.Info]: (
      <InformationIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
    ),
  };

  useEffect(() => {
    if (typeStateMessage) {
      const timer = setTimeout(() => {
        setTypeStateMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [typeStateMessage, setTypeStateMessage]);

  return (
    <AnimatePresence>
      {typeStateMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 5, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 z-[1000] flex items-center justify-center w-full px-4"
        >
          <div
            className={`rounded-2xl border-2 p-2 text-xs flex items-center space-x-3 shadow-lg justify-center w-64 ${messageColors[typeStateMessage]}`}
          >
            {iconsMapping[typeStateMessage]}
            <span>{stateMessage}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
    
};

export default StateMessage;
