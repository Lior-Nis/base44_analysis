import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <div className="inline-block bg-blue-100 p-3 rounded-full mx-auto mb-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                        <p className="text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none mx-auto">
                        <h2>1. Introduction</h2>
                        <p>Welcome to Academic Zone. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
                        
                        <h2>2. Information We Collect</h2>
                        <p>We may collect personal information such as your name, email address, and payment information when you register, purchase a course, or interact with our services. We also collect data related to your course progress and activities on the platform.</p>

                        <h2>3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Provide, operate, and maintain our application.</li>
                            <li>Improve, personalize, and expand our services.</li>
                            <li>Process your transactions and manage your orders.</li>
                            <li>Communicate with you, either directly or through one of our partners.</li>
                            <li>Comply with legal obligations, including GDPR and COPPA.</li>
                        </ul>

                        <h2>4. Information Sharing and Disclosure</h2>
                        <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to provide products or services you've requested, with your permission, or under the following circumstances: for legal compliance, to protect rights, or in connection with a business transfer.</p>

                        <h2>5. Data Security</h2>
                        <p>We implement a variety of security measures to maintain the safety of your personal information. All transactions are processed through a secure gateway provider and are not stored or processed on our servers.</p>
                        
                        <h2>6. Children's Privacy (COPPA)</h2>
                        <p>Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.</p>

                        <h2>7. Your Data Protection Rights (GDPR)</h2>
                        <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>

                        <h2>8. Changes to This Privacy Policy</h2>
                        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

                        <h2>9. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at the email addresses provided in the footer.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}