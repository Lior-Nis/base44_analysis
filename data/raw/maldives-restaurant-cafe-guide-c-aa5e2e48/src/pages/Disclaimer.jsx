import React from 'react';
import { AlertCircle, Info, ExternalLink, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-[var(--bg-cream)] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[var(--primary-cta)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-body)] font-poppins mb-4">Disclaimer</h1>
          <p className="text-lg text-[var(--text-muted)]">Important information about using Diningmv.com</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">Last updated: August 2025</p>
        </div>

        <div className="space-y-8">
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[var(--primary-cta)]" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                The information on Diningmv.com is provided on an "as is" basis. To the fullest extent 
                permitted by law, this Company excludes all representations, warranties, conditions, 
                and terms whether express or implied, statutory or otherwise.
              </p>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Restaurant Information Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[var(--text-muted)]">
                While we strive to provide accurate and up-to-date information about restaurants, 
                we cannot guarantee the accuracy, completeness, or timeliness of all information displayed.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Please Note:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                  <li>Operating hours may change without notice</li>
                  <li>Menu items and prices are subject to change</li>
                  <li>Restaurant availability may vary</li>
                  <li>Always verify details directly with the restaurant</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>User-Generated Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Reviews and Ratings</h4>
                <p className="text-[var(--text-muted)]">
                  Reviews and ratings on Diningmv.com are opinions of individual users and do not 
                  reflect the views of Diningmv.com. We do not endorse or guarantee the accuracy 
                  of user reviews.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-body)] mb-2">Content Moderation</h4>
                <p className="text-[var(--text-muted)]">
                  While we moderate user content, we cannot guarantee that all content meets our 
                  guidelines at all times. Users should use their own judgment when reading reviews.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-[var(--primary-cta)]" />
                Third-Party Links and Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)] mb-4">
                Diningmv.com may contain links to external websites and third-party services. 
                We are not responsible for the content, privacy policies, or practices of these external sites.
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>External links are provided for convenience only</li>
                <li>We do not endorse third-party content or services</li>
                <li>Use external services at your own risk</li>
                <li>Check third-party terms and privacy policies</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>No Professional Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                Diningmv.com is for informational and entertainment purposes only. Content on our 
                platform should not be considered as professional advice regarding dietary restrictions, 
                health concerns, or business decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[var(--text-muted)]">
                Diningmv.com, its owners, employees, and affiliates shall not be liable for any loss 
                or damage arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>Use of information on our platform</li>
                <li>Inability to access our services</li>
                <li>Interactions with restaurants or other users</li>
                <li>Technical issues or data loss</li>
                <li>Third-party actions or content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--primary-cta)]" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)]">
                If you have any questions about this disclaimer or our services, please contact us at:
                <br />
                <strong>Email:</strong> support@diningmv.com
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