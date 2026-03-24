/**
 * @jest-environment jsdom
 * 
 * Integration test for player profile edit flow with sport and position/event selection
 * Tests the complete flow of editing sport and position/event fields in the Hero section
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from '@/profile/player/components/view-page/HeroSection';
import {
    createMockPlayerProfile,
    selectSport,
    selectPosition,
    selectEvent,
    clickSave,
    clickCancel,
} from './helpers/profile-test-helpers';

// Mock logger
jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = jest.fn();

describe('Player Profile Sport/Position Edit - Integration Tests', () => {
    let onSaveMock: jest.Mock;
    let onEditMock: jest.Mock;
    let onCancelMock: jest.Mock;

    beforeEach(() => {
        onSaveMock = jest.fn();
        onEditMock = jest.fn();
        onCancelMock = jest.fn();
        jest.clearAllMocks();
    });

    describe('Sport Selection from Typeahead', () => {
        it('should allow user to select sport from typeahead', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            const sportInput = await selectSport('Soccer', 'Soc');
            expect(sportInput).toHaveValue('Soccer');
        });

        it('should show "No sports found" when no matches', async () => {
            const user = userEvent.setup();
            const mockPlayer = createMockPlayerProfile();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            const sportInput = screen.getByLabelText(/sport/i);
            await user.clear(sportInput);
            await user.type(sportInput, 'xyz');

            await waitFor(() => {
                expect(screen.getByText(/no sports found/i)).toBeInTheDocument();
            });
        });
    });

    describe('Position Selection After Sport', () => {
        it('should allow user to select position after selecting position-based sport', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            await selectSport('Soccer', 'Soc');
            const positionInput = await selectPosition('Forward', 'For');
            expect(positionInput).toHaveValue('Forward');
        });

        it('should disable position field when no sport is selected', async () => {
            const mockPlayer = createMockPlayerProfile({ sport: undefined, position: undefined });

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            const positionInput = screen.getByLabelText(/position|event/i);
            expect(positionInput).toBeDisabled();
        });
    });

    describe('Event Selection After Event-Based Sport', () => {
        it('should allow user to select event after selecting event-based sport', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            await selectSport('Swimming & Diving', 'Swim');
            const eventInput = await selectEvent('100m Freestyle', '100m Free');
            expect(eventInput).toHaveValue('100m Freestyle');
        });

        it('should show event label for event-based sports', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            await selectSport('Track & Field', 'Tra');

            await waitFor(() => {
                expect(screen.getByLabelText(/event/i)).toBeInTheDocument();
            });
        });
    });

    describe('Changing Sport Resets Position/Event', () => {
        it('should clear position when sport changes', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            const positionInput = screen.getByLabelText(/position/i);
            expect(positionInput).toHaveValue('Point Guard');

            await selectSport('Soccer', 'Soc');

            await waitFor(() => {
                expect(positionInput).toHaveValue('');
            });
        });

        it('should change from position to event when switching sport types', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            expect(screen.getByLabelText(/position/i)).toBeInTheDocument();

            await selectSport('Swimming & Diving', 'Swim');

            await waitFor(() => {
                expect(screen.getByLabelText(/event/i)).toBeInTheDocument();
            });
            expect(screen.queryByLabelText(/^position$/i)).not.toBeInTheDocument();
        });
    });

    describe('Save Persists Sport and Position/Event', () => {
        it('should save sport and position when save button is clicked', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            await selectSport('Soccer', 'Soc');
            await selectPosition('Defensive Midfielder', 'Defensive Mid');
            await clickSave();

            await waitFor(() => {
                expect(onSaveMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sport: 'Soccer',
                        position: 'Defensive Midfielder',
                    })
                );
            });
        });

        it('should save sport and event for event-based sports', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            await selectSport('Swimming & Diving', 'Swim');
            await selectEvent('200m Butterfly', '200');
            await clickSave();

            await waitFor(() => {
                expect(onSaveMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sport: 'Swimming & Diving',
                        position: '200m Butterfly',
                    })
                );
            });
        });
    });

    describe('Validation Prevents Invalid Selections', () => {
        it('should show validation error for invalid sport selection', async () => {
            const user = userEvent.setup();
            const mockPlayer = createMockPlayerProfile();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            const sportInput = screen.getByLabelText(/sport/i);
            await user.clear(sportInput);
            await user.type(sportInput, 'InvalidSport');
            fireEvent.blur(sportInput);

            await waitFor(() => {
                expect(screen.getByText(/please select a sport from the list/i)).toBeInTheDocument();
            });
        });

        it('should clear validation error when valid selection is made', async () => {
            const user = userEvent.setup();
            const mockPlayer = createMockPlayerProfile();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            const sportInput = screen.getByLabelText(/sport/i) as HTMLInputElement;
            await user.clear(sportInput);
            await user.type(sportInput, 'InvalidSport');
            fireEvent.blur(sportInput);

            await waitFor(() => {
                expect(screen.getByText(/please select a sport from the list/i)).toBeInTheDocument();
            });

            // Clear and select valid sport
            await user.clear(sportInput);
            await user.type(sportInput, 'Soc');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            const option = screen.getByRole('option', { name: /soccer/i });
            await user.click(option);

            await waitFor(() => {
                expect(screen.queryByText(/please select a sport from the list/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Profile View Displays Saved Sport and Position/Event', () => {
        it('should display sport and position in view mode', () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Sport')).toBeInTheDocument();
            expect(screen.getByText('Basketball')).toBeInTheDocument();
            expect(screen.getByText('Position')).toBeInTheDocument();
            const positionElements = screen.getAllByText('Point Guard');
            expect(positionElements.length).toBeGreaterThan(0);
        });

        it('should display event label for event-based sports', () => {
            const mockPlayer = createMockPlayerProfile({
                sport: 'Swimming & Diving',
                position: '100m Freestyle',
            });

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Event')).toBeInTheDocument();
            const eventElements = screen.getAllByText('100m Freestyle');
            expect(eventElements.length).toBeGreaterThan(0);
        });
    });

    describe('Complete End-to-End Flow', () => {
        it('should complete full edit flow: select sport, select position, save, and view', async () => {
            const mockPlayer = createMockPlayerProfile();
            const { rerender } = render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            await selectSport('Soccer', 'Soc');
            await selectPosition('Goalkeeper', 'Goa');
            await clickSave();

            await waitFor(() => {
                expect(onSaveMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sport: 'Soccer',
                        position: 'Goalkeeper',
                    })
                );
            });

            const updatedPlayer = createMockPlayerProfile({
                sport: 'Soccer',
                position: 'Goalkeeper',
            });

            rerender(
                <HeroSection
                    player={updatedPlayer}
                    isOwner={true}
                    isEditing={false}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
                const goalkeeperElements = screen.getAllByText('Goalkeeper');
                expect(goalkeeperElements.length).toBeGreaterThan(0);
            });
        });

        it('should handle cancel without saving changes', async () => {
            const mockPlayer = createMockPlayerProfile();
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    onSave={onSaveMock}
                    onCancel={onCancelMock}
                />
            );

            await selectSport('Football', 'Foot');
            await clickCancel();

            expect(onCancelMock).toHaveBeenCalled();
            expect(onSaveMock).not.toHaveBeenCalled();
        });
    });
});
