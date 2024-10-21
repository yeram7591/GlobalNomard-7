'use client';
import getMyReservations from './component/getMyReservation';
import EmptyPage from './component/EmptyPage';
import {
  IMyReservation,
  ReservationDatas,
} from '@/types/myActivityReservationList';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import ReservationCard from './component/ReservationCard';
import ReviewModal from '../Modal/ReviewModal';
import { useModalStore } from '@/stores/modalStore';

type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'canceled'
  | 'completed';

const MyReservations: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<
    ReservationStatus | undefined
  >(undefined);
  const { ref, inView } = useInView();
  const [selectedReservation, setSelectedReservation] =
    useState<IMyReservation | null>(null);
  const { setOpenModal } = useModalStore();

  const openReviewModal = (reservation: IMyReservation) => {
    setSelectedReservation(reservation);
    setOpenModal();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isLoading,
    isError,
    isFetchingNextPage,
  } = useInfiniteQuery<ReservationDatas, Error>({
    queryKey: ['getMyReservations', selectedStatus],
    queryFn: async ({ pageParam = 1 }) => {
      return await getMyReservations({
        size: 8,
        cursorId: pageParam as number,
        status: selectedStatus,
      });
    },
    getNextPageParam: (lastPage) => lastPage.cusorId ?? undefined,
    initialPageParam: undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    refetch();
  }, [selectedStatus, refetch]);

  if (isError) return <h3>Failed to load</h3>;

  const reservations = data?.pages.flatMap((page) => page.reservations) || [];

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-3xl-bold mb-3">예약 내역</div>
      </div>

      {reservations.length === 0 ? (
        <EmptyPage />
      ) : (
        <div className="h-full w-full">
          <div className="mx-auto flex flex-col gap-2 md:gap-4 xl:gap-6">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservations={[reservation]}
                selectedStatus={selectedStatus}
                onReviewClick={() => openReviewModal(reservation)}
              />
            ))}
          </div>

          <div ref={ref} />
        </div>
      )}
      <ReviewModal reservation={selectedReservation} />
    </div>
  );
};

export default MyReservations;
