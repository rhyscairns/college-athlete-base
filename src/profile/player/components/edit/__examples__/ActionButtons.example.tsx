import React, { useState } from 'react';
import { ActionButtons } from '../components/sections/ActionButtons';

/**
 * Example showcasing the ActionButtons component with light theme
 */
export default function ActionButtonsExample() {
    const [isSaving, setIsSaving] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const handleSave = () => {
        console.log('Save clicked');
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 2000);
    };

    const handleCancel = () => {
        console.log('Cancel clicked');
    };

    return (
        <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">ActionButtons Component</h1>

                {/* Normal State */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Normal State</h2>
                    <ActionButtons
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={false}
                        disabled={false}
                    />
                </div>

                {/* Saving State */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Saving State</h2>
                    <ActionButtons
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={true}
                        disabled={false}
                    />
                </div>

                {/* Disabled State */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Disabled State</h2>
                    <ActionButtons
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={false}
                        disabled={true}
                    />
                </div>

                {/* Interactive Demo */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Interactive Demo</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isSaving}
                                    onChange={(e) => setIsSaving(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-gray-700">Is Saving</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={disabled}
                                    onChange={(e) => setDisabled(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-gray-700">Disabled</span>
                            </label>
                        </div>
                        <ActionButtons
                            onSave={handleSave}
                            onCancel={handleCancel}
                            isSaving={isSaving}
                            disabled={disabled}
                        />
                    </div>
                </div>

                {/* Design Specifications */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Design Specifications</h2>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div>
                            <strong>Save Button:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Background: bg-blue-600</li>
                                <li>Text: white</li>
                                <li>Hover: bg-blue-700</li>
                                <li>Disabled: opacity-50</li>
                            </ul>
                        </div>
                        <div>
                            <strong>Cancel Button:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Background: bg-gray-200</li>
                                <li>Text: text-gray-900</li>
                                <li>Hover: bg-gray-300</li>
                                <li>Disabled: opacity-50</li>
                            </ul>
                        </div>
                        <div>
                            <strong>Common:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Min height: 44px (touch-friendly)</li>
                                <li>Padding: px-6 py-3</li>
                                <li>Border radius: rounded-lg</li>
                                <li>Transition: transition-colors</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
