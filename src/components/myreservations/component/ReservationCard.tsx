import Button from '../../Button/Button';
import { IMyReservation } from '@/types/myActivityReservationList';
import getMyReservations from './getMyReservation';
import Image from 'next/image';
import { useState } from 'react';
import EmptyPage from './EmptyPage';
import { getStatusColor, getStatusText } from './StatusUtils';
import React from 'react';

interface ReservationCardProps {
  reservations: IMyReservation[];
  selectedStatus:
    | 'pending'
    | 'confirmed'
    | 'declined'
    | 'canceled'
    | 'completed'
    | undefined;
  onReviewClick: () => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservations,
  onReviewClick,
}) => {
  const [currentReservations, setCurrentReservations] = useState<
    IMyReservation[]
  >(reservations || []);

  const handleReviewSuccess = (reservationId: number) => {
    setCurrentReservations((prevReservations) =>
      prevReservations.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, reviewSubmitted: true }
          : reservation,
      ),
    );
  };

  // 타이틀 생략 변환
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  // 날짜 변환
  const formatDate = (dateString: string) => {
    return dateString.replace(/-/g, '. ');
  };

  // 가격 변환
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  return (
    <div>
      {currentReservations?.length === 0 ? (
        <EmptyPage />
      ) : (
        currentReservations.map((reservation, index) => (
          <div
            key={index}
            className="flex h-[128px] rounded-3xl border border-solid border-gray-300 bg-white md:h-[156px] md:w-[429px] xl:h-[204px] xl:w-[792px]"
          >
            <div className="relative h-[128px] w-[128px] flex-shrink-0 overflow-hidden rounded-l-3xl md:h-[156px] md:w-[156px] xl:h-[204px] xl:w-[204px]">
              {reservation.activity ? (
                <Image
                  src={
                    reservation.activity.bannerImageUrl || '/default-banner.jpg'
                  }
                  priority
                  fill
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 156px, 204px"
                  style={{ objectFit: 'cover' }}
                  alt="배너 이미지"
                />
              ) : (
                <Image
                  src="/default-banner.jpg"
                  priority
                  fill
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 156px, 204px"
                  style={{ objectFit: 'cover' }}
                  alt="배너 이미지"
                />
              )}
            </div>
            <div className="ml-2 mr-3 mt-[11px] grid w-full md:ml-3 md:mt-[12px] xl:ml-6 xl:mt-[21px] xl:h-[162px]">
              <div className="grid gap-1 md:gap-[0px] xl:gap-[12px]">
                <div
                  className={`text-sm font-bold md:text-lg ${getStatusText[reservation.status]}`}
                >
                  {getStatusText[reservation.status]}
                </div>
                <div className="text-md-bold md:text-lg-bold xl:text-xl-bold">
                  {reservation.activity ? (
                    <>
                      <span className="block xl:hidden">
                        {truncateTitle(reservation.activity.title, 15)}
                      </span>
                      <span className="hidden xl:block">
                        {reservation.activity.title}
                      </span>
                    </>
                  ) : (
                    <span>Activity title not available</span>
                  )}
                </div>
                <div className="md:text-sm-regular text-xs-regular xl:text-[18px]">
                  {formatDate(reservation.date)} · {reservation.startTime} -{' '}
                  {reservation.endTime} · {reservation.headCount}명
                </div>
              </div>
              <div className="mb-1 flex w-full items-center justify-between md:w-[245px] xl:mb-0 xl:mt-4 xl:w-[540px]">
                <div className="text-2lg-medium md:text-xl-medium xl:text-2xl-medium">
                  {formatPrice(reservation.totalPrice)}
                </div>
                {reservation.status === 'completed' &&
                  reservation.reviewSubmitted === false && (
                    <div className="">
                      <Button onClick={onReviewClick} size={'small'}>
                        후기 작성
                      </Button>
                    </div>
                  )}
                {reservation.status === 'pending' && <div className=""></div>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReservationCard;
