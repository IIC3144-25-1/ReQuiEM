import React, { FC, useEffect, useState } from 'react';
import EditPlateModal from '../form/EditPlateModal';
import DeleteModal from '@/app/components/modals/DeleteModal';
import { CreatePlateData, PlateData, UpdateVehicleData } from '@/interfaces/plates/PlateData';
import { usePlateContext } from '../../contexts/PlateInfoContext';
import { createVehicle, deleteVehicle, getVehiclesBySite, updateVehicle } from '@/api/Vehicle/vehicleMethods';
import { ModalMessageAsEnum } from '@/utils/enums/ModalMessageAsEnum';
import { useSiteContext } from '@/app/sites/context/SitesContext';
import StatusTag from '@/app/components/Message/StatusTag';
import GenericCrudView from '@/app/components/forms/GenericCrudView';

const PlateList: FC = () => {
  const context = usePlateContext();
  const siteContext = useSiteContext();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [stateMessage, setStateMessage] = useState<string>('');
  const [typeStateMessage, setTypeStateMessage] = useState<ModalMessageAsEnum | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const loadPlates = async () => {
    if (!siteContext.currentSite) return;
    const response = await getVehiclesBySite(siteContext.currentSite.id);
    context.setPlates(response);
    setTotalPages(Math.ceil(response.length / itemsPerPage));
    context.setDisplayPlates(response.slice(0, itemsPerPage));
  };

  useEffect(() => {
    loadPlates();
  }, [siteContext.currentSite]);

  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = context.plates.slice(start, start + itemsPerPage);
    context.setDisplayPlates(paginatedItems);
  }, [currentPage, context.plates]);

  const handleOpenCreateModal = () => {
    context.setSelectedPlate(null);

    context.setPlateToAdd('');
    context.setBrandToAdd('');
    context.setModelToAdd('');
    context.setOwnerToAdd('');
    context.setColorToAdd('');
    context.setIsActive(true);

    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (plateData: PlateData) => {
    context.setSelectedPlate(plateData);

    context.setPlateToAdd(plateData.plate);
    context.setBrandToAdd(plateData.brand);
    context.setModelToAdd(plateData.model);
    context.setOwnerToAdd(plateData.owner);
    context.setColorToAdd(plateData.color);
    context.setIsActive(plateData.is_active);

    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (plateData: PlateData) => {
    context.setSelectedPlate(plateData);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!siteContext.currentSite) {
      setTypeStateMessage(ModalMessageAsEnum.Warning);
      setStateMessage('Seleccione un sitio');
      return;
    }

    const createData: CreatePlateData = {
      plate: context.plateToAdd.toUpperCase(),
      brand: context.brandToAdd,
      model: context.modelToAdd,
      owner: context.ownerToAdd,
      color: context.colorToAdd,
      is_active: context.isActive,
      site_id: siteContext.currentSite.id,
    };

    try {
      const response = await createVehicle(createData);
      context.setPlates([...context.plates, response]);
      setTypeStateMessage(ModalMessageAsEnum.Success);
      setStateMessage('Vehiculo agregado con exito');
    } catch (error) {
      console.error('Error al guardar el vehículo:', error);
    }
  };

  const handleDelete = async () => {
    if (!context.selectedPlate || !siteContext.currentSite) return;
    const id = context.selectedPlate.id;
    setIsDeleteModalOpen(false);

    try {
      await deleteVehicle(id);
      context.setPlates(context.plates.filter((plate) => plate.id !== id));
      setTypeStateMessage(ModalMessageAsEnum.Success);
      setStateMessage('Vehiculo eliminado con exito');
    } catch {
      setTypeStateMessage(ModalMessageAsEnum.Error);
      setStateMessage('Error al eliminar el vehiculo');
    }
  };

  const handleEdit = async () => {
    if (!context.selectedPlate || !siteContext.currentSite) return;

    const updatedData: UpdateVehicleData = {
      id: context.selectedPlate.id,
      plate: context.plateToAdd,
      brand: context.brandToAdd,
      model: context.modelToAdd,
      owner: context.ownerToAdd,
      color: context.colorToAdd,
      is_active: context.isActive,
      site_id: siteContext.currentSite.id,
    };

    try {
      const response = await updateVehicle(updatedData);
      context.setPlates(
        context.plates.map((plate) =>
          plate.id === response.id ? response : plate
        )
      );
      setTypeStateMessage(ModalMessageAsEnum.Success);
      setStateMessage('Vehiculo actualizado con exito');
    } catch {
      setTypeStateMessage(ModalMessageAsEnum.Error);
      setStateMessage('Error al actualizar el vehiculo');
    }
  };

  const handleOnChangeSite = () => {
    context.setSelectedPlate(null);
    context.setPlatesEntries([]);
  };

  const getItemKey = (plate: PlateData) => plate.id;
  const getItemLabel = (plate: PlateData) => plate.plate;
  const renderItemTag = (plate: PlateData) => <StatusTag isActive={plate.is_active} />;
  const getCreatedAt = (plate: PlateData) => plate.created_at;
  const getUpdatedAt = (plate: PlateData) => plate.updated_at;

  return (
    <GenericCrudView<PlateData>
      stateMessage={stateMessage}
      typeStateMessage={typeStateMessage}
      setTypeStateMessage={setTypeStateMessage}
      currentSite={siteContext.currentSite}
      onChangeSite={handleOnChangeSite}
      buttonText="Agregar Patente"
      isAddModalOpen={isAddModalOpen}
      onOpenCreateModal={handleOpenCreateModal}
      addModalComponent={
        <EditPlateModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreate}
        />
      }
      isEditModalOpen={isEditModalOpen}
      onOpenEditModal={handleOpenEditModal}
      editModalComponent={
        <EditPlateModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEdit}
        />
      }
      isDeleteModalOpen={isDeleteModalOpen}
      onOpenDeleteModal={handleOpenDeleteModal}
      deleteModalComponent={
        <DeleteModal
          value={context.selectedPlate ? context.selectedPlate.plate : ''}
          label="Patente"
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
        />
      }
      items={context.displayPlates}
      currentItem={context.selectedPlate}
      setCurrentItem={context.setSelectedPlate}
      getItemKey={getItemKey}
      getItemLabel={getItemLabel}
      renderItemTag={renderItemTag}
      getCreatedAt={getCreatedAt}
      getUpdatedAt={getUpdatedAt}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
    />
  );
};

export default PlateList;
