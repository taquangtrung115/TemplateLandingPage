export const ANIMATION_OPTIONS = [
  { value: 'none', label: 'Không hiệu ứng (None)' },
  { value: 'fade-up', label: 'Mờ dần từ dưới lên (Fade Up)' },
  { value: 'fade-down', label: 'Mờ dần từ trên xuống (Fade Down)' },
  { value: 'fade-left', label: 'Mờ dần từ trái sang (Fade Left)' },
  { value: 'fade-right', label: 'Mờ dần từ phải sang (Fade Right)' },
  { value: 'zoom-in', label: 'Phóng to xuất hiện (Zoom In)' },
  { value: 'zoom-out', label: 'Thu nhỏ xuất hiện (Zoom Out)' },
  { value: 'flip-up', label: 'Lật 3D từ dưới lên (Flip Up)' },
  { value: 'bounce', label: 'Nảy vui nhộn (Bounce)' },
  { value: 'float', label: 'Bồng bềnh lơ lửng (Float)' },
  { value: 'pulse', label: 'Nhịp đập phát sáng (Pulse)' },
];

export const getAnimationClass = (animationType = 'fade-up', isVisible = true) => {
  const type = animationType || 'none';
  if (type === 'none') {
    return 'opacity-100';
  }

  if (!isVisible) {
    switch (type) {
      case 'fade-up':
        return 'opacity-0 translate-y-8';
      case 'fade-down':
        return 'opacity-0 -translate-y-8';
      case 'fade-left':
        return 'opacity-0 translate-x-8';
      case 'fade-right':
        return 'opacity-0 -translate-x-8';
      case 'zoom-in':
        return 'opacity-0 scale-90';
      case 'zoom-out':
        return 'opacity-0 scale-110';
      case 'flip-up':
        return 'opacity-0 [transform:perspective(800px)_rotateX(45deg)]';
      case 'bounce':
        return 'opacity-0 translate-y-6';
      case 'float':
        return 'opacity-0';
      case 'pulse':
        return 'opacity-0 scale-95';
      default:
        return 'opacity-0 translate-y-6';
    }
  }

  switch (type) {
    case 'fade-up':
      return 'opacity-100 translate-y-0 animate-fade-up';
    case 'fade-down':
      return 'opacity-100 translate-y-0 animate-fade-down';
    case 'fade-left':
      return 'opacity-100 translate-x-0 animate-fade-left';
    case 'fade-right':
      return 'opacity-100 translate-x-0 animate-fade-right';
    case 'zoom-in':
      return 'opacity-100 scale-100 animate-zoom-in';
    case 'zoom-out':
      return 'opacity-100 scale-100 animate-zoom-out';
    case 'flip-up':
      return 'opacity-100 [transform:perspective(800px)_rotateX(0deg)] animate-flip-up';
    case 'bounce':
      return 'opacity-100 translate-y-0 animate-bounce-subtle';
    case 'float':
      return 'opacity-100 animate-float-slow';
    case 'pulse':
      return 'opacity-100 scale-100 animate-pulse-glow';
    default:
      return 'opacity-100 animate-fade-up';
  }
};

/**
 * Trích xuất danh sách nhân vật từ coupleOrCelebrant theo thứ tự index (person1, person2, person3...)
 */
export const extractPersonsList = (coupleOrCelebrant = {}) => {
  if (!coupleOrCelebrant || typeof coupleOrCelebrant !== 'object') {
    return [
      {
        key: 'person1',
        name: 'Nhân vật chính',
        title: 'Chủ Tiệc',
        avatarUrl: '',
        bio: '',
        parents: '',
        animation: 'fade-up',
      },
    ];
  }

  const keys = Object.keys(coupleOrCelebrant)
    .filter((k) => /^person\d+$/.test(k))
    .sort((a, b) => {
      const numA = parseInt(a.replace('person', ''), 10);
      const numB = parseInt(b.replace('person', ''), 10);
      return numA - numB;
    });

  if (keys.length === 0) {
    return [
      {
        key: 'person1',
        name: 'Nhân vật chính',
        title: 'Chủ Tiệc',
        avatarUrl: '',
        bio: '',
        parents: '',
        animation: 'fade-up',
      },
    ];
  }

  return keys.map((key) => ({
    key,
    name: coupleOrCelebrant[key]?.name || '',
    title: coupleOrCelebrant[key]?.title || '',
    avatarUrl: coupleOrCelebrant[key]?.avatarUrl || '',
    bio: coupleOrCelebrant[key]?.bio || '',
    parents: coupleOrCelebrant[key]?.parents || '',
    animation: coupleOrCelebrant[key]?.animation || 'fade-up',
  }));
};

/**
 * Thêm một nhân vật mới vào coupleOrCelebrant
 */
export const addPersonHelper = (coupleOrCelebrant = {}) => {
  const currentList = extractPersonsList(coupleOrCelebrant);
  const nextIndex = currentList.length + 1;
  const newPersonKey = `person${nextIndex}`;

  const updated = { ...coupleOrCelebrant };
  updated[newPersonKey] = {
    name: `Nhân vật ${nextIndex}`,
    title: 'Người Đại Diện',
    avatarUrl: '',
    bio: '',
    parents: '',
    animation: 'fade-up',
  };

  return updated;
};

/**
 * Xóa một nhân vật khỏi coupleOrCelebrant và re-index các nhân vật còn lại
 * Giữ tối thiểu 1 nhân vật (nếu chỉ có 1 thì không xóa)
 */
export const removePersonHelper = (coupleOrCelebrant = {}, personKeyToRemove) => {
  const currentList = extractPersonsList(coupleOrCelebrant);
  if (currentList.length <= 1) {
    return coupleOrCelebrant; // Giữ tối thiểu 1 person
  }

  const remaining = currentList.filter((p) => p.key !== personKeyToRemove);

  // Giữ lại các thuộc tính không phải person (như type, storyQuote, animation...)
  const updated = {};
  Object.keys(coupleOrCelebrant).forEach((k) => {
    if (!/^person\d+$/.test(k)) {
      updated[k] = coupleOrCelebrant[k];
    }
  });

  // Re-index từ person1, person2...
  remaining.forEach((p, idx) => {
    const newKey = `person${idx + 1}`;
    const { key, ...data } = p;
    updated[newKey] = data;
  });

  return updated;
};
