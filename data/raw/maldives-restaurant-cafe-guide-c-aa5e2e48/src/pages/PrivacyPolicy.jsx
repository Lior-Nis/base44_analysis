import React from 'react';
import { Shield, Eye, Database, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-cream)] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[var(--primary-cta)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-body)] font-poppins mb-4">Privacy Policy</h1>
          <p className="text-lg text-[var(--text-muted)]">How we collect, use, and protect your information</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">Last updated: January 2024</p>
        </div>

        <div className="space-y-8">
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[var(--primary-cta)]" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Personal Information</h4>
                <p className="text-[var(--text-muted)]">
                  When you create an account, we collect your name, email address, and profile information. 
                  We also collect any additional information you provide in your profile or when contacting us.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Usage Information</h4>
                <p className="text-[var(--text-muted)]">
                  We collect information about how you use our service, including restaurants you view, 
                  reviews you write, and your search history to improve our recommendations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Location Information</h4>
                <p className="text-[var(--text-muted)]">
                  With your permission, we may collect location information to show you nearby restaurants 
                  and provide location-based recommendations.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[var(--primary-cta)]" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>Provide and maintain our restaurant discovery service</li>
                <li>Personalize your experience with relevant restaurant recommendations</li>
                <li>Process and display your reviews and ratings</li>
                <li>Communicate with you about your account and our services</li>
                <li>Improve our service through analytics and user feedback</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)] mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>With restaurant owners when you write reviews (your name and review content)</li>
                <li>With service providers who help us operate our platform</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)] mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[var(--primary-cta)]" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <strong>Email:</strong> privacy@diningmv.com
                <br />
                <strong>Address:</strong> Converge Concepts Pvt Ltd, Malé, Maldives
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}