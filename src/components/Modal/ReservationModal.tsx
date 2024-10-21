import MiniCalendar from '../Calendar/MiniCalendar';
import Button from '../Button/Button';
import { IconAdd, IconSubtract } from '@/assets/icons';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/services/axios';
import AlertModal from './AlertModal';
import { useModalStore } from '@/stores/modalStore';

export interface IavailableTimes {
  date: Date | null;
  startTime: string;
  endTime: string;
}

function ReservationModal({ activityId }: IReservationModal) {
  const { setOpenModal } = useModalStore();
  const [availableTimes, setAvailableTimes] = useState<IavailableTimes[]>([]);
  const [headCount, setHeadCount] = useState<number>(1);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );
  const [price, setPrice] = useState<number>(1000);

  const { data } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/activities/${activityId}`);
      return response.data;
    },
    enabled: !!activityId,
  });

  useEffect(() => {
    if (data) {
      setPrice(data.price);
    }
  }, [data]);

  const handleDateSelect = (times: IavailableTimes[]) => {
    setAvailableTimes(times);
  };

  const increaseHeadCount = () => {
    setHeadCount((prevCount) => prevCount + 1);
  };

  const decreaseHeadCount = () => {
    setHeadCount((prevCount) => (prevCount > 1 ? prevCount - 1 : 1));
  };

  const reservationMutation = useMutation({
    mutationFn: async () => {
      if (selectedScheduleId === null) {
        throw new Error('스케줄을 선택해 주세요.');
      }

      const response = await axiosInstance.post(
        `/activities/${activityId}/reservations`,
        {
          scheduleId: selectedScheduleId,
          headCount: headCount,
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log('예약 성공:', data);
      setOpenModal();
    },
    onError: (error) => {
      console.error('예약 실패:', error);
    },
  });

  const handleReserve = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
  };

  return (
    <div className="w-[384px] rounded-[12px] border-[1px] px-[24px] pb-[18px] pt-[24px]">
      <div>
        <div>
          <p className="flex items-center">
            <span className="text-3xl font-bold">₩ {price}</span>{' '}
            <span className="relative left-[7px] top-[1px] text-xl font-regular text-gray-4b">
              /인
            </span>
          </p>
        </div>
        <hr className="my-[10px] border-[0.px] border-gray-dd" />
        <div>
          <p className="text-xl font-bold">날짜</p>
          <div className="flex justify-center">
            <MiniCalendar
              activityId={activityId}
              onDateSelect={handleDateSelect}
            />
          </div>
        </div>
      </div>
      <div>
        <div>
          <div>
            <p className="text-2lg font-bold">예약 가능한 시간</p>
            <div className="mt-[14px] flex flex-wrap gap-[12px]">
              {availableTimes.map((availableTime, index) =>
                availableTime.times.map((time, timeIndex) => (
                  <button
                    key={timeIndex}
                    className={`bg-black-white shrink-0 rounded-[8px] border-[1px] border-black-nomad px-[12px] py-[10px] text-black-nomad ${selectedScheduleId === time.id ? 'bg-black-nomad text-white' : ''}`}
                    onClick={() => handleReserve(time.id)}
                  >
                    {time.startTime} ~ {time.endTime}
                  </button>
                )),
              )}
            </div>
            <hr className="mb-[12px] mt-[16px] border-[0.px] border-gray-dd" />
          </div>
          <div className="mb-[24px]">
            <p className="text-2lg font-bold">참여 인원 수</p>
            <div className="mt-[8px] flex w-[120px] justify-between rounded-[6px] border-[1px] border-gray-e8 p-[10px]">
              <button
                className="transform transition-transform duration-300 ease-in-out hover:scale-110"
                onClick={decreaseHeadCount}
              >
                <Image src={IconSubtract} alt="인원 수 감소 버튼" />
              </button>
              <span>{headCount}</span>
              <button
                className="transform transition-transform duration-300 ease-in-out hover:scale-110"
                onClick={increaseHeadCount}
              >
                <Image src={IconAdd} alt="인원 수 증가 버튼" />
              </button>
            </div>
          </div>
          <Button
            size="largeModal"
            onClick={() => reservationMutation.mutate()}
          >
            예약하기
          </Button>
        </div>
        <hr className="mb-[16px] mt-[24px] border-[0.px] border-gray-dd" />
        <div className="flex justify-between text-xl font-bold">
          <span>총 합계</span>
          <span>₩ {headCount * price}</span>
        </div>
      </div>
      {reservationMutation.isSuccess && (
        <AlertModal>예약이 완료되었습니다.</AlertModal>
      )}
    </div>
  );
}

export default ReservationModal;
