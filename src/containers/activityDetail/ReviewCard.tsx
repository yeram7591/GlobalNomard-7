import { IconAdd } from '@/assets/icons';
import Image from 'next/image';
import React from 'react';
import { format } from 'date-fns';

function ReviewCard({ review }: { review: any }) {
  const defaultProfileImage = '/path/to/default/profile/image.png';
  return (
    <div>
      <div className="flex items-start gap-[16px] border-b-[1px] border-black-nomad pb-[24px]">
        <Image
          src={review.user.profileImageUrl || defaultProfileImage}
          alt={'프로필이미지'}
          width={45}
          height={45}
          className="h-[45px] w-[45px] rounded-[50%] object-contain"
        />
        <div className="flex flex-col gap-[8px]">
          <div className="flex w-[137px] justify-between">
            <span className="text-lg font-bold text-black-nomad">
              {review.user.nickname}
            </span>
            <span>|</span>
            <span className="text-lg font-regular text-gray-a4">
              {format(new Date(review.createdAt), 'yyyy.MM.dd')}
            </span>
          </div>
          <p className="text-lg font-regular text-black-nomad">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
