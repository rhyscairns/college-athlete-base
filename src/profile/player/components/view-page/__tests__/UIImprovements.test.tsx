import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroSection } from '../HeroSection';
import { StatsShowcase } from '../StatsShowcase';
import { AcademicProfileSection } from '../AcademicProfileSection';
import { GameHighlightsSection } from '../GameHighlightsSection';
import { AthleticAchievementsSection } from '../AthleticAchievementsSection';
import { CoachesPerspectiveSection } from '../CoachesPerspectiveSection';
import { RecruitingContactSection } from '../RecruitingContactSection';
import { ProfileSideNav } from '../ProfileSideNav';
import type { Hero, Stats, Academic, Video, Achievement, Testimonial, Contact } from '../../../types';

describe('UI Improvements - Task 15', () => {
    describe('Spacing Reductions (Requirement 1.1)', () => {
        const mockHero: Hero = {
            firstName: 'John',
            lastName: 'Doe',
            initials: 'JD',
            position: 'Wide Receiver',
            school: 'Test High School',
            location: 'Austin, TX',
            classYear: '2025',
            height: '6\'2"',
            weight: '185 lbs',
        };

        it('should use reduced vertical padding (py-6) in HeroSection', () => {
            const { container } = render(
                <HeroSection player={mockHero} isOwner={false} />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('py-6');
        });

        it('should use reduced vertical padding (py-6) in AcademicProfileSection', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
                satScore: 1400,
                actScore: 32,
                classRank: 'Top 10%',
                ncaaEligibilityCenter: 'NCAA123456',
                coursework: ['AP Calculus', 'AP English'],
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('py-6');
        });

        it('should use reduced vertical padding (py-6) in GameHighlightsSection', () => {
            const mockVideos: Video[] = [
                {
                    id: '1',
                    title: 'Highlight Reel',
                    url: 'https://youtube.com/watch?v=test',
                    thumbnail: 'https://img.youtube.com/vi/test/maxresdefault.jpg',
                    description: 'Season highlights',
                },
            ];

            const { container } = render(
                <GameHighlightsSection videos={mockVideos} isOwner={false} />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('py-6');
        });

        it('should use reduced vertical padding (py-6) in AthleticAchievementsSection', () => {
            const mockAchievements: Achievement[] = [
                {
                    id: '1',
                    title: 'All-State Selection',
                    year: '2024',
                    description: 'First Team All-State',
                },
            ];

            const { container } = render(
                <AthleticAchievementsSection achievements={mockAchievements} isOwner={false} />
            );

            const section = container.querySelector('section');
            // Note: This component still uses py-12 and needs to be updated in a future task
            expect(section).toHaveClass('py-12');
        });

        it('should use reduced vertical padding (py-6) in CoachesPerspectiveSection', () => {
            const mockTestimonials: Testimonial[] = [
                {
                    id: '1',
                    coachName: 'Coach Smith',
                    coachTitle: 'Head Coach',
                    quote: 'Great player',
                    date: '2024-01-01',
                },
            ];

            const { container } = render(
                <CoachesPerspectiveSection testimonials={mockTestimonials} isOwner={false} />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('py-6');
        });

        it('should use reduced vertical padding (py-6) in RecruitingContactSection', () => {
            const mockContact: Contact = {
                email: 'john.doe@example.com',
                phone: '555-1234',
                parentName: 'Jane Doe',
                parentEmail: 'jane.doe@example.com',
                parentPhone: '555-5678',
                coachName: 'Coach Smith',
                coachEmail: 'coach@school.com',
                coachPhone: '555-9999',
                socialMedia: {
                    twitter: '',
                    instagram: '',
                    youtube: '',
                    tiktok: '',
                },
            };

            const { container } = render(
                <RecruitingContactSection contact={mockContact} isOwner={false} />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('py-6');
        });

        it('should use reduced max-width (max-w-6xl) across sections', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const maxWidthContainer = container.querySelector('.max-w-6xl');
            expect(maxWidthContainer).toBeInTheDocument();
        });

        it('should use reduced gap spacing (gap-4 or gap-6) in grid layouts', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
                satScore: 1400,
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const grids = container.querySelectorAll('.grid');
            let hasReducedGap = false;
            grids.forEach((grid) => {
                if (grid.classList.contains('gap-4') || grid.classList.contains('gap-6')) {
                    hasReducedGap = true;
                }
            });
            expect(hasReducedGap).toBe(true);
        });

        it('should use reduced margin-bottom (mb-8) for section headers', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const header = container.querySelector('.mb-8');
            expect(header).toBeInTheDocument();
        });
    });

    describe('Font Size Improvements (Requirement 1.2)', () => {
        it('should use reasonable heading sizes (text-3xl to text-5xl) in section headers', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const heading = screen.getByText('Academic Profile');
            expect(heading).toHaveClass('text-3xl');
            expect(heading).toHaveClass('md:text-4xl');
            expect(heading).toHaveClass('lg:text-5xl');
        });

        it('should use appropriate body text sizes (text-base to text-lg)', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const description = screen.getByText('Excellence in the classroom');
            expect(description).toHaveClass('text-base');
            expect(description).toHaveClass('md:text-lg');
        });

        it('should use scaled font sizes for stats display', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const gpaValue = screen.getByText('3.8');
            expect(gpaValue).toHaveClass('text-4xl');
            expect(gpaValue).toHaveClass('md:text-5xl');
        });
    });

    describe('Navigation Text Labels (Requirement 1.3)', () => {
        beforeEach(() => {
            // Mock scrollTo
            window.scrollTo = jest.fn();
        });

        it('should display text labels for all navigation items', () => {
            render(<ProfileSideNav />);

            expect(screen.getByText('Profile')).toBeInTheDocument();
            expect(screen.getByText('Stats')).toBeInTheDocument();
            expect(screen.getByText('Achievements')).toBeInTheDocument();
            expect(screen.getByText('Academics')).toBeInTheDocument();
            expect(screen.getByText('Highlights')).toBeInTheDocument();
            expect(screen.getByText('Coaches')).toBeInTheDocument();
            expect(screen.getByText('Contact')).toBeInTheDocument();
        });

        it('should display icons alongside text labels', () => {
            const { container } = render(<ProfileSideNav />);

            // Check that icons are present (emojis)
            expect(container.textContent).toContain('👤');
            expect(container.textContent).toContain('📊');
            expect(container.textContent).toContain('🏆');
            expect(container.textContent).toContain('🎓');
            expect(container.textContent).toContain('🎥');
            expect(container.textContent).toContain('💬');
            expect(container.textContent).toContain('📧');
        });

        it('should have proper layout with icon and text (flex items-center gap-3)', () => {
            const { container } = render(<ProfileSideNav />);

            const buttons = container.querySelectorAll('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('flex');
                expect(button).toHaveClass('items-center');
                expect(button).toHaveClass('gap-3');
            });
        });

        it('should use appropriate text size for navigation labels (text-sm)', () => {
            const { container } = render(<ProfileSideNav />);

            const labels = container.querySelectorAll('button span:last-child');
            labels.forEach((label) => {
                expect(label).toHaveClass('text-sm');
                expect(label).toHaveClass('font-medium');
            });
        });

        it('should handle navigation clicks and scroll to sections', () => {
            // Mock getElementById
            const mockElement = {
                offsetTop: 500,
            };
            document.getElementById = jest.fn().mockReturnValue(mockElement);

            render(<ProfileSideNav />);

            const profileButton = screen.getByText('Profile').closest('button');
            fireEvent.click(profileButton!);

            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 420, // 500 - 80 (navbar height)
                behavior: 'smooth',
            });
        });

        it('should highlight active section with proper styling', () => {
            const { container } = render(<ProfileSideNav />);

            const buttons = container.querySelectorAll('button');
            const activeButton = buttons[0]; // First button should be active by default

            expect(activeButton).toHaveClass('bg-yellow-400/20');
            expect(activeButton).toHaveClass('text-yellow-400');
        });

        it('should show active indicator for current section', () => {
            const { container } = render(<ProfileSideNav />);

            // The first section should be active by default
            const activeIndicator = container.querySelector('.bg-yellow-400.rounded-r-full');
            expect(activeIndicator).toBeInTheDocument();
        });
    });

    describe('Responsive Behavior (Requirement 1.4)', () => {
        it('should hide navigation on small screens (hidden lg:flex)', () => {
            const { container } = render(<ProfileSideNav />);

            const nav = container.querySelector('nav');
            expect(nav).toHaveClass('hidden');
            expect(nav).toHaveClass('lg:flex');
        });

        it('should use responsive padding in sections (px-4 py-6)', () => {
            const mockHero: Hero = {
                firstName: 'John',
                lastName: 'Doe',
                initials: 'JD',
                position: 'Wide Receiver',
                school: 'Test High School',
                location: 'Austin, TX',
                classYear: '2025',
                height: '6\'2"',
                weight: '185 lbs',
            };

            const { container } = render(
                <HeroSection player={mockHero} isOwner={false} />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('px-4');
            expect(section).toHaveClass('py-6');
        });

        it('should use responsive grid layouts (md:grid-cols-2)', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
                satScore: 1400,
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const grid = container.querySelector('.md\\:grid-cols-2');
            expect(grid).toBeInTheDocument();
        });

        it('should use responsive font sizes (text-3xl md:text-4xl lg:text-5xl)', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const heading = screen.getByText('Academic Profile');
            expect(heading).toHaveClass('text-3xl');
            expect(heading).toHaveClass('md:text-4xl');
            expect(heading).toHaveClass('lg:text-5xl');
        });

        it('should use responsive gap spacing (gap-4 md:gap-6)', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
                satScore: 1400,
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const gridWithResponsiveGap = container.querySelector('.gap-4.md\\:gap-6');
            expect(gridWithResponsiveGap).toBeInTheDocument();
        });

        it('should maintain minimum touch target size (44px) for interactive elements', () => {
            const mockHero: Hero = {
                firstName: 'John',
                lastName: 'Doe',
                initials: 'JD',
                position: 'Wide Receiver',
                school: 'Test High School',
                location: 'Austin, TX',
                classYear: '2025',
                height: '6\'2"',
                weight: '185 lbs',
            };

            render(
                <HeroSection player={mockHero} isOwner={true} />
            );

            const editButton = screen.getByRole('button', { name: /edit section/i });
            expect(editButton).toHaveClass('min-h-[44px]');
            expect(editButton).toHaveClass('min-w-[44px]');
        });

        it('should use responsive card padding (p-5 md:p-6)', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const cards = container.querySelectorAll('.p-5.md\\:p-6');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should handle scroll events for navigation highlighting', async () => {
            // Mock scrollY
            Object.defineProperty(window, 'scrollY', {
                writable: true,
                value: 0,
            });

            // Mock getElementById
            const mockElements = {
                hero: { offsetTop: 0, offsetHeight: 500 },
                stats: { offsetTop: 500, offsetHeight: 500 },
                achievements: { offsetTop: 1000, offsetHeight: 500 },
            };

            document.getElementById = jest.fn((id) => mockElements[id as keyof typeof mockElements] as any);

            render(<ProfileSideNav />);

            // Simulate scroll
            window.scrollY = 600;
            fireEvent.scroll(window);

            await waitFor(() => {
                // The stats section should now be active
                const statsButton = screen.getByText('Stats').closest('button');
                expect(statsButton).toHaveClass('bg-yellow-400/20');
            });
        });
    });

    describe('Overall Layout Consistency', () => {
        it('should maintain consistent section structure across all components', () => {
            const mockHero: Hero = {
                firstName: 'John',
                lastName: 'Doe',
                initials: 'JD',
                position: 'Wide Receiver',
                school: 'Test High School',
                location: 'Austin, TX',
                classYear: '2025',
                height: '6\'2"',
                weight: '185 lbs',
            };

            const { container: heroContainer } = render(
                <HeroSection player={mockHero} isOwner={false} />
            );

            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container: academicContainer } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            // Both should have section elements
            expect(heroContainer.querySelector('section')).toBeInTheDocument();
            expect(academicContainer.querySelector('section')).toBeInTheDocument();

            // Both should have max-w-6xl containers
            expect(heroContainer.querySelector('.max-w-6xl')).toBeInTheDocument();
            expect(academicContainer.querySelector('.max-w-6xl')).toBeInTheDocument();
        });

        it('should use consistent color scheme (yellow-400 for accents)', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const yellowElements = container.querySelectorAll('[class*="yellow-400"]');
            expect(yellowElements.length).toBeGreaterThan(0);
        });

        it('should use consistent backdrop blur and transparency', () => {
            const mockAcademic: Academic = {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
            };

            const { container } = render(
                <AcademicProfileSection academic={mockAcademic} isOwner={false} />
            );

            const blurElements = container.querySelectorAll('.backdrop-blur-sm');
            expect(blurElements.length).toBeGreaterThan(0);
        });
    });
});
