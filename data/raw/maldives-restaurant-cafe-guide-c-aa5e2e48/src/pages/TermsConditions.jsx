import React from 'react';
import { FileText, Users, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-[var(--bg-cream)] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[var(--primary-cta)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-body)] font-poppins mb-4">Terms & Conditions</h1>
          <p className="text-lg text-[var(--text-muted)]">Rules and guidelines for using Diningmv.com</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">Last updated: January 2024</p>
        </div>

        <div className="space-y-8">
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                By accessing and using Diningmv.com, you accept and agree to be bound by the terms and provision 
                of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--primary-cta)]" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Account Creation</h4>
                <p className="text-[var(--text-muted)]">
                  You must provide accurate and complete information when creating an account. 
                  You are responsible for maintaining the confidentiality of your account.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Account Responsibility</h4>
                <p className="text-[var(--text-muted)]">
                  You are responsible for all activities that occur under your account and for ensuring 
                  that your account is not used by unauthorized persons.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>User Content and Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Review Guidelines</h4>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                  <li>Reviews must be based on genuine experiences</li>
                  <li>No offensive, defamatory, or inappropriate content</li>
                  <li>No promotional content or spam</li>
                  <li>Respect others' opinions and experiences</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Content Ownership</h4>
                <p className="text-[var(--text-muted)]">
                  You retain ownership of your content, but grant us a license to use, display, 
                  and distribute it on our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Restaurant Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)] mb-4">
                Restaurant information is provided for informational purposes. We strive for accuracy but 
                cannot guarantee that all information is current or complete.
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>Hours, menus, and prices may change without notice</li>
                <li>We are not responsible for restaurant service quality</li>
                <li>Direct reservations and orders are between you and the restaurant</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[var(--primary-cta)]" />
                Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)] mb-4">You may not use our service to:</p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>Violate any local, state, national, or international laws</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Impersonate another person or entity</li>
                <li>Spam or harass other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[var(--primary-cta)]" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                Diningmv.com shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of the service. Our total liability is 
                limited to the amount you paid us in the past 12 months.
              </p>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                We reserve the right to modify these terms at any time. We will notify users of 
                significant changes via email or platform notification. Continued use of the service 
                constitutes acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                For questions about these Terms & Conditions, contact us at:
                <br />
                <strong>Email:</strong> legal@diningmv.com
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