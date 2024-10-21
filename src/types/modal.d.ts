interface IModal {
  isModalOpen: boolean;
  setOpenModal: () => void;
  setCloseModal: () => void;
}

interface IModalPortal {
  children: ReactNode;
}

interface IBaseModal {
  type: 'modal' | 'nonModal';
  size:
    | 'alert'
    | 'confirm'
    | 'review'
    | 'reservation'
    | 'reservationDetailLarge'
    | 'reservationDetailMedium'
    | 'notice';
  titleContent?: null | string;
  tStyle?: 'review' | 'reservationDetail' | 'notice';
  xStyle?: 'review' | 'reservationDetail' | 'notice';
  footerButton: null | 1 | 2;
  children: ReactNode;
  onConfirm?: () => void;
  modalPosition?: ModalPosition;
}

type IAlertModal = Pick<IBaseModal, 'children'> & {
  onConfirm?: () => void;
};

type IConfirmModal = Pick<IBaseModal, 'children'>;

interface ReviewModal {
  reservation: IMyReservation | null;
}

interface ITabContent {
  options: { label: string; value: string }[];
  selectedDate: Date;
}

interface IReservationModal {
  activityId: string;
}

type ModalPosition = {
  top: number;
  left: number;
};

interface IReservationDetailsModal {
  modalPosition: ModalPosition;
  selectedDate: Date;
}
