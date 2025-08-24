import React from 'react';
import { Gavel } from 'lucide-react';
import { t } from '@/components/utils/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UserAgreementPage() {
  const Section = ({ title, children }) => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
      <div className="space-y-4 text-gray-600">
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Gavel className="h-8 w-8 text-primary hidden sm:block" />
            <div>
              <CardTitle className="text-3xl tracking-tight">{t('userAgreement.title')}</CardTitle>
              <CardDescription className="mt-1">{t('userAgreement.subtitle')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-gray-700">
            <p className="mb-6 font-semibold">{t('userAgreement.effectiveDate.title')}: {t('userAgreement.effectiveDate.date')}</p>
            <p className="leading-relaxed">{t('userAgreement.welcome')}</p>

            <Section title={t('userAgreement.section1.title')}>
              <p>{t('userAgreement.section1.para1')}</p>
              <p>{t('userAgreement.section1.para2')}</p>
              <p>{t('userAgreement.section1.para3')}</p>
            </Section>

            <Section title={t('userAgreement.section2.title')}>
              <p>{t('userAgreement.section2.para1')}</p>
              <p>{t('userAgreement.section2.para2')}</p>
            </Section>

            <Section title={t('userAgreement.section3.title')}>
              <p>{t('userAgreement.section3.para1')}</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>{t('userAgreement.section3.listItem1')}</li>
                <li>{t('userAgreement.section3.listItem2')}</li>
                <li>{t('userAgreement.section3.listItem3')}</li>
                <li>{t('userAgreement.section3.listItem4')}</li>
              </ul>
               <p className="mt-4">{t('userAgreement.section3.para2')}</p>
            </Section>

            <Section title={t('userAgreement.section4.title')}>
              <p>{t('userAgreement.section4.para1')}</p>
              <p>{t('userAgreement.section4.para2')}</p>
            </Section>

            <Section title={t('userAgreement.section5.title')}>
              <p>{t('userAgreement.section5.para1')}</p>
               <ul className="list-disc list-inside space-y-2 pl-4">
                <li>{t('userAgreement.section5.listItem1')}</li>
                <li>{t('userAgreement.section5.listItem2')}</li>
                <li>{t('userAgreement.section5.listItem3')}</li>
              </ul>
            </Section>

            <Section title={t('userAgreement.section6.title')}>
              <p>{t('userAgreement.section6.para1')}</p>
              <p>{t('userAgreement.section6.para2')}</p>
            </Section>

            <Section title={t('userAgreement.section7.title')}>
              <p>{t('userAgreement.section7.para1')}</p>
            </Section>

            <p className="mt-10 pt-6 border-t italic text-center text-gray-500">{t('userAgreement.conclusion')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}