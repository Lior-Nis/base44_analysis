
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const faqs = [
  {
    question: "Is this service available in my borough?",
    answer: "Yes! HomeScope operates across all UK boroughs. Our network of licensed experts covers England, Scotland, Wales, and Northern Ireland, ensuring you get local expertise no matter where you're located."
  },
  {
    question: "What kind of experts do you use?",
    answer: "All our experts are licensed professionals with relevant qualifications and insurance. This includes chartered surveyors, plumbers, electricians, legal advisors, and property specialists - all vetted and approved to provide consultations."
  },
  {
    question: "What if I'm not satisfied with the consultation?",
    answer: "We're confident in the quality of our experts. But if you're not satisfied with your consultation, we'll offer a free follow-up session with another qualified expert at no extra cost. In rare cases where a resolution isn't possible, refunds may be considered at our discretion."
  },
  {
    question: "Is this service for tenants or landlords?",
    answer: "HomeScope serves both tenants and landlords. Whether you're dealing with disrepair issues as a tenant, need property maintenance advice as a landlord, or facing neighbour disputes, our experts can help."
  },
  {
    question: "How quickly can I get connected to an expert?",
    answer: "Most consultations are available within 2 hours during business hours, and we offer same-day emergency slots 7 days a week. Our AI triage is available 24/7 to get you started immediately."
  },
  {
    question: "What happens after the video consultation?",
    answer: "You'll receive a detailed PDF summary within 30 minutes of your call, including the expert's assessment, recommended next steps, and any relevant documentation or contact details you might need."
  }
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about HomeScope
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Collapsible
                open={openItems.has(index)}
                onOpenChange={() => toggleItem(index)}
              >
                <CollapsibleTrigger className="w-full bg-white rounded-lg p-6 text-left hover:bg-gray-50 transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openItems.has(index) ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-white border-l border-r border-b border-gray-200 rounded-b-lg px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
