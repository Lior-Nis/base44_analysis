export function generateEmailHTML(newsletter) {
  const { intro_text, feature_blocks = [], call_to_action_text, call_to_action_url } = newsletter;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.subject || newsletter.title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Main styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            width: 100% !important;
            min-width: 100%;
        }
        
        .email-wrapper {
            width: 100%;
            background-color: #f8f9fa;
            padding: 20px 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            text-align: center;
            padding: 40px 40px 20px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            color: white;
        }
        
        .content {
            padding: 40px;
        }
        
        .intro {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 40px;
            text-align: center;
            line-height: 1.7;
        }
        
        .feature-block {
            background: #f7fafc;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            border-left: 4px solid #667eea;
        }
        
        .feature-block table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            text-align: center;
            vertical-align: middle;
            font-size: 30px;
            line-height: 60px;
            color: white;
        }
        
        .feature-content {
            padding-left: 20px;
            vertical-align: top;
        }
        
        .feature-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 12px 0;
            line-height: 1.3;
        }
        
        .feature-description {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
        }
        
        .cta-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white !important;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            border: none;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .footer {
            text-align: center;
            padding: 30px 40px;
            background-color: #f7fafc;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            .header, .content {
                padding: 30px 20px !important;
            }
            .header h1 {
                font-size: 24px;
            }
            .intro {
                font-size: 16px;
            }
            .feature-block {
                padding: 20px;
            }
            .feature-icon {
                width: 50px;
                height: 50px;
                font-size: 24px;
                line-height: 50px;
            }
            .feature-content {
                padding-left: 15px;
            }
            .feature-title {
                font-size: 18px;
            }
            .cta-button {
                padding: 14px 32px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <h1>${newsletter.title}</h1>
            </div>
            
            <div class="content">
                ${intro_text ? `<div class="intro">${intro_text}</div>` : ''}
                
                ${feature_blocks.map(block => `
                    <div class="feature-block">
                        <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td class="feature-icon">${block.icon}</td>
                                <td class="feature-content">
                                    <h3 class="feature-title">${block.title}</h3>
                                    <p class="feature-description">${block.description}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                `).join('')}
                
                ${call_to_action_text && call_to_action_url ? `
                    <div class="cta-container">
                        <a href="${call_to_action_url}" class="cta-button">${call_to_action_text}</a>
                    </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>You're receiving this newsletter because you subscribed to our updates.</p>
                <p>Thank you for being part of our community! 🎉</p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}