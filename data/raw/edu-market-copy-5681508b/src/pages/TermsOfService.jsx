import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <div className="inline-block bg-green-100 p-3 rounded-full mx-auto mb-4">
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                         <p className="text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none mx-auto">
                        <h2>1. Agreement to Terms</h2>
                        <p>By using our application, Academic Zone, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                        
                        <h2>2. User Accounts</h2>
                        <p>You are responsible for safeguarding your account information. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

                        <h2>3. Intellectual Property</h2>
                        <p>All content provided on this platform, including courses, text, graphics, and logos, is the property of Academic Zone or its content creators and is protected by copyright and other intellectual property laws. You are granted a limited license to access and use the content for personal, non-commercial educational purposes.</p>

                        <h2>4. User Conduct</h2>
                        <p>You agree not to use the service for any unlawful purpose or to engage in any conduct that could damage, disable, or impair the service. Prohibited activities include harassing others, uploading malicious code, and infringing on intellectual property rights.</p>

                        <h2>5. Purchases and Payments</h2>
                        <p>When you make a purchase, you agree to provide current, complete, and accurate purchase and account information. All payments are handled through third-party payment processors. Access to courses is granted after payment verification.</p>
                        
                        <h2>6. Termination</h2>
                        <p>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                        <h2>7. Limitation of Liability</h2>
                        <p>In no event shall Academic Zone, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of, or inability to access or use, the service.</p>

                        <h2>8. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is based, without regard to its conflict of law provisions.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}