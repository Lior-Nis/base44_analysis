import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserEntity } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { Mail, Send } from 'lucide-react';

const getEmailContent = (template, data) => {
    const { name, entityName, rejectionReason } = data;
    const styles = `
      body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header { font-size: 24px; font-weight: bold; color: #884C24; margin-bottom: 10px; }
      .content { margin-top: 20px; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      .button { background-color: #884C24; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
      .highlight { background-color: #f7fafc; border-left: 4px solid #884C24; padding: 15px; margin-top: 15px; }
      p { margin-bottom: 10px; }
    `;

    const htmlBody = (content) => `
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                ${content}
                <div class="footer">
                    Thank you for being a part of the Dining Guide community.<br>
                    This is an automated message. Please do not reply.
                </div>
            </div>
        </body>
        </html>
    `;

    const baseURL = window.location.origin;

    switch (template) {
        case 'restaurant_welcome':
            return {
                subject: `Welcome to Dining Guide, ${entityName}!`,
                body: htmlBody(`
                    <div class="header">Welcome Aboard!</div>
                    <p>Hi ${name},</p>
                    <p>Thank you for registering your restaurant, <strong>${entityName}</strong>, with Dining Guide. We're thrilled to have you.</p>
                    <div class="highlight">
                        <p><strong>What's next?</strong> Our team will now review your application. This process usually takes 1-2 business days. We'll notify you via email as soon as your restaurant is approved.</p>
                    </div>
                    <p class="content">In the meantime, you can log in to your Restaurant Portal to add your menu items and finalize your profile.</p>
                    <a href="${baseURL}/RestaurantPortal" class="button">Go to Your Portal</a>
                `),
            };
        case 'restaurant_approved':
            return {
                subject: `Congratulations! Your restaurant "${entityName}" is now live!`,
                body: htmlBody(`
                    <div class="header">You're Approved!</div>
                    <p>Hi ${name},</p>
                    <p>Great news! Your restaurant, <strong>${entityName}</strong>, has been approved and is now live on Dining Guide for all our users to see.</p>
                    <div class="highlight">
                        <p>Your restaurant is now visible to thousands of potential customers. Ensure your menu is up-to-date and your details are correct to attract more diners!</p>
                    </div>
                    <p class="content">Log in to your portal to manage your listing, view analytics, and engage with customers.</p>
                    <a href="${baseURL}/RestaurantPortal" class="button">Manage Your Restaurant</a>
                `),
            };
        case 'restaurant_rejected':
             return {
                subject: `Update required for your restaurant application: "${entityName}"`,
                body: htmlBody(`
                    <div class="header">Action Required</div>
                    <p>Hi ${name},</p>
                    <p>We've reviewed the application for your restaurant, <strong>${entityName}</strong>, and it requires some attention before we can approve it.</p>
                    <div class="highlight">
                        <p><strong>Reason for rejection:</strong></p>
                        <p>${rejectionReason || "Please ensure all required documents are uploaded and information is complete. For specific details, please contact our support team."}</p>
                    </div>
                    <p class="content">You can update your restaurant's information in your portal. If you have questions, feel free to reach out to our support team.</p>
                    <a href="${baseURL}/RestaurantPortal" class="button">Update Your Information</a>
                `),
            };
        case 'seller_welcome':
            return {
                subject: `Welcome to the Dining Guide Marketplace!`,
                body: htmlBody(`
                    <div class="header">Welcome to the Marketplace!</div>
                    <p>Hi ${name},</p>
                    <p>Thank you for registering as a seller with Dining Guide under the name <strong>${entityName}</strong>. We're excited to see what you bring to our community!</p>
                    <div class="highlight">
                        <p><strong>Next Steps:</strong> Your seller profile is now under review by our team. We'll notify you once it's approved. You can then start listing your products.</p>
                    </div>
                    <p class="content">Head to your Seller Portal to get everything ready.</p>
                    <a href="${baseURL}/SellerPortal" class="button">Go to Seller Portal</a>
                `),
            };
        case 'seller_approved':
            return {
                subject: `You're approved to sell on Dining Guide!`,
                body: htmlBody(`
                    <div class="header">Start Selling!</div>
                    <p>Hi ${name},</p>
                    <p>Congratulations! Your seller profile, <strong>${entityName}</strong>, has been approved. You can now start listing your products on the Dining Guide Marketplace.</p>
                    <p class="content">Log in to your portal to add your products and manage your store.</p>
                    <a href="${baseURL}/SellerPortal" class="button">Manage Your Store</a>
                `),
            };
        case 'seller_rejected':
            return {
                subject: `Update required for your seller application: "${entityName}"`,
                body: htmlBody(`
                    <div class="header">Action Required</div>
                    <p>Hi ${name},</p>
                    <p>We've reviewed your seller application for <strong>${entityName}</strong>. To move forward, we need a few more details from you.</p>
                     <div class="highlight">
                        <p><strong>Reason for rejection:</strong></p>
                        <p>${rejectionReason || "Please ensure your profile information is complete and accurate. For specific details, please contact our support team."}</p>
                    </div>
                    <p class="content">Please visit your Seller Portal to update your information. Contact support if you need assistance.</p>
                    <a href="${baseURL}/SellerPortal" class="button">Update Your Profile</a>
                `),
            };
        default:
            return { subject: '', body: '' };
    }
};

