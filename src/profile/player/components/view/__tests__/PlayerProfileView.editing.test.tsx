import { render, screen, fireEvent, act } from '@testing-library/react';
import { PlayerProfileView } from '../PlayerProfileView';
import { mockPlayerData } from '../../../data/mockPlayerData';

// Mock all child components with props inspection
const mockHeroSection = jest.fn((props: any) => <div data-testid="hero-section">Hero Section</div>);
const mockStatsShowcase = jest.fn((props: any) => <div data-testid="stats-section">Stats Section</div>);
const mockAthleticAchievementsSection = jest.fn((props: any) => <div data-testid="achievements-section">Achievements Section</div>);
const mockAcademicProfileSection = jest.fn((props: any) => <div data-testid="academics-section">Academics Section</div>);
const mockGameHighlightsSection = jest.fn((props: any) => <div data-testid="highlights-section">Highlights Section</div>);
const mockCoachesPerspectiveSection = jest.fn((props: any) => <div data-testid="coaches-section">Coaches Section</div>);
const mockRecruitingContactSection = jest.fn((props: any) => <div data-testid="contact-section">Contact Section</div>);

jest.mock('../HeroSection', () => ({
    HeroSection: (props: any) => mockHeroSection(props),
}));

jest.mock('../StatsShowcase', () => ({
    StatsShowcase: (props: any) => mockStatsShowcase(props),
}));

jest.mock('../AthleticAchievementsSection', () => ({
    AthleticAchievementsSection: (props: any) => mockAthleticAchievementsSection(props),
}));

jest.mock('../AcademicProfileSection', () => ({
    AcademicProfileSection: (props: any) => mockAcademicProfileSection(props),
}));

jest.mock('../GameHighlightsSection', () => ({
    GameHighlightsSection: (props: any) => mockGameHighlightsSection(props),
}));

jest.mock('../CoachesPerspectiveSection', () => ({
    CoachesPerspectiveSection: (props: any) => mockCoachesPerspectiveSection(props),
}));

jest.mock('../RecruitingContactSection', () => ({
    RecruitingContactSection: (props: any) => mockRecruitingContactSection(props),
}));

jest.mock('../ProfileSideNav', () => ({
    ProfileSideNav: () => <div data-testid="side-nav">Side Nav</div>,
}));

jest.mock('../SuccessNotification', () => ({
    SuccessNotification: ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
        <div data-testid="success-notification" onClick={onDismiss}>
            {message}
        </div>
    ),
}));

