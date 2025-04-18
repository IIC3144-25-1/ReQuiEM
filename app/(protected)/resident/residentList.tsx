'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { ModalMessageAsEnum } from '@/utils/enums/ModalMessageAsEnum';
import GenericCrudView from '@/components/forms/GenericCrudView';

import { getAllResident } from '@/actions/resident/getAll';
import { useResidentInfoContext } from './context/ResidentInfoContext';
import { IResident } from '@/models/Resident';
import { deleteResident } from '@/actions/resident/delete';
import DeleteModal from '@/components/modals/DeleteModal';

const ResidentList: FC = () => {
  const context = useResidentInfoContext();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [stateMessage, setStateMessage] = useState<string>('');
  const [typeStateMessage, setTypeStateMessage] = useState<ModalMessageAsEnum | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const loadResidents = async () => {
    const response = await getAllResident();
    console.log('response', response);
    context.setResidents(response);
    setTotalPages(Math.ceil(response.length / itemsPerPage));
    context.setDisplayResidents(response.slice(0, itemsPerPage));
  };

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = context.residents.slice(start, start + itemsPerPage);
    context.setDisplayResidents(paginatedItems);
  }, [currentPage, context.residents]);


  const handleOpenDeleteModal = (residentData: IResident) => {
    context.setSelectedResident(residentData);
    setIsDeleteModalOpen(true);
  };


  const handleDelete = async () => {
    if (!context.selectedResident) return;
    const id = context.selectedResident._id;
    setIsDeleteModalOpen(false);

    try {
      await deleteResident(id.toString());
      context.setResidents(context.residents.filter((resident) => resident._id !== id));
      setTypeStateMessage(ModalMessageAsEnum.Success);
      setStateMessage('Residente eliminado con exito');
    } catch {
      setTypeStateMessage(ModalMessageAsEnum.Error);
      setStateMessage('Error al eliminar el Residente');
    }
  };


  const getItemKey = (resident: IResident) => resident._id.toString();
  // const getItemLabel = (resident: IResident) => {
  //   if (typeof resident.user !== 'object' || !('name' in resident.user)) {
  //     return 'Sin nombre';
  //   }
  //   return resident.user.name || 'Sin nombre';
  // };
  const getItemLabel = (resident: IResident) => resident._id.toString()

  return (
    <GenericCrudView<IResident>
      stateMessage={stateMessage}
      typeStateMessage={typeStateMessage}
      setTypeStateMessage={setTypeStateMessage}
      buttonText="Agregar Residente"
      isDeleteModalOpen={isDeleteModalOpen}
      onOpenDeleteModal={handleOpenDeleteModal}
      deleteModalComponent={
        <DeleteModal
          value={context.selectedResident ? String(context.selectedResident.user) : ''}
          label="Residente"
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
        />
      }

      items={context.displayResidents}
      currentItem={context.selectedResident}
      setCurrentItem={context.setSelectedResident}
      
      getItemKey={getItemKey}
      getItemLabel={getItemLabel}

      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
    />
  );
};

export default ResidentList;
