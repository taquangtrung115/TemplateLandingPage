import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { 
  ANIMATION_OPTIONS, 
  getAnimationClass, 
  extractPersonsList, 
  addPersonHelper, 
  removePersonHelper 
} from '../src/utils/animationConstants';
import AnimationSelector from '../src/components/customizer/AnimationSelector';
import ScrollReveal from '../src/components/common/ScrollReveal';
import LandingPageRenderer from '../src/components/templates/LandingPageRenderer';
import { CustomizerSidebar } from '../src/components/customizer/CustomizerSidebar';
import { exportStandaloneHtml } from '../src/utils/htmlExporter';
import { DEFAULT_WEDDING_CONFIG, DEFAULT_BIRTHDAY_CONFIG } from '../src/utils/defaultTemplates';

describe('Animation Constants & Helpers', () => {
  it('should contain comprehensive animation options', () => {
    expect(ANIMATION_OPTIONS.length).toBeGreaterThanOrEqual(10);
    const values = ANIMATION_OPTIONS.map(o => o.value);
    expect(values).toContain('none');
    expect(values).toContain('fade-up');
    expect(values).toContain('zoom-in');
    expect(values).toContain('bounce');
    expect(values).toContain('float');
  });

  it('should return opacity-100 for none animation', () => {
    expect(getAnimationClass('none', true)).toBe('opacity-100');
    expect(getAnimationClass('none', false)).toBe('opacity-100');
  });

  it('should return hidden class when isVisible is false', () => {
    const hiddenUp = getAnimationClass('fade-up', false);
    expect(hiddenUp).toContain('opacity-0');
    expect(hiddenUp).toContain('translate-y-8');

    const hiddenZoom = getAnimationClass('zoom-in', false);
    expect(hiddenZoom).toContain('opacity-0');
    expect(hiddenZoom).toContain('scale-90');
  });

  it('should return animation trigger class when isVisible is true', () => {
    const revealedUp = getAnimationClass('fade-up', true);
    expect(revealedUp).toContain('opacity-100');
    expect(revealedUp).toContain('animate-fade-up');

    const revealedZoom = getAnimationClass('zoom-in', true);
    expect(revealedZoom).toContain('opacity-100');
    expect(revealedZoom).toContain('animate-zoom-in');
  });
});

describe('Dynamic Persons Helpers', () => {
  it('should extract default person if coupleOrCelebrant is empty', () => {
    const list = extractPersonsList({});
    expect(list).toHaveLength(1);
    expect(list[0].key).toBe('person1');
    expect(list[0].title).toBe('Chủ Tiệc');
  });

  it('should extract multiple persons in correct numerical order', () => {
    const coupleData = {
      person2: { name: 'Linh', title: 'Cô Dâu' },
      person1: { name: 'Minh', title: 'Chú Rể' },
      person3: { name: 'Bé Bông', title: 'Thiên Thần Nhỏ' },
      storyQuote: 'Love quote',
    };

    const list = extractPersonsList(coupleData);
    expect(list).toHaveLength(3);
    expect(list[0].key).toBe('person1');
    expect(list[0].name).toBe('Minh');
    expect(list[1].key).toBe('person2');
    expect(list[1].name).toBe('Linh');
    expect(list[2].key).toBe('person3');
    expect(list[2].name).toBe('Bé Bông');
  });

  it('should add new person with next sequential index', () => {
    const initial = {
      person1: { name: 'Minh', title: 'Chú Rể' },
    };

    const added = addPersonHelper(initial);
    expect(added.person2).toBeDefined();
    expect(added.person2.title).toBe('Người Đại Diện');

    const added2 = addPersonHelper(added);
    expect(added2.person3).toBeDefined();
  });

  it('should prevent deleting the only remaining person (keep >= 1)', () => {
    const initial = {
      person1: { name: 'Minh', title: 'Chú Rể' },
    };

    const result = removePersonHelper(initial, 'person1');
    expect(extractPersonsList(result)).toHaveLength(1);
    expect(result.person1).toBeDefined();
  });

  it('should re-index remaining persons when deleting intermediate person', () => {
    const initial = {
      type: 'wedding',
      storyQuote: 'Forever',
      person1: { name: 'Person 1', title: 'P1' },
      person2: { name: 'Person 2', title: 'P2' },
      person3: { name: 'Person 3', title: 'P3' },
      person4: { name: 'Person 4', title: 'P4' },
    };

    // Xóa person2
    const result = removePersonHelper(initial, 'person2');

    // Sau khi xóa person2, phải còn 3 người: person1, person2 (trước là person3), person3 (trước là person4)
    expect(result.type).toBe('wedding');
    expect(result.storyQuote).toBe('Forever');
    expect(result.person1.name).toBe('Person 1');
    expect(result.person2.name).toBe('Person 3');
    expect(result.person3.name).toBe('Person 4');
    expect(result.person4).toBeUndefined();
  });
});