describe('PlayerProfileView - Editing State Management', () => {
    const defaultProps = {
        playerId: 'player-123',
        currentUserId: 'player-123',
        initialData: mockPlayerData,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isOwner calculation', () => {
        it('sets isOwner to true when currentUserId matches playerId', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Check that HeroSection received isOwner=true
            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOwner: true,
                })
            );
        });

        it('sets isOwner to false when currentUserId does not match playerId', () => {
            render(<PlayerProfileView {...defaultProps} currentUserId="different-user" />);

            // Check that HeroSection received isOwner=false
            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOwner: false,
                })
            );
        });

        it('sets isOwner to false when currentUserId is undefined', () => {
            render(<PlayerProfileView {...defaultProps} currentUserId={undefined} />);

            // Check that HeroSection received isOwner=false
            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOwner: false,
                })
            );
        });
    });

    describe('editing state', () => {
        it('initially sets all sections to not editing', () => {
            render(<PlayerProfileView {...defaultProps} />);

            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEditing: false,
                    isAnyOtherSectionEditing: false,
                })
            );

            expect(mockStatsShowcase).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEditing: false,
                    isAnyOtherSectionEditing: false,
                })
            );
        });

        it('passes onEdit handler to all sections', () => {
            render(<PlayerProfileView {...defaultProps} />);

            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    onEdit: expect.any(Function),
                })
            );

            expect(mockStatsShowcase).toHaveBeenCalledWith(
                expect.objectContaining({
                    onEdit: expect.any(Function),
                })
            );
        });

        it('passes onSave handler to all sections', () => {
            render(<PlayerProfileView {...defaultProps} />);

            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    onSave: expect.any(Function),
                })
            );

            expect(mockStatsShowcase).toHaveBeenCalledWith(
                expect.objectContaining({
                    onSave: expect.any(Function),
                })
            );
        });

        it('passes onCancel handler to all sections', () => {
            render(<PlayerProfileView {...defaultProps} />);

            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    onCancel: expect.any(Function),
                })
            );

            expect(mockStatsShowcase).toHaveBeenCalledWith(
                expect.objectContaining({
                    onCancel: expect.any(Function),
                })
            );
        });
    });

    describe('handleSectionEdit', () => {
        it('sets the correct section to editing when onEdit is called', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Get the onEdit handler from HeroSection
            const heroOnEdit = mockHeroSection.mock.calls[0]?.[0]?.onEdit;

            // Clear mocks to see the re-render
            jest.clearAllMocks();

            // Call onEdit wrapped in act
            act(() => {
                heroOnEdit?.();
            });

            // After re-render, HeroSection should be editing
            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEditing: true,
                    isAnyOtherSectionEditing: false,
                })
            );

            // Other sections should not be editing but should know another section is editing
            expect(mockStatsShowcase).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEditing: false,
                    isAnyOtherSectionEditing: true,
                })
            );
        });
    });

    describe('handleSectionSave', () => {
        it('updates playerData and clears editing section when onSave is called', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Get the onEdit and onSave handlers from HeroSection
            const heroOnEdit = mockHeroSection.mock.calls[0]?.[0]?.onEdit;
            const heroOnSave = mockHeroSection.mock.calls[0]?.[0]?.onSave;

            // Start editing
            act(() => {
                heroOnEdit?.();
            });
            jest.clearAllMocks();

            // Save with updated data
            const updatedData = { firstName: 'Updated', lastName: 'Name' };
            act(() => {
                heroOnSave?.(updatedData);
            });

            // After save, no section should be editing
            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEditing: false,
                    isAnyOtherSectionEditing: false,
                    player: expect.objectContaining(updatedData),
                })
            );
        });

        it('calls onDataUpdate callback when provided', () => {
            const onDataUpdate = jest.fn();
            render(<PlayerProfileView {...defaultProps} onDataUpdate={onDataUpdate} />);

            // Get the onSave handler from HeroSection
            const heroOnSave = mockHeroSection.mock.calls[0]?.[0]?.onSave;

            // Save with updated data
            const updatedData = { firstName: 'Updated', lastName: 'Name' };
            act(() => {
                heroOnSave?.(updatedData);
            });

            // onDataUpdate should have been called with the updated data
            expect(onDataUpdate).toHaveBeenCalledWith(updatedData);
        });
    });

    describe('handleSectionCancel', () => {
        it('clears editing section when onCancel is called', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Get the onEdit and onCancel handlers from HeroSection
            const heroOnEdit = mockHeroSection.mock.calls[0]?.[0]?.onEdit;
            const heroOnCancel = mockHeroSection.mock.calls[0]?.[0]?.onCancel;

            // Start editing
            act(() => {
                heroOnEdit?.();
            });
            jest.clearAllMocks();

            // Cancel editing
            act(() => {
                heroOnCancel?.();
            });

            // After cancel, no section should be editing
            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEditing: false,
                    isAnyOtherSectionEditing: false,
                })
            );

            expect(mockStatsShowcase).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEditing: false,
                    isAnyOtherSectionEditing: false,
                })
            );
        });
    });

    describe('concurrent edit prevention', () => {
        it('marks other sections as "another section editing" when one is being edited', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Start editing HeroSection
            const heroOnEdit = mockHeroSection.mock.calls[0][0].onEdit;

            act(() => {
                heroOnEdit();
            });

            // Check the most recent calls (after the state update)
            const statsCallsAfterEdit = mockStatsShowcase.mock.calls;
            const academicCallsAfterEdit = mockAcademicProfileSection.mock.calls;

            // Find the last call to each mock
            const lastStatsCall = statsCallsAfterEdit[statsCallsAfterEdit.length - 1]?.[0];
            const lastAcademicCall = academicCallsAfterEdit[academicCallsAfterEdit.length - 1]?.[0];

            // All other sections should have isAnyOtherSectionEditing=true
            expect(lastStatsCall).toMatchObject({
                isEditing: false,
                isAnyOtherSectionEditing: true,
            });

            expect(lastAcademicCall).toMatchObject({
                isEditing: false,
                isAnyOtherSectionEditing: true,
            });
        });
    });

    describe('playerData state', () => {
        it('initializes with initialData prop', () => {
            render(<PlayerProfileView {...defaultProps} />);

            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    player: mockPlayerData,
                })
            );
        });

        it('passes updated data to sections after save', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Get the onSave handler from HeroSection
            const heroOnSave = mockHeroSection.mock.calls[0]?.[0]?.onSave;

            jest.clearAllMocks();

            // Save with updated data
            const updatedData = { firstName: 'NewFirst', lastName: 'NewLast' };
            act(() => {
                heroOnSave?.(updatedData);
            });

            // HeroSection should receive the merged data
            expect(mockHeroSection).toHaveBeenCalledWith(
                expect.objectContaining({
                    player: expect.objectContaining({
                        ...mockPlayerData,
                        ...updatedData,
                    }),
                })
            );
        });
    });

    describe('success notification', () => {
        it('does not show success notification initially', () => {
            render(<PlayerProfileView {...defaultProps} />);

            expect(screen.queryByTestId('success-notification')).not.toBeInTheDocument();
        });

        it('shows success notification after saving a section', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Get the onSave handler from HeroSection
            const heroOnSave = mockHeroSection.mock.calls[0]?.[0]?.onSave;

            // Save with updated data
            const updatedData = { firstName: 'Updated', lastName: 'Name' };
            act(() => {
                heroOnSave?.(updatedData);
            });

            // Success notification should be visible
            expect(screen.getByTestId('success-notification')).toBeInTheDocument();
            expect(screen.getByTestId('success-notification')).toHaveTextContent('Changes saved successfully!');
        });

        it('hides success notification when dismissed', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Get the onSave handler from HeroSection
            const heroOnSave = mockHeroSection.mock.calls[0]?.[0]?.onSave;

            // Save to show notification
            act(() => {
                heroOnSave?.({ firstName: 'Updated' });
            });

            // Notification should be visible
            expect(screen.getByTestId('success-notification')).toBeInTheDocument();

            // Click to dismiss
            act(() => {
                fireEvent.click(screen.getByTestId('success-notification'));
            });

            // Notification should be hidden
            expect(screen.queryByTestId('success-notification')).not.toBeInTheDocument();
        });

        it('shows success notification for different sections', () => {
            render(<PlayerProfileView {...defaultProps} />);

            // Save HeroSection
            const heroOnSave = mockHeroSection.mock.calls[0]?.[0]?.onSave;
            act(() => {
                heroOnSave?.({ firstName: 'Updated' });
            });

            expect(screen.getByTestId('success-notification')).toBeInTheDocument();

            // Dismiss notification
            act(() => {
                fireEvent.click(screen.getByTestId('success-notification'));
            });

            // Save StatsShowcase
            const statsOnSave = mockStatsShowcase.mock.calls[0]?.[0]?.onSave;
            act(() => {
                statsOnSave?.({ stats: { newStat: 100 } });
            });

            // Notification should appear again
            expect(screen.getByTestId('success-notification')).toBeInTheDocument();
        });
    });
});
