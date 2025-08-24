import React from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { t } from "@/components/utils/i18n";

const FeedbackButtons = ({ onFeedback, size = "sm" }) => {
  const handleFeedback = (isHelpful) => {
    if (typeof onFeedback === 'function') {
      onFeedback(isHelpful);
    } else {
      console.warn("onFeedback prop is not a function or is undefined.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size={size}
        onClick={() => handleFeedback(true)}
        className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
        title={t('insights.feedback.helpful')}
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size={size}
        onClick={() => handleFeedback(false)}
        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        title={t('insights.feedback.notHelpful')}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FeedbackButtons;