export default function EmailTester() {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [entityName, setEntityName] = useState('');
    const [rejectionReason, setRejectionReason] = useState('Information was incomplete.');
    const [isSending, setIsSending] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const loadUserData = async () => {
        try {
            const user = await UserEntity.me();
            setRecipientEmail(user.email);
            setRecipientName(user.full_name || 'Test User');
        } catch (error) {
            setStatusMessage('Please log in to auto-fill your details.');
        }
    };

    React.useEffect(() => {
        loadUserData();
    }, []);

    const handleSendTestEmail = async (template) => {
        if (!recipientEmail || !recipientName) {
            setStatusMessage('Please enter a recipient name and email.');
            return;
        }

        setIsSending(true);
        setStatusMessage(`Sending '${template}' email...`);

        try {
            const { subject, body } = getEmailContent(template, {
                name: recipientName,
                entityName: entityName || 'Test Restaurant/Store',
                rejectionReason
            });

            if (!subject || !body) {
                throw new Error(`Invalid template: ${template}`);
            }

            await SendEmail({
                to: recipientEmail,
                subject: subject,
                body: body,
                from_name: "Dining Guide Team"
            });
            
            setStatusMessage(`Successfully sent '${template}' email to ${recipientEmail}. Please check the recipient's inbox.`);
        } catch (error) {
            console.error('Error sending test email:', error);
            setStatusMessage(`Failed to send email: ${error.message}`);
        }
        setIsSending(false);
    };

    const emailTests = [
        { label: 'Restaurant Welcome', template: 'restaurant_welcome' },
        { label: 'Restaurant Approved', template: 'restaurant_approved' },
        { label: 'Restaurant Rejected', template: 'restaurant_rejected' },
        { label: 'Seller Welcome', template: 'seller_welcome' },
        { label: 'Seller Approved', template: 'seller_approved' },
        { label: 'Seller Rejected', template: 'seller_rejected' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-8">
            <Card className="soft-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-[var(--headings-labels)]">
                        <Mail className="w-6 h-6" />
                        Onboarding Email Tester
                    </CardTitle>
                     <p className="text-[var(--text-muted)]">Use this page to send test versions of all automated onboarding emails.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Instructions</h4>
                        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                            <li>Fill in the recipient details below (they will auto-fill if you are logged in).</li>
                            <li>Click any of the "Send Test" buttons to trigger an email.</li>
                            <li>Check the recipient's inbox to confirm the email was received.</li>
                        </ol>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="recipientName">Recipient Name</Label>
                            <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g., John Doe" />
                        </div>
                        <div>
                            <Label htmlFor="recipientEmail">Recipient Email</Label>
                            <Input id="recipientEmail" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="e.g., john@example.com" />
                        </div>
                        <div>
                            <Label htmlFor="entityName">Restaurant/Store Name</Label>
                            <Input id="entityName" value={entityName} onChange={(e) => setEntityName(e.target.value)} placeholder="e.g., The Coral Cafe" />
                        </div>
                         <div>
                            <Label htmlFor="rejectionReason">Rejection Reason</Label>
                            <Input id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {emailTests.map(test => (
                            <div key={test.template} className="flex items-center justify-between p-3 border rounded-md">
                                <span className="font-medium">{test.label}</span>
                                <Button
                                    onClick={() => handleSendTestEmail(test.template)}
                                    disabled={isSending}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Send className="w-3 h-3 mr-2" />
                                    Send Test
                                </Button>
                            </div>
                        ))}
                    </div>

                    {statusMessage && (
                        <div className="p-4 bg-gray-100 border rounded-md text-center text-sm font-medium">
                            <p>{statusMessage}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}