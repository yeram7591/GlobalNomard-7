import { IconStarOn, IconStarOff } from '@/assets/icons/index';
import ImgTest from '@/assets/images/img_empty.png';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import Button from '@/components/Button/Button';
import BaseModal from './BaseModal';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/services/axios';

const STARS = [0, 1, 2, 3, 4];

function ReviewModal({ reservation }: ReviewModal) {
  const [isStarOn, setIsStarOn] = useState([false, false, false, false, false]);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleRateClick = (starIdx: number) => {
    if (starIdx === 0) {
      setIsStarOn([true, false, false, false, false]);
      setRating(1);
    } else if (starIdx === 1) {
      setIsStarOn([true, true, false, false, false]);
      setRating(2);
    } else if (starIdx === 2) {
      setIsStarOn([true, true, true, false, false]);
      setRating(3);
    } else if (starIdx === 3) {
      setIsStarOn([true, true, true, true, false]);
      setRating(4);
    } else {
      setIsStarOn([true, true, true, true, true]);
      setRating(5);
    }
  };

  const submitReviewRequest = async () => {
    const response = await axiosInstance.post(
      `/my-reservations/${reservation.id}/reviews`,
      {
        rating,
        content,
      },
    );
    return response.data;
  };

  const submitMutation = useMutation({
    mutationFn: submitReviewRequest,
    onSuccess: () => {
      alert('리뷰가 성공적으로 작성되었습니다.');
    },
    onError: (error) => {
      alert(`리뷰 작성 실패: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  return (
    <BaseModal
      type="modal"
      size="review"
      titleContent="후기 작성"
      tStyle="review"
      footerButton={null}
    >
      {reservation ? (
        <div className="mt-[41px] mobile:mt-[35px]">
          <div className="mb-[24px] flex items-center mobile:mb-[12px]">
            <Image
              className="mr-[8px] h-[126px] w-[126px] rounded-[12px] mobile:h-[100px] mobile:w-[100px]"
              src={ImgTest}
              alt="테스트 이미지"
            />
            <div className="flex flex-col gap-[12px] mobile:gap-[6px]">
              <p className="text-xl font-bold mobile:text-lg">
                {reservation.activity.title}
              </p>
              <p className="text-2lg font-regular mobile:text-md">
                {reservation.date} · {reservation.startTime} -{' '}
                {reservation.endTime} · {reservation.headCount}명
              </p>
              <hr className="border-[1px] border-black-nomad opacity-10" />
              <p className="text-3xl font-bold mobile:text-[20px]">
                ₩{reservation.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex h-[100px] items-center justify-center gap-[9.75px]">
              {STARS.map((starIdx) => (
                <Image
                  key={starIdx}
                  className="h-[49.01px] w-[52.5px] cursor-pointer"
                  src={isStarOn[starIdx] ? IconStarOn : IconStarOff}
                  alt="평점아이콘"
                  onClick={() => handleRateClick(starIdx)}
                />
              ))}
            </div>
            <textarea
              className="y-full my-[24px] flex h-[240px] w-full resize-none rounded-[4px] border-[1px] border-gray-79 p-[16px] text-lg font-regular outline-none placeholder:text-gray-79 mobile:mb-[24px] mobile:mt-[12px] mobile:h-[346px]"
              placeholder="후기를 작성해주세요"
              value={content}
              onChange={handleTextareaChange}
            />

            <Button type="submit" size="largeModal">
              작성하기
            </Button>
          </form>
        </div>
      ) : (
        <p>예약 정보가 없습니다.</p>
      )}
    </BaseModal>
  );
}

export default ReviewModal;
