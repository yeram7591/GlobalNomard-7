import { useState, useEffect } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import axiosInstance from '@/services/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/Button/Button';
import DropDown from '@/components/Dropdown/Dropdown';
import DaumPostcode from 'react-daum-postcode';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import ScheduleInput from './Scheduleinput';
import ImageUploadField from './ImageUploadField';
import { IconMinusTime } from '@/assets/icons';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Register = () => {
  const [availableTimes, setAvailableTimes] = useState<
    { date: Date | null; startTime: string; endTime: string }[]
  >([]);
  const [selectedTime, setSelectedTime] = useState<{
    date: Date | null;
    startTime: string;
    endTime: string;
  }>({
    date: null,
    startTime: '',
    endTime: '',
  });

  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [subImageUrls, setSubImageUrls] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>('카테고리를 선택해주세요');
  const [address, setAddress] = useState<string>('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string>('');
  const router = useRouter();

  const categoryOptions = [
    { label: '문화 예술', value: '문화 예술' },
    { label: '식음료', value: '식음료' },
    { label: '스포츠', value: '스포츠' },
    { label: '투어', value: '투어' },
    { label: '관광', value: '관광' },
    { label: '웰빙', value: '웰빙' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const queryClient = useQueryClient();

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const { data } = await axiosInstance.post(
          '/activities/image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        return data.activityImageUrl;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    },
  });

  const submitDataMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await axiosInstance.post('/activities', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      router.push('/');
      setIsSubmitted(false);
    },
    onError: (error) => {
      console.error('Activity registration error:', error);
    },
  });

  const handleBannerImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = await uploadImageMutation.mutateAsync(file);
      setBannerImageUrl(url);
    }
  };

  const handleSubImagesChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files) {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadImageMutation.mutateAsync(file)),
      );

      const newSubImageUrls = [...subImageUrls, ...urls].slice(0, 4);
      setSubImageUrls(newSubImageUrls);
    }
  };

  const removeImagePreview = () => {
    setBannerImageUrl(null);
  };

  const removeSubImagePreview = (index: number) => {
    setSubImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: any) => {
    const postData = {
      ...data,
      category: selectedCategory,
      bannerImageUrl,
      subImageUrls,
      address,
      // schedules: availableTimes.map((time) => ({
      //   ...time,
      //   date: time.date ? time.date.toISOString().split('T')[0] : null,
      // })),
      schedules: availableTimes.map((time) => {
        if (time.date) {
          time.date.setDate(time.date.getDate() + 1);
          return {
            ...time,
            date: time.date.toISOString().split('T')[0],
          };
        } else {
          return {
            ...time,
            date: null,
          };
        }
      }),
    };
    console.log(postData);
    submitDataMutation.mutate(postData);
  };

  const addSchedule = () => {
    if (selectedTime.date && selectedTime.startTime && selectedTime.endTime) {
      setAvailableTimes((prev) => [...prev, selectedTime]);
      setSelectedTime({ date: null, startTime: '', endTime: '' });
      setScheduleError('');
    } else {
      setScheduleError('날짜, 시작시간, 종료시간을 모두 입력해주세요!');
    }
  };

  const removeSchedule = (index: number) => {
    setAvailableTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const onCompletePost = (data: any) => {
    setAddress(data.address);
    setIsPostcodeOpen(false);
  };

  const onScheduleChange = (
    date: Date | null,
    startTime: string,
    endTime: string,
  ) => {
    setSelectedTime({ date, startTime, endTime });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('postcode-modal');
      if (modal && !modal.contains(event.target as Node)) {
        setIsPostcodeOpen(false);
      }
    };

    if (isPostcodeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPostcodeOpen]);

  const handleRegistration = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    handleSubmit((data) => {
      if (Object.keys(errors).length === 0) {
        onSubmit(data);
      }
    })();
  };

  return (
    <>
      <form
        onSubmit={handleRegistration}
        className="mb-[72px] flex w-[792px] flex-col gap-[24px]"
      >
        <div className="flex flex-row justify-between">
          <h1 className="text-3xl font-bold">내 체험 등록</h1>
          <Button type="submit" size="small">
            등록하기
          </Button>
        </div>

        <InputField
          label="제목"
          register={register('title', { required: '제목을 입력해주세요!' })}
          placeholder="제목을 입력해주세요"
        />
        {isSubmitted && errors.title && (
          <p className="text-red-500">{(errors.title as FieldError).message}</p>
        )}

        <div className="flex flex-col gap-[16px]">
          <label className="text-2xl font-bold text-black">카테고리</label>
          <DropDown
            label={selectedCategory}
            options={categoryOptions}
            setLabel={setSelectedCategory}
            setValue={setSelectedCategory}
            size="large"
            text={
              selectedCategory === '카테고리를 선택해주세요' ? 'gray' : 'black'
            }
            border="gray"
            square={true}
          />
          {isSubmitted && selectedCategory === '카테고리를 선택해주세요' && (
            <p className="text-red-500">카테고리를 선택해주세요!</p>
          )}
        </div>

        <TextAreaField
          label="설명"
          register={register('description', {
            required: '설명을 입력해주세요!',
          })}
          placeholder="설명을 입력해주세요"
        />
        {isSubmitted && errors.description && (
          <p className="text-red-500">
            {(errors.description as FieldError).message}
          </p>
        )}

        <InputField
          type="number"
          label="가격"
          register={register('price', {
            required: '가격을 입력해주세요!',
            valueAsNumber: true,
            min: { value: 1, message: '가격은 양수여야 합니다!' },
          })}
          placeholder="가격을 입력해주세요"
        />
        {isSubmitted && errors.price && (
          <p className="text-red-500">{(errors.price as FieldError).message}</p>
        )}

        <div className="flex flex-col gap-[16px]">
          <label className="text-2xl font-bold text-black">주소</label>
          <input
            onClick={() => setIsPostcodeOpen(true)}
            value={address}
            placeholder="주소를 입력해주세요"
            className="h-[56px] w-full rounded-[4px] border border-gray-79 pb-2 pl-4 pt-2"
          />
          {isSubmitted && !address && (
            <p className="text-red-500">주소를 선택해주세요!</p>
          )}
        </div>

        {isPostcodeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              id="postcode-modal"
              className="w-[400px] max-w-full rounded-lg bg-white p-4 shadow-lg"
            >
              <DaumPostcode onComplete={onCompletePost} />
              <button
                type="button"
                onClick={() => setIsPostcodeOpen(false)}
                className="mt-4 w-full rounded bg-black-nomad px-4 py-2 text-white"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[16px]">
          <label className="text-2xl font-bold text-black">
            예약 가능한 시간대
          </label>
          <ScheduleInput
            time={selectedTime}
            onScheduleChange={onScheduleChange}
            addSchedule={addSchedule}
          />
          {scheduleError && <p className="text-red-500">{scheduleError}</p>}
          {availableTimes.length === 0 && isSubmitted && (
            <p className="text-red-500">일정을 1개이상 추가해주세요!</p>
          )}
          {availableTimes.map((time, index) => (
            <div key={index} className="gap=[21px] flex flex-col">
              <div className="flex items-center justify-between">
                <span className="flex h-[56px] w-[379px] flex-row items-center rounded-[4px] border border-gray-79 pb-[8px] pl-[16px] pt-[8px]">
                  {time.date?.toLocaleDateString('ko-KR') || '날짜 미선택'}
                </span>
                <span className="flex h-[56px] w-[140px] flex-row items-center rounded-[4px] border border-gray-79 pb-[8px] pl-[16px] pt-[8px]">
                  {time.startTime}
                </span>
                <span className="flex h-[56px] w-[140px] flex-row items-center rounded-[4px] border border-gray-79 pb-[8px] pl-[16px] pt-[8px]">
                  {time.endTime}
                </span>
                <button
                  type="button"
                  onClick={() => removeSchedule(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Image
                    src={IconMinusTime}
                    alt="일정을 제거하는 -모양 아이콘"
                    width={56}
                    height={56}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <ImageUploadField
          label="배너 이미지"
          handleImageChange={handleBannerImageChange}
          imagePreview={bannerImageUrl}
          removeImagePreview={removeImagePreview}
        />
        {isSubmitted && !bannerImageUrl && (
          <p className="text-red-500">배너 이미지를 선택해주세요!</p>
        )}

        <div className="flex flex-col gap-[24px]">
          <ImageUploadField
            label="소개 이미지"
            handleImageChange={handleSubImagesChange}
            multiple={true}
            imageUrls={subImageUrls}
            removeImagePreview={removeSubImagePreview}
            removeImagePreviewCallback={removeSubImagePreview}
          />
          <span className="text-2lg font-regular text-gray-4b">
            * 소개 이미지는 최대 4개까지 등록 가능합니다.
          </span>
        </div>
      </form>
    </>
  );
};

export default Register;