describe('AnimationSelector & ScrollReveal Components', () => {
  it('should render AnimationSelector dropdown', () => {
    render(
      <AnimationSelector
        label="Chọn hiệu ứng test"
        value="fade-up"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Chọn hiệu ứng test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mờ dần từ dưới lên (Fade Up)')).toBeInTheDocument();
  });

  it('should render ScrollReveal wrapper with children', () => {
    render(
      <ScrollReveal animation="zoom-in">
        <div data-testid="child-content">Nội dung hiển thị</div>
      </ScrollReveal>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Nội dung hiển thị')).toBeInTheDocument();
  });

  it('should trigger revealed class via fallback timer for preview scrolling container', async () => {
    vi.useFakeTimers();

    const { container } = render(
      <ScrollReveal animation="fade-up">
        <span>Preview Scroll Child</span>
      </ScrollReveal>
    );

    // Fast-forward past fallback timer (500ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    const wrapper = container.firstChild;
    expect(wrapper.className).toContain('opacity-100');
    expect(wrapper.className).toContain('animate-fade-up');

    vi.useRealTimers();
  });
});

describe('LandingPageRenderer Dynamic Persons Layouts & Details', () => {
  it('renders single person centered layout (1 person)', () => {
    const config1Person = {
      theme: { primaryColor: '#e11d48' },
      coupleOrCelebrant: {
        type: 'birthday',
        person1: { name: 'Bé Bảo An', title: 'Chủ Tiệc', bio: 'Bé tròn 1 tuổi', parents: 'Bố Tuấn - Mẹ Lan' },
      },
    };

    const { container } = render(<LandingPageRenderer config={config1Person} isPreview={true} />);
    expect(screen.getByText('Bé Bảo An')).toBeInTheDocument();
    expect(screen.getByText('Bé tròn 1 tuổi')).toBeInTheDocument();
    expect(screen.getByText('Bố Tuấn - Mẹ Lan')).toBeInTheDocument();
    
    // Check centered grid class for 1 person
    const gridEl = container.querySelector('.max-w-md.mx-auto.grid.grid-cols-1');
    expect(gridEl).not.toBeNull();
  });

  it('renders 2-column balanced layout (2 persons)', () => {
    const config2Persons = {
      theme: { primaryColor: '#e11d48' },
      coupleOrCelebrant: {
        type: 'wedding',
        person1: { name: 'Văn Minh', title: 'Chú Rể' },
        person2: { name: 'Thùy Linh', title: 'Cô Dâu' },
      },
    };

    const { container } = render(<LandingPageRenderer config={config2Persons} isPreview={true} />);
    expect(screen.getByText('Văn Minh')).toBeInTheDocument();
    expect(screen.getByText('Thùy Linh')).toBeInTheDocument();

    const gridEl = container.querySelector('.max-w-4xl.mx-auto.grid.grid-cols-1.md\\:grid-cols-2');
    expect(gridEl).not.toBeNull();
  });

  it('renders 3-column layout (3 persons)', () => {
    const config3Persons = {
      theme: { primaryColor: '#e11d48' },
      coupleOrCelebrant: {
        type: 'event',
        person1: { name: 'Diễn Giả A', title: 'Keynote' },
        person2: { name: 'Diễn Giả B', title: 'Panelist' },
        person3: { name: 'Diễn Giả C', title: 'Moderator' },
      },
    };

    const { container } = render(<LandingPageRenderer config={config3Persons} isPreview={true} />);
    expect(screen.getByText('Diễn Giả A')).toBeInTheDocument();
    expect(screen.getByText('Diễn Giả B')).toBeInTheDocument();
    expect(screen.getByText('Diễn Giả C')).toBeInTheDocument();

    const gridEl = container.querySelector('.max-w-6xl.mx-auto.grid.grid-cols-1.md\\:grid-cols-3');
    expect(gridEl).not.toBeNull();
  });

  it('renders responsive 4-column layout (4+ persons)', () => {
    const config4Persons = {
      theme: { primaryColor: '#e11d48' },
      coupleOrCelebrant: {
        type: 'event',
        person1: { name: 'Thành Viên 1', title: 'Hội đồng' },
        person2: { name: 'Thành Viên 2', title: 'Hội đồng' },
        person3: { name: 'Thành Viên 3', title: 'Hội đồng' },
        person4: { name: 'Thành Viên 4', title: 'Hội đồng' },
      },
    };

    const { container } = render(<LandingPageRenderer config={config4Persons} isPreview={true} />);
    expect(screen.getByText('Thành Viên 1')).toBeInTheDocument();
    expect(screen.getByText('Thành Viên 4')).toBeInTheDocument();

    const gridEl = container.querySelector('.max-w-7xl.mx-auto.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    expect(gridEl).not.toBeNull();
  });
});

describe('LandingPageRenderer Extra Sections (Thank You, VietQR, Q&A, Custom)', () => {
  it('renders Thank You section with image and multiline content', () => {
    const config = {
      theme: { primaryColor: '#e11d48' },
      extraSections: [
        {
          id: 'sec-thank-you',
          type: 'thankYou',
          enabled: true,
          title: 'Lời Cảm Ơn Chân Thành',
          subtitle: 'Tri Ân Khách Mời',
          content: 'Sự hiện diện của quý vị là niềm vinh hạnh lớn nhất của gia đình chúng tôi.',
          imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        },
      ],
    };

    render(<LandingPageRenderer config={config} isPreview={true} />);
    expect(screen.getByText('Lời Cảm Ơn Chân Thành')).toBeInTheDocument();
    expect(screen.getByText('Tri Ân Khách Mời')).toBeInTheDocument();
    expect(screen.getByText(/Sự hiện diện của quý vị là niềm vinh hạnh/)).toBeInTheDocument();
    const img = screen.getByAltText('Thank you');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('images.unsplash.com');
  });

  it('renders VietQR Gift section with auto-generated QR URL and copy account number button', () => {
    const config = {
      theme: { primaryColor: '#e11d48' },
      extraSections: [
        {
          id: 'sec-vietqr',
          type: 'giftQr',
          enabled: true,
          title: 'Mừng Cưới Đôi Uyên Ương',
          subtitle: 'Gửi quà mừng hạnh phúc',
          qrBank: {
            bankName: 'MB',
            accountNumber: '0987654321',
            accountHolder: 'NGUYEN VAN MINH',
          },
        },
      ],
    };

    render(<LandingPageRenderer config={config} isPreview={true} />);
    expect(screen.getByText('Mừng Cưới Đôi Uyên Ương')).toBeInTheDocument();
    expect(screen.getByText('0987654321')).toBeInTheDocument();
    expect(screen.getByText('NGUYEN VAN MINH')).toBeInTheDocument();
    
    // Check auto-generated VietQR URL
    const qrImg = screen.getByAltText('VietQR code');
    expect(qrImg).toBeInTheDocument();
    expect(qrImg.src).toContain('img.vietqr.io/image/MB-0987654321-compact2.jpg');

    // Test copy button
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const copyBtn = screen.getByTitle('Sao chép số tài khoản');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0987654321');
  });

  it('renders Q&A Accordion and allows expanding/collapsing answers', () => {
    const config = {
      theme: { primaryColor: '#e11d48' },
      extraSections: [
        {
          id: 'sec-qa',
          type: 'qa',
          enabled: true,
          title: 'Giải Đáp Thắc Mắc',
          subtitle: 'Thông tin cần biết',
          items: [
            { question: 'Có chỗ đỗ xe ô tô không?', answer: 'Có bãi đỗ xe miễn phí ngay tại tầng hầm trung tâm tiệc cưới.' },
            { question: 'Dress code là gì?', answer: 'Trang phục màu Pastel hoặc Trắng thanh lịch.' },
          ],
        },
      ],
    };

    render(<LandingPageRenderer config={config} isPreview={true} />);
    expect(screen.getByText('Giải Đáp Thắc Mắc')).toBeInTheDocument();
    expect(screen.getByText('Có chỗ đỗ xe ô tô không?')).toBeInTheDocument();
    expect(screen.getByText('Dress code là gì?')).toBeInTheDocument();

    // Answers should initially not be in the document
    expect(screen.queryByText(/Có bãi đỗ xe miễn phí/)).not.toBeInTheDocument();

    // Click on question to expand answer
    const q1Button = screen.getByText('Có chỗ đỗ xe ô tô không?');
    fireEvent.click(q1Button);

    expect(screen.getByText(/Có bãi đỗ xe miễn phí/)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(q1Button);
    expect(screen.queryByText(/Có bãi đỗ xe miễn phí/)).not.toBeInTheDocument();
  });

  it('renders Custom block section with title and text', () => {
    const config = {
      theme: { primaryColor: '#e11d48' },
      extraSections: [
        {
          id: 'sec-custom',
          type: 'custom',
          enabled: true,
          title: 'Lưu Ý Quan Trọng',
          subtitle: 'Thông Báo',
          content: 'Khách mời vui lòng đến trước 15 phút để ổn định vị trí.',
        },
      ],
    };

    render(<LandingPageRenderer config={config} isPreview={true} />);
    expect(screen.getByText('Lưu Ý Quan Trọng')).toBeInTheDocument();
    expect(screen.getByText('Khách mời vui lòng đến trước 15 phút để ổn định vị trí.')).toBeInTheDocument();
  });

  it('does NOT render extra section if enabled is false', () => {
    const config = {
      theme: { primaryColor: '#e11d48' },
      extraSections: [
        {
          id: 'sec-disabled',
          type: 'custom',
          enabled: false,
          title: 'Khối Đã Bị Tắt',
          content: 'Nội dung này không được xuất hiện',
        },
      ],
    };

    render(<LandingPageRenderer config={config} isPreview={true} />);
    expect(screen.queryByText('Khối Đã Bị Tắt')).not.toBeInTheDocument();
  });

  it('safely renders DEFAULT_WEDDING_CONFIG and DEFAULT_BIRTHDAY_CONFIG', () => {
    const { container: wContainer } = render(
      <LandingPageRenderer config={DEFAULT_WEDDING_CONFIG} isPreview={true} />
    );
    expect(screen.getByText('Minh & Linh')).toBeInTheDocument();
    expect(wContainer.querySelector('#rsvp-section')).toBeInTheDocument();

    const { container: bContainer } = render(
      <LandingPageRenderer config={DEFAULT_BIRTHDAY_CONFIG} isPreview={true} />
    );
    expect(screen.getByText('Hoàng Nam')).toBeInTheDocument();
    expect(bContainer).toBeInTheDocument();
  });

  it('safely renders empty or legacy config without throwing errors', () => {
    const emptyConfig = {};
    const { container } = render(<LandingPageRenderer config={emptyConfig} isPreview={true} />);
    expect(container).toBeInTheDocument();
  });
});

describe('Standalone HTML Exporter (exportStandaloneHtml)', () => {
  let capturedHtml = '';
  const originalBlob = global.Blob;

  beforeEach(() => {
    capturedHtml = '';
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    vi.spyOn(global, 'Blob').mockImplementation(function(chunks, options) {
      if (chunks && chunks[0]) {
        capturedHtml = chunks[0];
      }
      return new originalBlob(chunks, options);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports standalone HTML containing keyframes, offline scripts, dynamic persons, and extra sections', () => {
    const testConfig = {
      hero: {
        title: 'Hải & Yến',
        subtitle: 'Ngày hạnh phúc',
        coverImageUrl: 'https://images.unsplash.com/photo-1',
      },
      coupleOrCelebrant: {
        type: 'wedding',
        person1: { name: 'Thanh Hải', title: 'Chú Rể' },
        person2: { name: 'Bạch Yến', title: 'Cô Dâu' },
        person3: { name: 'Bé Gấu', title: 'Thiên thần nhỏ' },
      },
      extraSections: [
        {
          id: 'sec-1',
          type: 'giftQr',
          enabled: true,
          title: 'Hộp Quà Cưới',
          qrBank: { bankName: 'VCB', accountNumber: '1234567890', accountHolder: 'THANH HAI' },
        },
        {
          id: 'sec-2',
          type: 'qa',
          enabled: true,
          title: 'Hỏi Đáp Tiệc',
          items: [{ question: 'Có xe đưa đón không?', answer: 'Có xe tại Nhà hát lớn lúc 16h.' }],
        },
      ],
    };

    exportStandaloneHtml(testConfig, 'Hải & Yến Wedding');

    expect(capturedHtml).toContain('<!DOCTYPE html>');
    // Keyframe animations
    expect(capturedHtml).toContain('@keyframes fade-up');
    expect(capturedHtml).toContain('@keyframes zoom-in');
    expect(capturedHtml).toContain('@keyframes bounce-subtle');
    // Offline script
    expect(capturedHtml).toContain('function initScrollReveal()');
    expect(capturedHtml).toContain('IntersectionObserver');
    // Dynamic persons
    expect(capturedHtml).toContain('Thanh Hải');
    expect(capturedHtml).toContain('Bạch Yến');
    expect(capturedHtml).toContain('Bé Gấu');
    // Extra sections
    expect(capturedHtml).toContain('Hộp Quà Cưới');
    expect(capturedHtml).toContain('1234567890');
    expect(capturedHtml).toContain('Có xe đưa đón không?');
    // Escaped config
    expect(capturedHtml).toContain('const CONFIG = {');
  });
});

describe('CustomizerSidebar Persons & Extra Sections Management', () => {
  it('disables delete button when only 1 person exists and enables adding new person', () => {
    const mockConfig = {
      theme: {},
      coupleOrCelebrant: {
        type: 'wedding',
        person1: { name: 'Minh', title: 'Chú Rể' },
      },
    };
    const mockOnChange = vi.fn();
    const mockMetadata = { title: 'Test Title' };

    render(
      <CustomizerSidebar
        config={mockConfig}
        onChange={mockOnChange}
        metadata={mockMetadata}
        onMetadataChange={() => {}}
      />
    );

    // Switch to "couple" tab
    const coupleTabBtn = screen.getByRole('button', { name: /nhân vật \(dynamic\)/i });
    fireEvent.click(coupleTabBtn);

    // Delete button should be disabled for 1 person
    const deleteBtn = screen.getByTitle('Cần giữ tối thiểu 1 nhân vật');
    expect(deleteBtn).toBeDisabled();

    // Click "+ Thêm nhân vật" button
    const addBtn = screen.getByRole('button', { name: /thêm nhân vật/i });
    fireEvent.click(addBtn);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedCouple = mockOnChange.mock.calls[0][0].coupleOrCelebrant;
    expect(updatedCouple.person2).toBeDefined();
    expect(updatedCouple.person2.title).toBe('Người Đại Diện');
  });

  it('allows adding Extra Sections from sidebar tabs', () => {
    const mockConfig = {
      theme: {},
      extraSections: [],
    };
    const mockOnChange = vi.fn();

    render(
      <CustomizerSidebar
        config={mockConfig}
        onChange={mockOnChange}
        metadata={{ title: 'Test' }}
        onMetadataChange={() => {}}
      />
    );

    // Switch to extra sections tab
    const extraTabBtn = screen.getByRole('button', { name: /mở rộng \(sections\)/i });
    fireEvent.click(extraTabBtn);

    // Add Thank you section
    const addThankYouBtn = screen.getByRole('button', { name: /\+ lời cảm ơn/i });
    fireEvent.click(addThankYouBtn);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        extraSections: expect.arrayContaining([
          expect.objectContaining({ type: 'thankYou' }),
        ]),
      })
    );

    // Add VietQR section
    const addQrBtn = screen.getByRole('button', { name: /\+ quà vietqr/i });
    fireEvent.click(addQrBtn);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        extraSections: expect.arrayContaining([
          expect.objectContaining({ type: 'giftQr' }),
        ]),
      })
    );

    // Add Q&A section
    const addQaBtn = screen.getByRole('button', { name: /\+ hỏi đáp q&a/i });
    fireEvent.click(addQaBtn);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        extraSections: expect.arrayContaining([
          expect.objectContaining({ type: 'qa' }),
        ]),
      })
    );
  });
});
