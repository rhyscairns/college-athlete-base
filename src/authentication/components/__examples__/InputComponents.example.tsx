/**
 * Example demonstrating the light theme styling for TextInput and EmailInput components
 * 
 * This example shows:
 * - Default state with light theme
 * - Focus states with blue ring
 * - Error states with red styling
 * - Disabled states
 */

import { useState } from 'react';
import { TextInput } from '../TextInput';
import { EmailInput } from '../EmailInput';

export function InputComponentsExample() {
    const [textValue, setTextValue] = useState('');
    const [emailValue, setEmailValue] = useState('');
    const [errorTextValue, setErrorTextValue] = useState('');
    const [errorEmailValue, setErrorEmailValue] = useState('');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Input Components - Light Theme
                    </h1>

                    <div className="space-y-6">
                        {/* Default State */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Default State
                            </h2>
                            <div className="space-y-4">
                                <TextInput
                                    label="First Name"
                                    name="firstName"
                                    value={textValue}
                                    onChange={setTextValue}
                                    placeholder="Enter your first name"
                                    required
                                />
                                <EmailInput
                                    value={emailValue}
                                    onChange={setEmailValue}
                                />
                            </div>
                        </section>

                        {/* Error State */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Error State
                            </h2>
                            <div className="space-y-4">
                                <TextInput
                                    label="Last Name"
                                    name="lastName"
                                    value={errorTextValue}
                                    onChange={setErrorTextValue}
                                    error="This field is required"
                                    required
                                />
                                <EmailInput
                                    value={errorEmailValue}
                                    onChange={setErrorEmailValue}
                                    error="Please enter a valid email address"
                                />
                            </div>
                        </section>

                        {/* Disabled State */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Disabled State
                            </h2>
                            <div className="space-y-4">
                                <TextInput
                                    label="Username"
                                    name="username"
                                    value="john.doe"
                                    onChange={() => { }}
                                    disabled
                                />
                                <EmailInput
                                    value="john.doe@example.com"
                                    onChange={() => { }}
                                    disabled
                                />
                            </div>
                        </section>

                        {/* Number Input */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Number Input
                            </h2>
                            <TextInput
                                label="GPA"
                                name="gpa"
                                type="number"
                                value=""
                                onChange={() => { }}
                                min={0}
                                max={4}
                                step={0.01}
                                placeholder="0.00"
                                required
                            />
                        </section>

                        {/* Styling Notes */}
                        <section className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                Light Theme Features
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• White background with gray borders</li>
                                <li>• Dark gray text for readability</li>
                                <li>• Blue focus ring for accessibility</li>
                                <li>• Red error states with ring</li>
                                <li>• Smooth transitions on all states</li>
                                <li>• Proper disabled styling</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
