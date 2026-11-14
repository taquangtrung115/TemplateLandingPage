import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroSection from '../src/components/templates/sections/HeroSection';
import PersonsSection from '../src/components/templates/sections/PersonsSection';
import EventDetailsSection from '../src/components/templates/sections/EventDetailsSection';
import TimelineSection from '../src/components/templates/sections/TimelineSection';
import GallerySection from '../src/components/templates/sections/GallerySection';
import ExtraSections from '../src/components/templates/sections/ExtraSections';
import RsvpSection from '../src/components/templates/sections/RsvpSection';
import WishesSection from '../src/components/templates/sections/WishesSection';
import { LandingPageRenderer } from '../src/components/templates/LandingPageRenderer';

describe('LandingPageRenderer Sub-Components & Responsive Grid', () => {
  describe('PersonsSection Responsive Grid & Highlighting', () => {
    it('applies exact grid class for 1 person (max-w-md mx-auto grid grid-cols-1)', () => {
      const singlePerson = [{ key: 'person1', name: 'Nguyễn Văn A', title: 'Chủ Tiệc' }];
      const { container } = render(
        <PersonsSection couple={{ type: 'birthday' }} personsList={singlePerson} />
      );

      const gridEl = container.querySelector('.max-w-md.mx-auto.grid.grid-cols-1');
      expect(gridEl).toBeInTheDocument();
      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    });

    it('applies exact grid class for 2 persons (max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8)', () => {
      const twoPersons = [
        { key: 'person1', name: 'Chú Rể Tuấn', title: 'Chú Rể' },
        { key: 'person2', name: 'Cô Dâu Hương', title: 'Cô Dâu' },
      ];
      const { container } = render(
        <PersonsSection couple={{ type: 'wedding' }} personsList={twoPersons} />
      );

      const gridEl = container.querySelector(
        '.max-w-4xl.mx-auto.grid.grid-cols-1.md\\:grid-cols-2.gap-8'
      );
      expect(gridEl).toBeInTheDocument();
      expect(screen.getByText('Chú Rể Tuấn')).toBeInTheDocument();
      expect(screen.getByText('Cô Dâu Hương')).toBeInTheDocument();
    });

    it('applies exact grid class for 3 persons (max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6)', () => {
      const threePersons = [
        { key: 'person1', name: 'Diễn Giả 1', title: 'Keynote' },
        { key: 'person2', name: 'Diễn Giả 2', title: 'Expert' },
        { key: 'person3', name: 'Diễn Giả 3', title: 'Guest' },
      ];
      const { container } = render(
        <PersonsSection couple={{ type: 'event' }} personsList={threePersons} />
      );

      const gridEl = container.querySelector(
        '.max-w-6xl.mx-auto.grid.grid-cols-1.md\\:grid-cols-3.gap-6'
      );
      expect(gridEl).toBeInTheDocument();
    });

    it('applies exact grid class for 4+ persons (max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6)', () => {
      const fourPersons = [
        { key: 'person1', name: 'Người 1' },
        { key: 'person2', name: 'Người 2' },
        { key: 'person3', name: 'Người 3' },
        { key: 'person4', name: 'Người 4' },
      ];
      const { container } = render(
        <PersonsSection couple={{ type: 'event' }} personsList={fourPersons} />
      );

      const gridEl = container.querySelector(
        '.max-w-7xl.mx-auto.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4.gap-6'
      );
      expect(gridEl).toBeInTheDocument();
    });

    it('displays .animate-live-edit class when isHighlighted is true', () => {
      const { container, rerender } = render(
        <PersonsSection personsList={[{ name: 'Test' }]} isHighlighted={false} />
      );
      expect(container.querySelector('section')).not.toHaveClass('animate-live-edit');

      rerender(<PersonsSection personsList={[{ name: 'Test' }]} isHighlighted={true} />);
      expect(container.querySelector('section')).toHaveClass('animate-live-edit');
    });
  });

  describe('HeroSection Highlighting & Content', () => {
    it('renders hero title and adds .animate-live-edit on highlight', () => {
      const hero = { title: 'Tuấn & Hương 2026', subtitle: 'Hân hoan báo hỷ', badge: 'SAVE THE DATE' };
      const { container, rerender } = render(
        <HeroSection hero={hero} isHighlighted={false} />
      );

      expect(screen.getByText('Tuấn & Hương 2026')).toBeInTheDocument();
      expect(screen.getByText('Hân hoan báo hỷ')).toBeInTheDocument();
      expect(container.querySelector('header')).not.toHaveClass('animate-live-edit');

      rerender(<HeroSection hero={hero} isHighlighted={true} />);
      expect(container.querySelector('header')).toHaveClass('animate-live-edit');
    });
  });

  describe('EventDetailsSection Highlighting & Content', () => {
    it('renders event details and adds .animate-live-edit on highlight', () => {
      const eventDetails = {
        ceremonyName: 'Tiệc Cưới Hoàng Gia',
        time: '18:00 - 20/12/2026',
        venueName: 'White Palace',
        address: '194 Hoàng Văn Thụ, TP.HCM',
        dressCode: 'White & Gold',
      };
      const { container, rerender } = render(
        <EventDetailsSection eventDetails={eventDetails} isHighlighted={false} />
      );

      expect(screen.getByText('Tiệc Cưới Hoàng Gia')).toBeInTheDocument();
      expect(screen.getByText('White Palace')).toBeInTheDocument();
      expect(screen.getByText('White & Gold')).toBeInTheDocument();
      expect(container.querySelector('section')).not.toHaveClass('animate-live-edit');

      rerender(<EventDetailsSection eventDetails={eventDetails} isHighlighted={true} />);
      expect(container.querySelector('section')).toHaveClass('animate-live-edit');
    });
  });

  describe('TimelineSection Highlighting & Empty Safety', () => {
    it('returns null when timeline array is empty', () => {
      const { container } = render(<TimelineSection timeline={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders timeline events and adds .animate-live-edit on highlight', () => {
      const timeline = [
        { id: 1, time: '17:30', title: 'Đón Khách', description: 'Chụp hình kỷ niệm', icon: 'camera' },
        { id: 2, time: '18:30', title: 'Làm Lễ', description: 'Nghi thức trao nhẫn', icon: 'heart' },
      ];
      const { container, rerender } = render(
        <TimelineSection timeline={timeline} isHighlighted={false} />
      );

      expect(screen.getByText('Đón Khách')).toBeInTheDocument();
      expect(screen.getByText('Làm Lễ')).toBeInTheDocument();
      expect(container.querySelector('section')).not.toHaveClass('animate-live-edit');

      rerender(<TimelineSection timeline={timeline} isHighlighted={true} />);
      expect(container.querySelector('section')).toHaveClass('animate-live-edit');
    });
  });

  describe('GallerySection Lightbox Trigger & Highlighting', () => {
    it('returns null when gallery is empty', () => {
      const { container } = render(<GallerySection gallery={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders gallery items and triggers onOpenLightbox on click', () => {
      const gallery = [{ id: 1, url: 'https://test.com/photo.jpg', caption: 'Kỷ niệm Đà Lạt' }];
      const onOpenMock = vi.fn();
      const { container, rerender } = render(
        <GallerySection gallery={gallery} onOpenLightbox={onOpenMock} isHighlighted={false} />
      );

      expect(screen.getByText('Kỷ niệm Đà Lạt')).toBeInTheDocument();
      const itemEl = screen.getByText('Kỷ niệm Đà Lạt').closest('div');
      fireEvent.click(itemEl);
      expect(onOpenMock).toHaveBeenCalledWith(0);

      rerender(
        <GallerySection gallery={gallery} onOpenLightbox={onOpenMock} isHighlighted={true} />
      );
      expect(container.querySelector('section')).toHaveClass('animate-live-edit');
    });
  });

  describe('ExtraSections Preserved Attributes & Highlighting', () => {
    it('renders Thank You and VietQR sections with exact image alt and copy title', () => {
      const extraSections = [
        {
          id: 'sec-thank-you',
          type: 'thankYou',
          title: 'Tri Ân Quý Khách',
          content: 'Cảm ơn mọi người đã đến!',
          imageUrl: 'https://test.com/thankyou.jpg',
        },
        {
          id: 'sec-gift-qr',
          type: 'giftQr',
          title: 'Hộp Mừng Cưới',
          qrBank: {
            bankName: 'MBBank',
            accountNumber: '0987654321',
            accountHolder: 'NGUYEN VAN A',
          },
        },
      ];
      const handleCopyMock = vi.fn();

      const { container } = render(
        <ExtraSections
          extraSections={extraSections}
          handleCopyStk={handleCopyMock}
          activeEditSection="sec-gift-qr"
        />
      );

      // Verify DOM attributes preservation
      expect(screen.getByAltText('Thank you')).toBeInTheDocument();
      expect(screen.getByAltText('VietQR code')).toBeInTheDocument();

      const copyBtn = screen.getByTitle('Sao chép số tài khoản');
      expect(copyBtn).toBeInTheDocument();
      fireEvent.click(copyBtn);
      expect(handleCopyMock).toHaveBeenCalledWith('0987654321');

      // The activeEditSection="sec-gift-qr" should highlight only the giftQr section
      const sections = container.querySelectorAll('section');
      expect(sections[0]).not.toHaveClass('animate-live-edit');
      expect(sections[1]).toHaveClass('animate-live-edit');
    });
  });

  describe('RsvpSection DOM ID & Highlighting', () => {
    it('preserves id="rsvp-section" and supports .animate-live-edit', () => {
      const { container, rerender } = render(
        <RsvpSection rsvp={{ enabled: true }} isHighlighted={false} />
      );

      const section = container.querySelector('#rsvp-section');
      expect(section).toBeInTheDocument();
      expect(section).not.toHaveClass('animate-live-edit');

      rerender(<RsvpSection rsvp={{ enabled: true }} isHighlighted={true} />);
      expect(container.querySelector('#rsvp-section')).toHaveClass('animate-live-edit');
    });
  });

  describe('WishesSection Highlighting & Content', () => {
    it('renders guestbook title and supports .animate-live-edit', () => {
      const { container, rerender } = render(
        <WishesSection wishes={{ enabled: true }} isHighlighted={false} />
      );

      expect(screen.getByText('Sổ Lưu Bút & Lời Chúc')).toBeInTheDocument();
      expect(container.querySelector('section')).not.toHaveClass('animate-live-edit');

      rerender(<WishesSection wishes={{ enabled: true }} isHighlighted={true} />);
      expect(container.querySelector('section')).toHaveClass('animate-live-edit');
    });
  });

  describe('LandingPageRenderer Orchestrator Integration & Highlight Propagation', () => {
    const mockConfig = {
      theme: { primaryColor: '#e11d48' },
      hero: { title: 'Linh & Nam', eventDate: '2026-12-31' },
      coupleOrCelebrant: {
        person1: { name: 'Nam', title: 'Chú Rể' },
        person2: { name: 'Linh', title: 'Cô Dâu' },
      },
      eventDetails: { ceremonyName: 'Hôn Lễ Linh & Nam' },
      timeline: [{ id: 1, time: '18:00', title: 'Khai Tiệc' }],
      gallery: [{ id: 1, url: 'https://test.com/photo.jpg', caption: 'Ảnh cưới' }],
      rsvp: { enabled: true },
      wishes: { enabled: true },
    };

    it('propagates activeEditSection="hero" to HeroSection with animate-live-edit', () => {
      const { container } = render(
        <LandingPageRenderer config={mockConfig} activeEditSection="hero" />
      );

      const heroEl = container.querySelector('header');
      expect(heroEl).toHaveClass('animate-live-edit');

      const personsSection = screen.getByText('Cô Dâu & Chú Rể').closest('section');
      expect(personsSection).not.toHaveClass('animate-live-edit');
    });

    it('propagates activeEditSection="couple" to PersonsSection with animate-live-edit', () => {
      const { container } = render(
        <LandingPageRenderer config={mockConfig} activeEditSection="couple" />
      );

      const heroEl = container.querySelector('header');
      expect(heroEl).not.toHaveClass('animate-live-edit');

      const personsSection = screen.getByText('Cô Dâu & Chú Rể').closest('section');
      expect(personsSection).toHaveClass('animate-live-edit');
    });
  });
});
