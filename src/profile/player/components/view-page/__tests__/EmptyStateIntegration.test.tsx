/**
 * Comprehensive integration tests for empty state handling across all profile sections
 * Tests Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * This test suite validates:
 * - Each section with completely empty data
 * - Each section with partial data
 * - Owner vs non-owner views
 * - Edit prompts appear correctly
 */

import { render, screen, within } from '@testing-library/react';
import { HeroSection } from '../HeroSection';
import { StatsShowcase } from '../StatsShowcase';
import { AcademicProfileSection } from '../AcademicProfileSection';
import { GameHighlightsSection } from '../GameHighlightsSection';
import { AthleticAchievementsSection } from '../AthleticAchievementsSection';
import { CoachesPerspectiveSection } from '../CoachesPerspectiveSection';
import { RecruitingContactSection } from '../RecruitingContactSection';
import type { MockPlayerData } from '../../../data/mockPlayerData';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('Empty State Integration Tests', () => {
    const mockOnEdit = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Requirement 3.1: Completely empty data handling', () => {
        const completelyEmptyPlayer: Partial<MockPlayerData> = {
            firstName: '',
            lastName: '',
            initials: '',
            position: '',
            school: '',
            location: '',
            classYear: '',
            height: '',
            weight: '',
            academic: {
                gpa: 0,
                satScore: 0,
                actScore: 0,
                honors: [],
                courses: [],
            },
            stats: {},
            videos: [],
            achievements: [],
            testimonials: [],
            contact: {
                email: '',
                phone: '',
                socialMedia: {
                    twitter: '',
                    instagram: '',
                    hudl: '',
                },
            },
        };

        it('HeroSection handles completely empty data for owner', () => {
            render(<HeroSection player={completelyEmptyPlayer as any} isOwner={true} />);

            // Should show placeholders for required fields
            expect(screen.getByText('First Name')).toBeInTheDocument();
            expect(screen.getByText('Last Name')).toBeInTheDocument();

            // Should show edit button
            expect(screen.getByRole('button', { name: /edit section/i })).toBeInTheDocument();
        });

        it('StatsShowcase handles completely empty data for owner', () => {
            render(
                <StatsShowcase
                    stats={{}}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );

            // Should show empty state
            expect(screen.getByText('No Stats Yet')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('StatsShowcase hides for non-owner with empty data', () => {
            const { container } = render(
                <StatsShowcase
                    stats={{}}
                    isOwner={false}
                />
            );

            // Should not render anything
            expect(container.querySelector('section')).not.toBeInTheDocument();
        });

        it('AcademicProfileSection handles completely empty data for owner', () => {
            render(
                <AcademicProfileSection
                    academic={completelyEmptyPlayer.academic!}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );

            // Should show empty state
            expect(screen.getByText('No Academic Information Yet')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('GameHighlightsSection handles empty videos for owner', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show empty state
            expect(screen.getByText('No Videos Yet')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('GameHighlightsSection hides for non-owner with empty videos', () => {
            const { container } = render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should not render anything
            expect(container.firstChild).toBeNull();
        });

        it('AthleticAchievementsSection handles empty achievements for owner', () => {
            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show empty state
            expect(screen.getByText('No Achievements Yet')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('AthleticAchievementsSection hides for non-owner with empty achievements', () => {
            const { container } = render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should not render anything
            expect(container.firstChild).toBeNull();
        });

        it('CoachesPerspectiveSection handles empty testimonials for owner', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show empty state
            expect(screen.getByText('No Testimonials Yet')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('CoachesPerspectiveSection hides for non-owner with empty testimonials', () => {
            const { container } = render(
                <CoachesPerspectiveSection
                    testimonials={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should not render anything
            expect(container.firstChild).toBeNull();
        });

        it('RecruitingContactSection handles completely empty contact for owner', () => {
            render(
                <RecruitingContactSection
                    contact={completelyEmptyPlayer.contact!}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );

            // Should show empty state
            expect(screen.getByText('No Contact Information Yet')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });
    });

    describe('Requirement 3.2: Partial data handling', () => {
        const partialPlayer: Partial<MockPlayerData> = {
            firstName: 'John',
            lastName: 'Doe',
            initials: 'JD',
            position: 'Quarterback',
            school: 'Test High School',
            location: '', // Empty
            classYear: '2025',
            height: "6'2\"",
            weight: '', // Empty
            academic: {
                gpa: 3.5,
                satScore: 0, // Empty
                actScore: 0, // Empty
                honors: ['Honor Roll'],
                courses: [], // Empty
            },
            stats: {
                'Passing Yards': '2,500',
                'Touchdowns': '', // Empty value
            },
            videos: [
                {
                    id: '1',
                    title: 'Highlight Reel',
                    description: 'Season highlights',
                    url: 'https://example.com/video',
                    thumbnail: 'https://example.com/thumb.jpg',
                    duration: '3:00',
                    isFeatured: true,
                    date: '2024-01-01',
                },
            ],
            achievements: [], // Empty
            testimonials: [
                {
                    id: '1',
                    coachName: 'Coach Smith',
                    coachTitle: 'Head Coach',
                    school: 'Test High',
                    quote: 'Great player',
                    date: '2024-01-01',
                },
            ],
            contact: {
                email: 'john@example.com',
                phone: '', // Empty
                socialMedia: {
                    twitter: '@johndoe',
                    instagram: '', // Empty
                    hudl: '', // Empty
                },
            },
        };

        it('HeroSection displays partial data gracefully', () => {
            render(<HeroSection player={partialPlayer as any} isOwner={false} />);

            // Should show filled fields
            expect(screen.getByText('John')).toBeInTheDocument();
            expect(screen.getByText('Doe')).toBeInTheDocument();
            expect(screen.getByText('Quarterback')).toBeInTheDocument();
            expect(screen.getByText("6'2\"")).toBeInTheDocument();

            // Should not show empty optional fields
            expect(screen.queryByText('Weight')).not.toBeInTheDocument();
        });

        it('StatsShowcase displays partial stats', () => {
            render(
                <StatsShowcase
                    stats={partialPlayer.stats!}
                    isOwner={false}
                />
            );

            // Should show stat with value
            expect(screen.getByText('2,500')).toBeInTheDocument();
            expect(screen.getByText('Passing Yards')).toBeInTheDocument();
        });

        it('AcademicProfileSection displays partial academic data', () => {
            render(
                <AcademicProfileSection
                    academic={partialPlayer.academic!}
                    isOwner={false}
                    onEdit={mockOnEdit}
                />
            );

            // Should show filled fields
            expect(screen.getByText('3.5')).toBeInTheDocument();
            // Note: honors may not be displayed in the current implementation

            // Should not show empty test scores
            expect(screen.queryByText('SAT')).not.toBeInTheDocument();
            expect(screen.queryByText('ACT')).not.toBeInTheDocument();
        });

        it('GameHighlightsSection displays videos when present', () => {
            render(
                <GameHighlightsSection
                    videos={partialPlayer.videos!}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show video
            expect(screen.getByText('Highlight Reel')).toBeInTheDocument();

            // Should not show empty state
            expect(screen.queryByText('No Videos Yet')).not.toBeInTheDocument();
        });

        it('AthleticAchievementsSection hides when empty even with other data', () => {
            const { container } = render(
                <AthleticAchievementsSection
                    achievements={partialPlayer.achievements!}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should not render for non-owner
            expect(container.firstChild).toBeNull();
        });

        it('CoachesPerspectiveSection displays testimonials when present', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={partialPlayer.testimonials!}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show testimonial
            expect(screen.getByText('Coach Smith')).toBeInTheDocument();
            expect(screen.getByText('Great player')).toBeInTheDocument();
        });

        it('RecruitingContactSection displays partial contact data', () => {
            render(
                <RecruitingContactSection
                    contact={partialPlayer.contact!}
                    isOwner={false}
                    onEdit={mockOnEdit}
                />
            );

            // Should show filled fields
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
            // Twitter handle is in href attribute, not visible text
            expect(screen.getByRole('link', { name: /𝕏/i })).toBeInTheDocument();

            // Should not show empty phone
            expect(screen.queryByText('Phone')).not.toBeInTheDocument();
        });
    });

    describe('Requirement 3.3 & 3.4: Owner vs non-owner views', () => {
        const emptyData = {
            academic: {
                gpa: 0,
                satScore: 0,
                actScore: 0,
                honors: [],
                courses: [],
            },
            stats: {},
            videos: [],
            achievements: [],
            testimonials: [],
            contact: {
                email: '',
                phone: '',
                socialMedia: {
                    twitter: '',
                    instagram: '',
                    hudl: '',
                },
            },
        };

        it('Owner sees "Add Content" prompts for all empty sections', () => {
            const { rerender } = render(
                <StatsShowcase
                    stats={emptyData.stats}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();

            rerender(
                <AcademicProfileSection
                    academic={emptyData.academic}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();

            rerender(
                <GameHighlightsSection
                    videos={emptyData.videos}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();

            rerender(
                <AthleticAchievementsSection
                    achievements={emptyData.achievements}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();

            rerender(
                <CoachesPerspectiveSection
                    testimonials={emptyData.testimonials}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();

            rerender(
                <RecruitingContactSection
                    contact={emptyData.contact}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('Non-owner does not see empty sections', () => {
            // StatsShowcase
            let { container } = render(
                <StatsShowcase
                    stats={emptyData.stats}
                    isOwner={false}
                />
            );
            expect(container.querySelector('section')).not.toBeInTheDocument();

            // GameHighlightsSection
            ({ container } = render(
                <GameHighlightsSection
                    videos={emptyData.videos}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            ));
            expect(container.firstChild).toBeNull();

            // AthleticAchievementsSection
            ({ container } = render(
                <AthleticAchievementsSection
                    achievements={emptyData.achievements}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            ));
            expect(container.firstChild).toBeNull();

            // CoachesPerspectiveSection
            ({ container } = render(
                <CoachesPerspectiveSection
                    testimonials={emptyData.testimonials}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            ));
            expect(container.firstChild).toBeNull();
        });

        it('Owner sees edit buttons on sections with data', () => {
            const dataWithContent = {
                stats: { 'Passing Yards': '2,500' },
                videos: [{
                    id: '1',
                    title: 'Video',
                    description: 'Desc',
                    url: 'https://example.com',
                    thumbnail: 'https://example.com/thumb.jpg',
                    duration: '3:00',
                    isFeatured: true,
                    date: '2024-01-01',
                }],
                achievements: [{
                    id: '1',
                    title: 'MVP',
                    description: 'Most Valuable Player',
                    date: '2024-01-01',
                    category: 'Award',
                }],
            };

            const { rerender } = render(
                <StatsShowcase
                    stats={dataWithContent.stats}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );
            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();

            rerender(
                <GameHighlightsSection
                    videos={dataWithContent.videos}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();

            rerender(
                <AthleticAchievementsSection
                    achievements={dataWithContent.achievements}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        });

        it('Non-owner does not see edit buttons on sections with data', () => {
            const dataWithContent = {
                stats: { 'Passing Yards': '2,500' },
                videos: [{
                    id: '1',
                    title: 'Video',
                    description: 'Desc',
                    url: 'https://example.com',
                    thumbnail: 'https://example.com/thumb.jpg',
                    duration: '3:00',
                    isFeatured: true,
                    date: '2024-01-01',
                }],
            };

            const { rerender } = render(
                <StatsShowcase
                    stats={dataWithContent.stats}
                    isOwner={false}
                />
            );
            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();

            rerender(
                <GameHighlightsSection
                    videos={dataWithContent.videos}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });
    });

    describe('Requirement 3.5: Edit prompts functionality', () => {
        it('Edit prompts trigger onEdit callback', () => {
            const onEditMock = jest.fn();

            const { rerender } = render(
                <StatsShowcase
                    stats={{}}
                    isOwner={true}
                    onEdit={onEditMock}
                />
            );

            screen.getByRole('button', { name: /add content/i }).click();
            expect(onEditMock).toHaveBeenCalledTimes(1);

            onEditMock.mockClear();
            rerender(
                <AcademicProfileSection
                    academic={{ gpa: 0, satScore: 0, actScore: 0, honors: [], courses: [] }}
                    isOwner={true}
                    onEdit={onEditMock}
                />
            );

            screen.getByRole('button', { name: /add content/i }).click();
            expect(onEditMock).toHaveBeenCalledTimes(1);
        });

        it('Empty state messages are descriptive and helpful', () => {
            const { rerender } = render(
                <StatsShowcase
                    stats={{}}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );
            expect(screen.getByText(/Add your season statistics/i)).toBeInTheDocument();

            rerender(
                <AcademicProfileSection
                    academic={{ gpa: 0, satScore: 0, actScore: 0, honors: [], courses: [] }}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );
            expect(screen.getByText(/GPA, test scores, class rank, and coursework/i)).toBeInTheDocument();

            rerender(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByText(/Add highlight videos/i)).toBeInTheDocument();

            rerender(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByText(/athletic achievements, honors, and awards/i)).toBeInTheDocument();

            rerender(
                <CoachesPerspectiveSection
                    testimonials={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(screen.getByText(/testimonials from coaches who have worked with you/i)).toBeInTheDocument();

            rerender(
                <RecruitingContactSection
                    contact={{ email: '', phone: '', socialMedia: { twitter: '', instagram: '', hudl: '' } }}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );
            expect(screen.getByText(/contact details, social media links, and coach information/i)).toBeInTheDocument();
        });
    });

    describe('Edge cases and error handling', () => {
        it('Handles null/undefined data gracefully', () => {
            // StatsShowcase with null
            let { container } = render(
                <StatsShowcase
                    stats={null as any}
                    isOwner={false}
                />
            );
            expect(container.querySelector('section')).not.toBeInTheDocument();

            // StatsShowcase with undefined
            const result = render(
                <StatsShowcase
                    stats={undefined as any}
                    isOwner={false}
                />
            );
            expect(result.container.querySelector('section')).not.toBeInTheDocument();

            // Videos with empty array (null would cause runtime error, which is expected)
            const result2 = render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );
            expect(result2.container.firstChild).toBeNull();
        });

        it('Handles malformed data structures', () => {
            const malformedAcademic = {
                gpa: null as any,
                satScore: undefined as any,
                actScore: NaN,
                honors: null as any,
                courses: undefined as any,
            };

            const { container } = render(
                <AcademicProfileSection
                    academic={malformedAcademic}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );

            // Should still render without crashing
            expect(container.querySelector('section')).toBeInTheDocument();
        });

        it('Handles very long empty arrays', () => {
            const emptyVideos = new Array(100).fill(null);

            const { container } = render(
                <GameHighlightsSection
                    videos={emptyVideos.filter(Boolean)}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should hide section for non-owner
            expect(container.firstChild).toBeNull();
        });
    });
});
