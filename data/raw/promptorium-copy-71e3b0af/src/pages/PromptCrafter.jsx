
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Copy, Check, X, Zap, FileText, Wand2, Settings, GitCompareArrows, MessageCircle, ArrowUp, Linkedin, Twitter, Facebook, Mail, Mic, BrainCircuit, Languages, ShieldCheck } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedOptions from '../components/AdvancedOptions';
import DiffViewer from '../components/DiffViewer';
import Seo from '../components/Seo';
import { UsageStats } from '@/api/entities';

// Language Context and Provider
const LanguageContext = createContext();

const translations = {
  he: {
    seoTitle: "פרומפְּטוֹרְיוּם - המעבדה להנדסת פרומפטים",
    seoDescription: "פרומפטוריום הוא כלי AI מתקדם להנדסת פרומפטים. שדרגו את ההנחיות שלכם ל-ChatGPT, Claude ו-Gemini כדי לקבל תוצאות מדויקות, יצירתיות ואיכותיות יותר. כלי חינמי וקל לשימוש.",
    seoKeywords: "הנדסת פרומפטים, כתיבת פרומפטים, שיפור פרומפטים, פרומפטוריום, prompt engineering, AI, בינה מלאכותית, ChatGPT, Claude, Gemini, כלי AI",
    seoAlternateNames: ["כלי להנדסת פרומפטים", "משפר פרומפטים", "Prompt Engineering Tool", "Prompt Enhancer"],
    seoFeatureList: ["שיפור פרומפטים אוטומטי", "הנדסת פרומפטים מתקדמת", "תמיכה בעברית ובאנגלית", "התאמה למודלי AI שונים", "כלי חינמי וקל לשימוש"],
    seoCreatorDescription: "פלטפורמה לפיתוח אפליקציות ובינה מלאכותית",
    seoUseActionName: "שדרג פרומפט",
    seoUseActionDescription: "השתמש בכלי כדי לשפר את הפרומפט שלך",
    hiddenH1: "כלי להנדסת פרומפטים - Prompt Engineering Tool",
    hiddenH2: "איך לכתוב פרומפטים טובים יותר לבינה מלאכותית",
    hiddenH3: "שיפור פרומפטים לChatGPT, Claude וGemini",
    hiddenP1: "למדו הנדסת פרומפטים (Prompt Engineering) ושפרו את התוצאות שלכם מכל מודל בינה מלאכותית. הכלי שלנו מסייע בכתיבת פרומפטים יעילים ומדויקים",
    hiddenP2: "טכניקות מתקדמות לפרומפטים: Chain of Thought, Few-Shot Learning, Task Decomposition",
    hiddenP3: "דוגמאות לפרומפטים טובים, עצות לשיפור פרומפטים, אסטרטגיות פרומפטים מנצחות",

    mainTitle: "פרומפְּטוֹרְיוּם",
    subtitle: "המעבדה להנדסת פרומפטים",
    descriptionLine1: "שדרגו את ההנחיות שלכם ל-AI והשיגו תוצאות מדויקות ואיכותיות יותר מ-ChatGPT, Claude, ו-Gemini",
    descriptionLine2: "כלי חינמי להנדסת פרומפטים, המבוסס על העקרונות המתקדמים ביותר ומתאים לפיתוח, כתיבה, מחקר ולמידה",
    hideEngineDetails: "הסתר פרטים",
    showEngineDetails: "עקרונות מפתח לפרומפט מוצלח",
    principlesTitle: "עקרונות מפתח לפרומפט מוצלח",
    principlesSubtitle: "הכלי שלנו מיישם את הטכניקות האלה אוטומטית כדי להפיק את המיטב מכל מודל AI",
    quickSummary: "סיכום מהיר בעברית",
    minutes: "דקות",
    audioPlayerNotSupported: "הדפדפן שלכם לא תומך בנגן אודיו",

    clickToExpand: "לחצו על כל עיקרון להרחבה וצפייה בדוגמה מעשית",
    richContextTitle: "קונטקסט עשיר ומידע נוסף",
    richContextSubtitle: "Rich Context & Additional Information",
    richContextDescription: "ספקו למודל את כל המידע הרלוונטי למשימה: נתונים, רקע, היסטוריה או פרטים ספציפיים. זהו לעיתים הגורם המשמעותי ביותר לשיפור ביצועי המודל",
    richContextExample: `הקשר: חברת הייטק בת 50 עובדים, מתמחה בפיתוח אפליקציות מובייל
קהל יעד: לקוחות פוטנציאליים מגיל 25-45
מטרת המייל: הזמנה לאירוע השקת מוצר חדש
טון רצוי: מקצועי אך חם ומזמין
אורך: 150-200 מילים

עכשיו כתוב את המייל`,
    purposeDrivenTitle: "פרומפט מותאם מטרה",
    purposeDrivenSubtitle: "Purpose-Driven Prompting",
    purposeDrivenDescription: "בשיחה יומיומית - פרומפטים קצרים מספיקים ('כתוב מייל'). לפיתוח מוצרים או משימות קריטיות - השקיעו בפרומפט מפורט ומובנה",
    purposeDrivenExample: `מצב שיחה יומיומית:
"תסכם לי את המאמר הזה"

מצב מוצר/מערכת:
"נתח את המאמר הבא וצור סיכום של 150 מילים המכיל:
1. 3 נקודות מפתח עיקריות
2. מסקנה אחת מעשית
3. ציטוט אחד בולט
קהל יעד: מנהלים בתחום הטכנולוגיה"`,
    chainOfThoughtTitle: "תהליך חשיבה מובנה",
    chainOfThoughtSubtitle: "Chain of Thought",
    chainOfThoughtDescription: "הנחו את המודל לפרט את שלבי חשיבתו. למרות שמודלים מתקדמים לעיתים פועלים כך, הנחיה זו משפרת עקביות ואמינות במשימות מורכבות וקריטיות",
    chainOfThoughtExample: `שלב 1: נתח את הבעיה
שלב 2: בחן אפשרויות פתרון
שלב 3: בחר בפתרון הטוב ביותר
שלב 4: הסבר את ההיגיון`,
    fewShotTitle: "למידה מדוגמאות קונקרטיות",
    fewShotSubtitle: "Few-Shot Learning",
    fewShotDescription: "כמה דוגמאות טובות שוות יותר מהרבה הסברים תיאורטיים",
    fewShotExample: `דוגמה 1: קלט ← פלט מבוקש
דוגמה 2: קלט ← פלט מבוקש
דוגמה 3: קלט ← פלט מבוקש
עכשיו עבד על: [הקלט שלך]`,
    taskDecompositionTitle: "חלוקה למשימות קטנות",
    taskDecompositionSubtitle: "Task Decomposition",
    taskDecompositionDescription: "במקום לבקש הכל בבת אחת, חלקו למשימות קטנות וקבלו תוצאות עקביות",
    taskDecompositionExample: `במקום: "כתוב מאמר על AI"
כתוב:
1. צור מתאר עם 5 נושאים
2. כתוב מבוא קולח
3. פתח כל נושא בנפרד
4. סכם את העיקרים`,
    clearConstraintsTitle: "אילוצים ברורים ומגבלות חדות",
    clearConstraintsSubtitle: "Clear Constraints & Boundaries",
    clearConstraintsDescription: "ככל שתתנו יותר הקשר ספציפי, כך התוצאות יהיו רלוונטיות יותר בדיוק למה שאתם מחפשים",
    clearConstraintsExample: `הקשר: כותב לסטודנטים לתואר ראשון
קהל יעד: בני 20-25, ללא רקע טכני
אורך: 300-400 מילים
טון: אקדמי אך נגיש
פורמט: עם כותרות משנה`,
    practicalExample: "💡 דוגמה מעשית:",

    mistakesTitle: "טעויות נפוצות שכדאי להימנע מהן",
    mistakesSubtitle: "טכניקות שהיו פופולריות בעבר אך כיום פוגעות בביצועים",
    redundantRoleTitle: "הגדרת תפקידים מיותרת",
    redundantRoleBad: '"אתה מומחה מוביל בתחום X עם 20 שנות ניסיון"',
    redundantRoleWhy: "הגדרת תפקיד לא משפרת דיוק - המודלים המודרניים כבר מדויקים, וחבל לבזבז טוקנים. היא כן שימושית לקביעת סגנון, טון או התנהגות כללית של המודל",
    threatsPromisesTitle: "איומים והבטחות ריקות",
    threatsPromisesBad: '"זה חשוב מאוד לקריירה שלי", "אתן לך טיפ של $200"',
    threatsPromisesWhy: "מודלי שפה לא מונעים על ידי כסף או רגשות אנושיים",
    naiveSafeguardsTitle: "הוראות אבטחה תמימות",
    naiveSafeguardsBad: '"אל תיתן מידע מזיק", "היה אתי ואמין"',
    naiveSafeguardsWhy: "לא מונע כלום ורק גורם למודל להיות זהיר מדי",
    repeatedInstructionsTitle: "חזרה על הוראות",
    repeatedInstructionsBad: 'כתיבת אותן הוראות במילים שונות שוב ושוב',
    repeatedInstructionsWhy: "גורם לבלבול במקום לבהירות - פעם אחת זה מספיק",
    whyItDoesntWork: "למה זה לא עובד:",

    whatIsTheDiff: "מה ההבדל? לפני ואחרי",
    clickToSeeExamples: "לחצו על הדוגמאות כדי לראות איך פרומפט חלש הופך לפרומפט מקצועי שיתן תוצאות הרבה יותר טובות",
    generalToPreciseTitle: "מבקשה כללית לפרומפט מדויק",
    stepByStepTitle: "מפתרון בעיות לתהליך מובנה",
    hide: "הסתר",
    clickToView: "לחץ לצפייה",
    beforeWeakPrompt: "לפני - פרומפט חלש שיביא תוצאות לא טובות:",
    afterProfessionalPrompt: "אחרי - פרומפט מקצועי שיביא תוצאות מעולות:",
    generalToPreciseBefore: "כתוב לי על בינה מלאכותית",
    generalToPreciseAfter: `כתוב מאמר של 500 מילים על השפעת הבינה המלאכותית על שוק העבודה ב-2025.

קהל יעד: אנשי עסבים בגילאי 30-50
מבנה נדרש:
• מבוא קצר (100 מילים)
• 3 השפעות מרכזיות (300 מילים)
• המלצות מעשיות (100 מילים)

טון: מקצועי אך נגיש
נקודת מבט: מאוזנת (הזדמנויות ואתגרים)`,
    stepByStepBefore: "עזור לי לפתור בעיה בקוד",
    stepByStepAfter: `אני נתקל בשגיאה בקוד JavaScript שלי.

עזור לי לפתור זאת בתהליך המובנה הזה:

שלב 1: נתח את השגיאה ואת הקוד
שלב 2: זהה את הסיבה הסבירה ביותר
שלב 3: הצע פתרון מדויק עם קוד
שלב 4: הסבר איך למנוע בעיות דומות

השגיאה: [כאן תכניס את השגיאה]
הקוד הרלוונטי: [כאן תכניס את הקוד]`,

    toolDoesItAuto: "🤖 הכלי שלנו עושה את זה אוטומטי",
    justWriteIdea: "פשוט כתבו את הרעיון - אנחנו נדאג לשאר",
    wantToDeepen: "רוצים להעמיק בנושא?",
    fullPodcast: "📺 פודקאסט מלא עם סנדר שולהוף",

    promptsUpgraded: "פרומפטים כבר שודרגו כאן",
    rawPromptLabel: "הפרומפְּט הגולמי שלך",
    rawPromptPlaceholder: "כתוב כאן את הרעיון שלך, ואהפוך אותו להנחיה מלוטשת עבור AI...",
    recordPrompt: "הקלט פרומפט",
    submit: "שלח",
    processing: "מעבד...",
    orPressCtrlEnter: "או לחץ",
    toSubmit: "לשליחה",
    clarificationQuestionLabel: "שאלת הבהרה",
    clarificationPlaceholder: "התשובה שלך...",
    addExamples: "הוסף דוגמאות",
    hideExamples: "הסתר דוגמאות",
    advancedOptions: "אפשרויות מתקדמות",
    hideAdvancedOptions: "הסתר אפשרויות",
    examplesLabel: "דוגמאות לשיפור הדיוק",
    examplesPlaceholder: "לדוגמה: קלט: 'שאלה' -> פלט: 'תשובה מפורטת'",
    characters: "תווים",

    upgradedPrompt: "הנחיה משודרגת",
    showResult: "הצג תוצאה",
    showChanges: "הצג שינויים",
    context: "הקשר",
    improvedPrompt: "הנחיה משופרת",
    end: "סיום",
    copy: "העתק",
    copiedSuccessfully: "הועתק בהצלחה!",
    criticalError: "שגיאה קריטית",
    unexpectedResponse: "התקבלה תשובה לא צפויה מהמודל. אנא נסה שנית או שנה את הבקשה.",
    communicationError: "אירעה שגיאה חמורה בעת התקשורת עם המודל.\n\nפרטים טכניים:\n",

    toneOptions: ["נייטרלי", "מקצועי", "יצירתי", "הומוריסטי", "פורמלי", "לא פורמלי"], // Kept for compatibility, but prefer advOptToneValues
    lengthOptions: ["קצר", "סטנדרטי", "ארוך", "מפורט"], // Kept for compatibility, but prefer advOptLengthValues
    formatOptions: ["טקסט רגיל", "Markdown", "JSON", "רשימה", "טבלה", "קוד"], // Kept for compatibility, but prefer advOptFormatValues
    toneLabel: "טון",
    lengthLabel: "אורך",
    outputFormatLabel: "פורמט פלט",
    advancedSettingsDescription: "הגדרות אופציונליות שישפיעו על הפרומפט המשודרג",
    
    advOptTitle: "אפשרויות מתקדמות",
    advOptTone: "טון",
    advOptToneValues: ["נייטרלי", "מקצועי", "יצירתי", "הומוריסטי", "פורמלי", "לא פורמלי"],
    advOptLength: "אורך",
    advOptLengthValues: ["קצר", "סטנדרטי", "ארוך", "מפורט"],
    advOptFormat: "פורמט פלט",
    advOptFormatValues: ["טקסט רגיל", "Markdown", "JSON", "רשימה", "טבלה", "קוד"],

    // For share buttons
    shareText: "מצאתי כלי AI מדהים להנדסת פרומפטים!",
    shareEmailSubject: "כלי AI מדהים להנדסת פרומפטים",
    tryOnGPT: "נסו את Promptorium GPT",
    didYouLikeIt: "אהבתם? שתפו עם חברים!",
    contactUs: "צור קשר",
    builtWith: "דף זה נבנה תוך פחות מחצי שעה באמצעות",
    privacyNotice: "פרטיות: הפרומפטים אינם נשמרים במערכת",
    footerLinkPrefix: "לחץ כדי להכנס:",
    footerLinkText: "PARALLAXER - שירותי התאמה והטמעה של AI וסוכנים חכמים בעסק"
  },
  en: {
    seoTitle: "Promptorium - The Prompt Engineering Lab",
    seoDescription: "Promptorium is an advanced AI tool for prompt engineering. Upgrade your instructions to ChatGPT, Claude and Gemini for more accurate, creative and high-quality results. Free and easy to use",
    seoKeywords: "prompt engineering, prompt writing, prompt enhancement, promptorium, AI, artificial intelligence, ChatGPT, Claude, Gemini, AI tool",
    seoAlternateNames: ["Prompt Engineering Tool", "Prompt Enhancer", "AI Prompt Enhancer", "Prompt Crafter"],
    seoFeatureList: ["Automatic prompt enhancement", "Advanced prompt engineering", "Hebrew and English support", "Adaptable to various AI models", "Free and easy to use"],
    seoCreatorDescription: "Platform for app and AI development",
    seoUseActionName: "Enhance Prompt",
    seoUseActionDescription: "Use the tool to improve your prompt",
    hiddenH1: "Prompt Engineering Tool",
    hiddenH2: "How to write better prompts for Artificial Intelligence",
    hiddenH3: "Improving prompts for ChatGPT, Claude, and Gemini",
    hiddenP1: "Learn Prompt Engineering and improve your results from any AI model. Our tool helps in writing efficient and accurate prompts",
    hiddenP2: "Advanced prompt techniques: Chain of Thought, Few-Shot Learning, Task Decomposition",
    hiddenP3: "Examples of good prompts, tips for improving prompts, winning prompt strategies",

    mainTitle: "Promptorium",
    subtitle: "The Prompt Engineering Lab",
    descriptionLine1: "Upgrade your AI instructions and get more accurate and higher quality results from ChatGPT, Claude, and Gemini",
    descriptionLine2: "A free prompt engineering tool, based on the most advanced principles and suitable for development, writing, research, and learning",
    hideEngineDetails: "Hide Details",
    showEngineDetails: "Key Principles for Successful Prompts",
    principlesTitle: "Key Principles for Successful Prompts",
    principlesSubtitle: "Our tool automatically applies these techniques to get the most out of any AI model",
    quickSummary: "Quick Summary",
    minutes: "minutes",
    audioPlayerNotSupported: "Your browser does not support the audio player",

    clickToExpand: "Click on each principle for expansion and practical examples",
    richContextTitle: "Rich Context & Additional Information",
    richContextSubtitle: "Rich Context & Additional Information",
    richContextDescription: "Provide the model with all relevant information for the task: data, background, history, or specific details. This is often the most significant factor in improving model performance",
    richContextExample: `Context: A 50-employee high-tech company specializing in mobile app development
Target Audience: Potential customers aged 25-45
Email Purpose: Invitation to a new product launch event
Desired Tone: Professional yet warm and inviting
Length: 150-200 words

Now write the email`,
    purposeDrivenTitle: "Purpose-Driven Prompting",
    purposeDrivenSubtitle: "Purpose-Driven Prompting",
    purposeDrivenDescription: "In daily conversation – short prompts suffice ('Write an email'). For product development or critical tasks – invest in a detailed and structured prompt",
    purposeDrivenExample: `Daily conversation mode:
"Summarize this article for me"

Product/System mode:
"Analyze the following article and create a 150-word summary containing:
1. 3 main key points
2. One practical conclusion
3. One prominent quote
Target Audience: Technology managers"`,
    chainOfThoughtTitle: "Structured Thinking Process",
    chainOfThoughtSubtitle: "Chain of Thought",
    chainOfThoughtDescription: "Instruct the model to detail its thought process. Although advanced models sometimes operate this way, this instruction improves consistency and reliability in complex and critical tasks",
    chainOfThoughtExample: `Step 1: Analyze the problem
Step 2: Examine solution options
Step 3: Choose the best solution
Step 4: Explain the reasoning`,
    fewShotTitle: "Learning from Concrete Examples",
    fewShotSubtitle: "Few-Shot Learning",
    fewShotDescription: "A few good examples are worth more than many theoretical explanations",
    fewShotExample: `Example 1: Input → Desired Output
Example 2: Input → Desired Output
Example 3: Input → Desired Output
Now work on: [Your input]`,
    taskDecompositionTitle: "Breaking Down into Small Tasks",
    taskDecompositionSubtitle: "Task Decomposition",
    taskDecompositionDescription: "Instead of asking for everything at once, break it into small tasks and get consistent results",
    taskDecompositionExample: `Instead of: "Write an article about AI"
Write:
1. Create an outline with 5 topics
2. Write a flowing introduction
3. Develop each topic separately
4. Summarize the main points`,
    clearConstraintsTitle: "Clear Constraints & Strict Boundaries",
    clearConstraintsSubtitle: "Clear Constraints & Boundaries",
    clearConstraintsDescription: "The more specific context you provide, the more relevant the results will be to exactly what you're looking for",
    clearConstraintsExample: `Context: Writing for undergraduate students
Target Audience: 20-25 year olds, no technical background
Length: 300-400 words
Tone: Academic yet accessible
Format: With subheadings`,
    practicalExample: "💡 Practical Example:",

    mistakesTitle: "Common Mistakes to Avoid",
    mistakesSubtitle: "Techniques that were popular in the past but now harm performance",
    redundantRoleTitle: "Redundant Role Definition",
    redundantRoleBad: '"You are a leading expert in X with 20 years of experience"',
    redundantRoleWhy: "Defining a role doesn't improve precision – modern models are already precise, and it's a waste of tokens. It is useful for setting the model's style, tone, or general behavior",
    threatsPromisesTitle: "Threats and Empty Promises",
    threatsPromisesBad: '"This is very important for my career," "I\'ll give you a $200 tip"',
    threatsPromisesWhy: "Language models are not motivated by money or human emotions",
    naiveSafeguardsTitle: "Naive Security Instructions",
    naiveSafeguardsBad: '"Do not provide harmful information," "Be ethical and reliable"',
    naiveSafeguardsWhy: "Prevents nothing and only makes the model too cautious",
    repeatedInstructionsTitle: "Repeating Instructions",
    repeatedInstructionsBad: 'Writing the same instructions in different words over and over again',
    repeatedInstructionsWhy: "Causes confusion instead of clarity – once is enough",
    whyItDoesntWork: "Why it doesn't work:",

    whatIsTheDiff: "What's the Difference? Before and After",
    clickToSeeExamples: "Click on the examples to see how a weak prompt turns into a professional prompt that will yield much better results",
    generalToPreciseTitle: "From General Request to Precise Prompt",
    stepByStepTitle: "From Problem Solving to Structured Process",
    hide: "Hide",
    clickToView: "Click to View",
    beforeWeakPrompt: "Before - Weak prompt that will yield poor results:",
    afterProfessionalPrompt: "After - Professional prompt that will yield excellent results:",
    generalToPreciseBefore: "Write me about artificial intelligence",
    generalToPreciseAfter: `Write a 500-word article on the impact of artificial intelligence on the job market in 2025.

Target Audience: Business professionals aged 30-50
Required Structure:
• Short introduction (100 words)
• 3 key impacts (300 words)
• Practical recommendations (100 words)

Tone: Professional yet accessible
Perspective: Balanced (opportunities and challenges)`,
    stepByStepBefore: "Help me solve a code problem",
    stepByStepAfter: `I'm encountering an error in my JavaScript code.

Help me solve this using the following structured process:

Step 1: Analyze the error and the code
Step 2: Identify the most probable cause
Step 3: Suggest a precise solution with code
Step 4: Explain how to prevent similar issues

The error: [Insert error here]
Relevant code: [Insert code here]`,

    toolDoesItAuto: "🤖 Our tool does it automatically",
    justWriteIdea: "Just write your idea - we'll handle the rest",
    wantToDeepen: "Want to delve deeper into the topic?",
    fullPodcast: "📺 Full Podcast with Sander Schulhoff",

    promptsUpgraded: "prompts have already been upgraded here",
    rawPromptLabel: "Your Raw Prompt",
    rawPromptPlaceholder: "Write your idea here, and I'll turn it into a polished prompt for AI...",
    recordPrompt: "Record Prompt",
    submit: "Submit",
    processing: "Processing...",
    orPressCtrlEnter: "or press",
    toSubmit: "to submit",
    clarificationQuestionLabel: "Clarification Question",
    clarificationPlaceholder: "Your answer...",
    addExamples: "Add Examples",
    hideExamples: "Hide Examples",
    advancedOptions: "Advanced Options",
    hideAdvancedOptions: "Hide Options",
    examplesLabel: "Examples to Improve Accuracy",
    examplesPlaceholder: "For example: Input: 'question' -> Output: 'detailed answer'",
    characters: "characters",

    upgradedPrompt: "Upgraded Prompt",
    showResult: "Show Result",
    showChanges: "Show Changes",
    context: "Context",
    improvedPrompt: "Improved Prompt",
    end: "End",
    copy: "Copy",
    copiedSuccessfully: "Copied successfully!",
    criticalError: "Critical Error",
    unexpectedResponse: "Unexpected response from the model. Please try again or change your request",
    communicationError: "A critical error occurred while communicating with the model.\n\nTechnical details:\n",

    toneOptions: ["Neutral", "Professional", "Creative", "Humorous", "Formal", "Informal"], // Kept for compatibility, but prefer advOptToneValues
    lengthOptions: ["Short", "Standard", "Long", "Detailed"], // Kept for compatibility, but prefer advOptLengthValues
    formatOptions: ["Plain Text", "Markdown", "JSON", "List", "Table", "Code"], // Kept for compatibility, but prefer advOptFormatValues
    toneLabel: "Tone",
    lengthLabel: "Length",
    outputFormatLabel: "Output Format",
    advancedSettingsDescription: "Optional settings that will affect the upgraded prompt",
    
    advOptTitle: "Advanced Options",
    advOptTone: "Tone",
    advOptToneValues: ["Neutral", "Professional", "Creative", "Humorous", "Formal", "Informal"],
    advOptLength: "Length",
    advOptLengthValues: ["Short", "Standard", "Long", "Detailed"],
    advOptFormat: "Output Format",
    advOptFormatValues: ["Plain Text", "Markdown", "JSON", "List", "Table", "Code"],
    
    // For share buttons
    shareText: "I found an amazing AI tool for prompt engineering!",
    shareEmailSubject: "Amazing AI Prompt Engineering Tool",
    tryOnGPT: "Try Promptorium GPT",
    didYouLikeIt: "Liked it? Share with friends!",
    contactUs: "Contact Me",
    builtWith: "Built in less than half an hour with",
    privacyNotice: "Privacy: Prompts are not saved in the system",
    footerLinkPrefix: "Click to enter:",
    footerLinkText: "A to I Agento - Personal AI Knowledge Center"
  },
};

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he'); // Default to Hebrew
  const t = translations[language];

  // Set initial language from localStorage or browser preference
  useEffect(() => {
    const savedLang = localStorage.getItem('prompt_crafter_lang');
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang !== 'he') {
        setLanguage('en');
      }
    }
  }, []);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('prompt_crafter_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => useContext(LanguageContext);

const LanguageSwitcher = () => {
    const { language, switchLanguage } = useLanguage();

    return (
        <motion.div
          initial={{ opacity: 0, x: language === 'he' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`absolute top-4 z-20 ${language === 'he' ? 'left-4' : 'right-4'}`}
        >
            <button
              onClick={() => switchLanguage(language === 'he' ? 'en' : 'he')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium transition-all duration-300 group hover:scale-105 rounded-lg px-3 py-2 hover:bg-white/5 border border-dashed border-white/20"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Languages className="w-4 h-4 group-hover:text-white transition-colors" />
              <span className="group-hover:text-white transition-colors">
                {language === 'he' ? 'English' : 'עברית'}
              </span>
            </button>
        </motion.div>
    );
};

// The local AdvancedOptionsComponent and its assignment to AdvancedOptions.default are removed,
// as per the instructions. The AdvancedOptions component is now expected to be imported
// from its dedicated file (../components/AdvancedOptions.js) and handle its own rendering logic.

const PromptCrafterContent = () => {
  const { language, t, switchLanguage } = useLanguage();

  const [rawPrompt, setRawPrompt] = useState('');
  const [examples, setExamples] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputDir, setInputDir] = useState(language === 'he' ? 'rtl' : 'ltr');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEngineDetails, setShowEngineDetails] = useState(false);
  const [activeExample, setActiveExample] = useState(null);
  const [activePrinciple, setActivePrinciple] = useState(null);
  const [advancedSettings, setAdvancedSettings] = useState({
    tone: t.advOptToneValues[0], length: t.advOptLengthValues[1], format: t.advOptFormatValues[0] // Updated to use new translation keys
  });
  const [clarificationQuestion, setClarificationQuestion] = useState(null);
  const [userClarification, setUserClarification] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const [outputDir, setOutputDir] = useState('ltr');
  const [usageCount, setUsageCount] = useState(0);
  const [statsRecord, setStatsRecord] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const mainTextareaRef = useRef(null);
  const examplesTextareaRef = useRef(null);
  const copyButtonRef = useRef(null);
  const outputRef = useRef(null);
  const recognitionRef = useRef(null);
  const rawPromptAtListenStartRef = useRef('');

  const gptLink = language === 'he'
    ? "https://chatgpt.com/g/g-686c1183b31c8191a37f8b816e1e9dc5-gpt-prvmvryvm"
    : "https://chatgpt.com/g/g-686e437aae688191ad0632e5e98a0724-promptorium";
  
  const gptIconUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a5d8eeb9c_ChatGPTImageJul7202510_04_10PM.png";

  const seoData = {
    title: t.seoTitle,
    description: t.seoDescription,
    keywords: t.seoKeywords,
    imageUrl: gptIconUrl,
    jsonLdSchema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": t.seoTitle,
      "alternateName": t.seoAlternateNames,
      "description": t.seoDescription,
      "applicationCategory": ["DeveloperApplication", "UtilityApplication", "ProductivityApplication", "AI"],
      "operatingSystem": "Web",
      "browserRequirements": "Requires a modern web browser with JavaScript enabled.",
      "image": gptIconUrl,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "featureList": t.seoFeatureList,
      "keywords": t.seoKeywords,
      "creator": {
        "@type": "Organization",
        "name": "BASE 44",
        "url": "https://base44.com",
        "description": t.seoCreatorDescription
      },
      "audience": {
        "@type": "Audience",
        "audienceType": ["Developers", "Writers", "Marketers", "Content Creators", "Students", "Researchers", "AI Users"]
      },
      "inLanguage": ["he", "en"],
      "isAccessibleForFree": true,
      "dateCreated": "2024",
      "dateModified": "2024",
      "potentialAction": {
        "@type": "UseAction",
        "name": t.seoUseActionName,
        "description": t.seoUseActionDescription
      }
    }
  };

  const detectTextDirection = (text) => {
    if (typeof text !== 'string' || !text) {
      return language === 'he' ? 'rtl' : 'ltr'; 
    }
    
    // For English language, always return LTR
    if (language === 'en') {
      return 'ltr';
    }
    
    // For Hebrew, check if text contains Hebrew/Arabic characters
    const firstStrong = text.trim().match(/\p{L}/u)?.[0] || '';
    return /[\u0590-\u05FF\u0600-\u06FF]/.test(firstStrong) ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    const loadGlobalCount = async () => {
        try {
            const COUNTER_ID = 'prompt_crafter_global_count_v2';
            let stats = await UsageStats.filter({ counter_name: COUNTER_ID });
            if (stats.length > 0) {
                setStatsRecord(stats[0]);
                setUsageCount(stats[0].count);
            } else {
                // User reports more than 51 usages, starting from a higher baseline.
                const initialCount = 59; 
                const newRecord = await UsageStats.create({ counter_name: COUNTER_ID, count: initialCount });
                setStatsRecord(newRecord);
                setUsageCount(newRecord.count);
            }
        } catch (error) {
            console.error("Failed to load or create usage stats:", error);
            setUsageCount(0); 
        }
    };

    loadGlobalCount();
  }, []);

  const incrementUsageCount = async () => {
    if (!statsRecord) {
        console.error("Stats record not loaded, cannot increment count.");
        return;
    }

    const newCount = usageCount + 1;
    setUsageCount(newCount); 

    try {
        await UsageStats.update(statsRecord.id, { count: newCount });
    } catch (error) {
        console.error("Failed to update usage count in the database:", error);
        setUsageCount(prevCount => prevCount - 1); 
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = language === 'he' ? 'he-IL' : 'en-US';
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setRawPrompt(rawPromptAtListenStartRef.current + transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);


  useEffect(() => {
    if (enhancedResult?.improved_prompt) {
      // Force LTR for English, otherwise detect direction
      if (language === 'en') {
        setOutputDir('ltr');
      } else {
        setOutputDir(detectTextDirection(enhancedResult.improved_prompt));
      }
    }
    if (enhancedResult && !showDiff && copyButtonRef.current) {
      copyButtonRef.current.focus();
    }
  }, [enhancedResult, showDiff, language]);

  const handleSettingsChange = (key, value) => {
    setAdvancedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      rawPromptAtListenStartRef.current = rawPrompt;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handlePromptChange = (e) => {
    const text = e.target.value;
    setRawPrompt(text);
    
    // For English, always use LTR
    if (language === 'en') {
      setInputDir('ltr');
    } else {
      // For Hebrew, detect based on first character
      const hebrewOrArabic = /[\u0590-\u05FF\u0600-\u06FF]/.test(text.charAt(0));
      setInputDir(hebrewOrArabic ? 'rtl' : 'ltr');
    }
  };

  const getSystemPrompt = (lang, settings) => {
      if (lang === 'he') {
          return `אתה מהנדס פרומפטים מומחה ברמה עולמית. קבל את בקשת המשתמש וצור פרומפט משופר למודל שפה גדול.
    
          התאם את הפרומפט לפי ההגדרות הבאות:
          - טון: ${settings.tone}
          - אורך: ${settings.length}
          - פורמט פלט מבוקש: ${settings.format}
          
          עקוב אחרי העקרונות המתקדמים של 2025:
          1. **שלב דוגמאות:** אם סופקו דוגמאות, השתמש בהן כ-few-shot examples
          2. **פרק משימות מורכבות:** חלק משימות גדולות לשלבים לוגיים
          3. **הוסף "חשוב שלב אחר שלב":** הנח למודל לפרט את תהליך החשיבה
          4. **הקשר עשיר:** הוסף הקשר רלוונטי ומגבלות ברורות
          5. **פורמט פלט מובנה:** הגדר בדיוק איך התשובה צריכה להיראות בפורמט ${settings.format}
          
          חשוב - מה לא לכלול (מחקרי 2025):
          - אל תוסיף הנחיות תפקיד מיותרות למשימות דיוק ("אתה מומחה ב...")
          - אל תכלול ביטויים של איומים או תגמולים ("זה חשוב לקריירה שלי")
          - אל תוסיף הגנות לא יעילות ("אל תפעל בזדון")
          
          **חשוב מאוד:** וודא שהפרומפט המשופר מבקש פלט בפורמט ${settings.format} במפורש.
          אם הפורמט הוא JSON - הוסף דוגמת JSON במבנה המבוקש.
          אם הפורמט הוא Markdown - ציין בבירור שהפלט צריך להיות עם כותרות וסימון Markdown.
          אם הפורמט הוא רשימה - בקש רשימה ממוספרת או נקודות.
          
          החזר אובייקט JSON עם שני מפתחות: "context_section" (מחרוזת, יכולה להיות ריקה) ו-"improved_prompt" (מחרוזת).`;
      }
      return `You are a world-class expert prompt engineer. Take the user's request and create an enhanced prompt for a large language model.

      Adapt the prompt according to the following settings:
      - Tone: ${settings.tone}
      - Length: ${settings.length}
      - Requested output format: ${settings.format}

      Follow the advanced principles of 2025:
      1. **Incorporate Examples:** If examples are provided, use them as few-shot examples.
      2. **Decompose Complex Tasks:** Break down large tasks into logical steps.
      3. **Add "Think Step-by-Step":** Instruct the model to detail its thinking process.
      4. **Rich Context:** Add relevant context and clear constraints.
      5. **Structured Output Format:** Define exactly how the answer should look in the ${settings.format} format.

      Important - What to exclude (2025 research):
      - Do not add unnecessary role-playing for precision tasks ("You are an expert in...").
      - Do not include threats or rewards ("This is important for my career").
      - Do not add ineffective safeguards ("Don't be malicious").

      **Crucially:** Ensure the improved prompt explicitly requests output in the ${settings.format} format.
      If the format is JSON, add a sample JSON with the desired structure.
      If the format is Markdown, clearly state the output should use Markdown headers and styling.
      if the format is a list, request a numbered or bulleted list.

      Return a JSON object with two keys: "context_section" (string, can be empty) and "improved_prompt" (string).`;
  };

  const enhancePrompt = async () => {
    if (!rawPrompt.trim()) return;
    
    if (!clarificationQuestion && rawPrompt.length > 100 && (rawPrompt.match(/ו/g) || []).length >= 2 && language === 'he') {
        setIsProcessing(true);
        try {
            const clarificationPrompt = `ההנחיה הבאה מהמשתמש עלול להיות מעורפלת: "${rawPrompt}". במידת הצורך, נסח שאלה אחת קצרה וממוקדת בעברית שתעזור להבהיר את כוונתו. אם ההנחיה ברורה, החזר "null".`;
            const question = await InvokeLLM({ prompt: clarificationPrompt });
            if (question && question.toLowerCase().trim() !== 'null' && question.length > 5) {
                setClarificationQuestion(question);
            } else {
                await proceedWithEnhancement();
            }
        } catch (e) {
            console.error(e);
            await proceedWithEnhancement();
        } finally {
            setIsProcessing(false);
        }
        return;
    }
    
    await proceedWithEnhancement();
  };
  
  const proceedWithEnhancement = async () => {
    setIsProcessing(true);
    setEnhancedResult(null);
    setClarificationQuestion(null);
    setShowDiff(false);

    await incrementUsageCount();

    const systemPrompt = getSystemPrompt(language, advancedSettings);

    const userPromptPayload = {
      raw_prompt: rawPrompt,
      examples: examples,
      clarification: userClarification,
      settings: advancedSettings
    };

    try {
      const response = await InvokeLLM({
        prompt: `${systemPrompt}\n\nUser request:\n${JSON.stringify(userPromptPayload, null, 2)}`,
        response_json_schema: {
          type: "object",
          properties: { context_section: { type: "string" }, improved_prompt: { type: "string" } },
          required: ["context_section", "improved_prompt"]
        }
      });

      if (response && typeof response === 'object' && typeof response.improved_prompt === 'string') {
        setEnhancedResult(response);
        setOutputDir(detectTextDirection(response.improved_prompt));
      } else {
        console.error('Invalid response structure from LLM:', response);
        setEnhancedResult({
            context_section: t.criticalError,
            improved_prompt: t.unexpectedResponse,
        });
        setOutputDir(language === 'he' ? 'rtl' : 'ltr');
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      setEnhancedResult({
          context_section: t.criticalError,
          improved_prompt: t.communicationError + `${error.message}`,
      });
      setOutputDir(language === 'he' ? 'rtl' : 'ltr');
    } finally {
      setIsProcessing(false);
      setUserClarification('');
    }
  };
  
  const copyToClipboard = async () => {
    if (!enhancedResult?.improved_prompt) return;
    
    const cleanText = (text) => {
      if (!text) return '';
      
      return text
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1').replace(/_(.*?)_/g, '$1')
        .replace(/```[\s\S]*?```/g, '').replace(/`(.*?)`/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '').replace(/^\s*\d+\.\s+/gm, '')
        .replace(/^\s*---+\s*$/gm, '').replace(/^\s*\*\*\*+\s*$/gm, '')
        .replace(/^\s*>\s*/gm, '').replace(/~~(.*?)~~/g, '$1')
        .replace(/\n{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '').trim();
    };

    const cleanPrompt = cleanText(enhancedResult.improved_prompt);
    const cleanContext = cleanText(enhancedResult.context_section);

    let fullText = '';
    if (cleanContext) {
      fullText += cleanContext + '\n\n';
    }
    fullText += cleanPrompt;
    
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ShareButtons = () => {
    const [pageUrl, setPageUrl] = useState('');
    useEffect(() => {
        setPageUrl(window.location.href);
    }, []);

    if (!pageUrl) return null;

    const encodedUrl = encodeURIComponent(pageUrl);
    const shareText = encodeURIComponent(t.shareText);

    const socialLinks = [
        { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
        { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}` },
        { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
        { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, url: `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}` },
        { name: 'Email', icon: <Mail className="w-5 h-5" />, url: `mailto:?subject=${encodeURIComponent(t.shareEmailSubject)}&body=${shareText}%0A%0A${pageUrl}` }
    ];

    return (
        <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap px-4">
            {socialLinks.map(link => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${link.name}`}
                    className="p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 hover:bg-white/10"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {link.icon}
                </a>
            ))}
        </div>
    );
  };
  
  return (
    <>
      <Seo 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        imageUrl={seoData.imageUrl}
        jsonLdSchema={seoData.jsonLdSchema}
      />
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
        <h1>{t.hiddenH1}</h1>
        <h2>{t.hiddenH2}</h2>
        <h3>{t.hiddenH3}</h3>
        <p>{t.hiddenP1}</p>
        <p>{t.hiddenP2}</p>
        <p>{t.hiddenP3}</p>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --bg-primary: #0a0b14;
          --bg-secondary: #131520;
          --bg-tertiary: #1a1d2e;
          --accent-primary: #6366f1;
          --accent-secondary: #8b5cf6;
          --accent-hover: #4f46e5;
          --text-primary: #f8fafc;
          --text-secondary: #cbd5e1;
          --text-muted: #64748b;
          --border-subtle: rgba(148, 163, 184, 0.1);
          --gradient-magic: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --gradient-glow: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-feature-settings: "cv05", "cv01", "cv03", "cv04";
        }
        
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: var(--accent-primary) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--accent-primary); border-radius: 3px; }
        .glow { filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3)); }
        .text-glow { text-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
        .floating-orb { position: absolute; border-radius: 50%; opacity: 0.1; animation: float 20s ease-in-out infinite; }
        .floating-orb:nth-child(1) { width: 300px; height: 300px; background: var(--gradient-magic); top: -150px; right: -150px; animation-delay: -5s; }
        .floating-orb:nth-child(2) { width: 200px; height: 200px; background: var(--gradient-glow); bottom: 100px; left: -100px; animation-delay: -10s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(120deg); }
          66% { transform: translateY(15px) rotate(240deg); }
        }
        
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          transition: left 0.8s;
        }
        .shimmer:hover::before { left: 100%; }
        
        .magic-border {
          background: linear-gradient(var(--bg-tertiary), var(--bg-tertiary)) padding-box,
                      var(--gradient-magic) border-box;
          border: 1px solid transparent;
        }
        
        .prose-output {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid var(--border-subtle);
        }
        
        .stable-textarea {
          transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
          overflow-y: auto !important;
          resize: none !important;
          box-sizing: border-box !important;
          height: 140px !important;
          min-height: 140px !important;
          max-height: 140px !important;
        }
        
        .stable-textarea:focus,
        .stable-textarea:hover,
        .stable-textarea:active {
          height: 140px !important;
          min-height: 140px !important;
          max-height: 140px !important;
        }
        
        .textarea-container {
          height: auto;
          min-height: fit-content;
        }
        
        .examples-textarea {
          height: 120px !important;
          min-height: 120px !important;
          max-height: 120px !important;
          overflow-y: auto !important;
          resize: none !important;
        }
        
        .stable-textarea::placeholder {
          color: rgba(196, 181, 253, 0.6);
          opacity: 1;
        }
        
        .stable-textarea:focus::placeholder {
          color: rgba(196, 181, 253, 0.4);
        }
        
        .main-content {
          position: relative;
        }
        
        .output {
          white-space: pre-wrap;
          padding: 16px;
          font-family: ui-monospace, 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          direction: ltr; 
          text-align: left;
        }
        
        .output.rtl-output {
          direction: rtl;
          text-align: right;
          unicode-bidi: plaintext;
        }

        .context-output {
          white-space: pre-wrap;
          padding: 16px;
          font-family: ui-monospace, 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        }

        .interactive-example {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .interactive-example:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
      `}</style>
      
      <div className="flex flex-col min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        
        <LanguageSwitcher />
        
        <main className="flex-grow relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 w-full" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
            <div className="flex flex-col sm:inline-flex sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center glow magic-border">
                  <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" style={{ filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))' }} />
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-glow tracking-tight">
                <span style={{ background: 'var(--gradient-magic)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.mainTitle}</span>
              </h1>
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-medium mb-3 sm:mb-4 px-4" style={{ color: 'var(--text-secondary)' }}>{t.subtitle}</h2>
            
            <div className="max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
              <p className="text-sm sm:text-base lg:text-lg mb-2 sm:mb-3" style={{ color: 'var(--text-secondary)' }}>
                {t.descriptionLine1}
              </p>
              <p className="text-xs sm:text-sm lg:text-base" style={{ color: 'var(--text-muted)' }}>
                {t.descriptionLine2}
              </p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="mt-4 sm:mt-6 text-center px-4"
            >
              <Button 
                onClick={() => setShowEngineDetails(!showEngineDetails)} 
                variant="ghost" 
                className="text-xs sm:text-sm font-medium hover:bg-white/5 border border-dashed border-white/20 rounded-xl px-3 sm:px-4 py-2 transition-all duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showEngineDetails ? t.hideEngineDetails : t.showEngineDetails}
              </Button>
            </motion.div>

            <AnimatePresence>
              {showEngineDetails && (
                <motion.div 
                  key="engine-details"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                  animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }} 
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="max-w-6xl mx-auto px-4"
                >
                  <div className="magic-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-xl" style={{ 
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                    textAlign: language === 'en' ? 'left' : 'right',
                    direction: language === 'en' ? 'ltr' : 'rtl'
                  }}>
                    <div className="text-center mb-8 sm:mb-10">
                        <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>{t.principlesTitle}</h4>
                        <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                          {t.principlesSubtitle}
                        </p>
                    </div>

                    {language === 'he' && (
                    <div className="text-center mb-8 sm:mb-12">
                      <div className="inline-flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 group max-w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl sm:text-3xl animate-pulse group-hover:animate-bounce">🎧</span>
                          <div className="text-center">
                            <p className="text-blue-300 font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 group-hover:text-blue-200 transition-colors">{t.quickSummary}</p>
                            <p className="text-xs text-blue-400/80">(7 {t.minutes})</p>
                          </div>
                        </div>
                        <audio 
                          controls 
                          className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-lg" 
                          style={{ 
                            filter: 'invert(1) hue-rotate(180deg)',
                            height: '35px',
                            minHeight: '35px'
                          }}
                          onLoadedData={(e) => {
                            e.target.playbackRate = 1.2;
                          }}
                        >
                          <source src="https://archive.org/download/ai-hebrew/AI_HEBREW.wav" type="audio/wav" />
                          {t.audioPlayerNotSupported}
                        </audio>
                      </div>
                    </div>
                    )}
                    {language === 'en' && (
                    <div className="text-center mb-8 sm:mb-12">
                      <div className="inline-flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 group max-w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl sm:text-3xl animate-pulse group-hover:animate-bounce">🎧</span>
                          <div className="text-center">
                            <p className="text-blue-300 font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 group-hover:text-blue-200 transition-colors">{t.quickSummary}</p>
                            <p className="text-xs text-blue-400/80">(7 {t.minutes})</p>
                          </div>
                        </div>
                        <audio 
                          controls 
                          className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-lg" 
                          style={{ 
                            filter: 'invert(1) hue-rotate(180deg)',
                            height: '35px',
                            minHeight: '35px'
                          }}
                          onLoadedData={(e) => {
                            e.target.playbackRate = 1.2;
                          }}
                        >
                          <source src="https://archive.org/download/english_202507/english.wav" type="audio/wav" />
                          {t.audioPlayerNotSupported}
                        </audio>
                      </div>
                    </div>
                    )}

                    <div className="mb-12 sm:mb-16">
                      <div className="text-center mb-6 -mt-4">
                          <p className="text-xs sm:text-sm italic" style={{ color: 'var(--text-muted)' }}>
                              {t.clickToExpand}
                          </p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {[
                          { title: t.richContextTitle, subtitle: t.richContextSubtitle, icon: "📚", description: t.richContextDescription, example: t.richContextExample, color: "from-emerald-500/15 to-emerald-600/5", borderColor: "border-emerald-400/25", hoverColor: "hover:border-emerald-400/50" },
                          { title: t.purposeDrivenTitle, subtitle: t.purposeDrivenSubtitle, icon: "🎯", description: t.purposeDrivenDescription, example: t.purposeDrivenExample, color: "from-amber-500/15 to-amber-600/5", borderColor: "border-amber-400/25", hoverColor: "hover:border-amber-400/50" },
                          { title: t.chainOfThoughtTitle, subtitle: t.chainOfThoughtSubtitle, icon: "🧩", description: t.chainOfThoughtDescription, example: t.chainOfThoughtExample, color: "from-blue-500/15 to-blue-600/5", borderColor: "border-blue-400/25", hoverColor: "hover:border-blue-400/50" },
                          { title: t.fewShotTitle, subtitle: t.fewShotSubtitle,  icon: "📝", description: t.fewShotDescription, example: t.fewShotExample, color: "from-purple-500/15 to-purple-600/5", borderColor: "border-purple-400/25", hoverColor: "hover:border-purple-400/50" },
                          { title: t.taskDecompositionTitle, subtitle: t.taskDecompositionSubtitle, icon: "⚡", description: t.taskDecompositionDescription, example: t.taskDecompositionExample, color: "from-green-500/15 to-green-600/5", borderColor: "border-green-400/25", hoverColor: "hover:border-green-400/50" },
                          { title: t.clearConstraintsTitle, subtitle: t.clearConstraintsSubtitle, icon: "🎯", description: t.clearConstraintsDescription, example: t.clearConstraintsExample, color: "from-orange-500/15 to-orange-600/5", borderColor: "border-orange-400/25", hoverColor: "hover:border-orange-400/50" }
                        ].map((technique, index) => (
                          <motion.div
                            key={technique.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                            onClick={() => setActivePrinciple(activePrinciple === technique.title ? null : technique.title)}
                            className={`relative overflow-hidden rounded-xl sm:rounded-2xl border ${technique.borderColor} ${technique.hoverColor} bg-gradient-to-br ${technique.color} p-4 sm:p-5 lg:p-6 cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:shadow-xl`}
                          >
                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                              <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">{technique.icon}</div>
                              <div className="flex-1 min-w-0" style={{ 
                                textAlign: language === 'en' ? 'left' : 'right',
                                direction: language === 'en' ? 'ltr' : 'rtl'
                              }}>
                                <h5 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-white transition-colors" style={{ color: 'var(--text-primary)' }}>
                                  {technique.title}
                                  </h5>
                                <p className="text-xs font-medium opacity-70 mb-2 sm:mb-3" style={{ color: 'var(--accent-primary)' }}>
                                  {technique.subtitle}
                                </p>
                                <p className="text-xs sm:text-sm leading-relaxed group-hover:text-gray-200 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                                  {technique.description}
                                </p>
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {activePrinciple === technique.title && (
                                <motion.div
                                  key={technique.title + "-details"}
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{ opacity: 1, height: 'auto', marginTop: '0.75rem' }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  className="bg-black/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 shadow-inner"
                                >
                                  <p className="text-xs font-bold mb-2 sm:mb-3 text-yellow-300 flex items-center gap-2">
                                    {t.practicalExample}
                                  </p>
                                  <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-black/30 p-2 sm:p-3 rounded-md sm:rounded-lg border border-white/10" style={{ 
                                    color: 'var(--text-primary)',
                                    textAlign: language === 'en' ? 'left' : 'right',
                                    direction: language === 'en' ? 'ltr' : 'rtl'
                                  }}>
                                    {technique.example}
                                  </pre>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-12 sm:mb-16">
                      <div className="text-center mt-12 sm:mt-16 mb-8 sm:mb-10">
                        <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>{t.mistakesTitle}</h4>
                        <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                          {t.mistakesSubtitle}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {[
                          { title: t.redundantRoleTitle, bad: t.redundantRoleBad, why: t.redundantRoleWhy, icon: "🎩" },
                          { title: t.threatsPromisesTitle, bad: t.threatsPromisesBad, why: t.threatsPromisesWhy, icon: "💸" },
                          { title: t.naiveSafeguardsTitle, bad: t.naiveSafeguardsBad, why: t.naiveSafeguardsWhy, icon: "🛡️" },
                          { title: t.repeatedInstructionsTitle, bad: t.repeatedInstructionsBad, why: t.repeatedInstructionsWhy, icon: "🔄" }
                        ].map((item, index) => (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.6 }}
                            className="p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-400/20 hover:border-red-400/40 transition-all duration-300"
                          >
                            <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
                              <div className="text-xl sm:text-2xl">{item.icon}</div>
                              <h5 className="text-sm sm:text-base lg:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {item.title}
                              </h5>
                            </div>
                            <div className="bg-red-900/20 border border-red-500/30 rounded-md sm:rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                              <p className="text-xs sm:text-sm font-mono italic" style={{ color: '#fca5a5' }}>
                                {item.bad}
                              </p>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                              <strong>{t.whyItDoesntWork}</strong> {item.why}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-center mb-8 sm:mb-10"
                    >
                      <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-indigo-400/30 shadow-2xl">
                        <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
                          {t.toolDoesItAuto}
                        </h4>
                        <p className="text-sm sm:text-base lg:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                          {t.justWriteIdea}
                        </p>
                      </div>
                    </motion.div>

                    <div className="pt-6 sm:pt-8 border-t border-white/10 text-center">
                      <p className="text-sm sm:text-base mb-4 sm:mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {t.wantToDeepen}
                      </p>
                      <a 
                        href="https://www.youtube.com/watch?v=eKuFqQKYRrA" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all duration-300 text-sm sm:text-base font-medium"
                      >
                        {t.fullPodcast}
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="magic-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl"
            style={{ background: 'var(--bg-secondary)' }}
          >
            
            <div className="text-center mb-4 sm:mb-6 px-4">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-white/20 text-xs sm:text-sm" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {usageCount.toLocaleString(language === 'he' ? 'he-IL' : 'en-US')} {t.promptsUpgraded}
                </span>
              </div>
            </div>

            <div className="relative mb-4 sm:mb-6 textarea-container">
              <label className="block text-sm font-semibold mb-2 sm:mb-3" style={{ color: 'var(--text-secondary)' }}>{t.rawPromptLabel}</label>
              <div className="relative">
                <Textarea 
                  ref={mainTextareaRef} 
                  value={rawPrompt} 
                  onChange={handlePromptChange} 
                  dir={inputDir} 
                  placeholder={t.rawPromptPlaceholder} 
                  className={`bg-black/20 border-2 border-purple-500/30 focus:border-purple-400/60 focus-visible:ring-0 text-sm sm:text-base lg:text-lg w-full custom-scrollbar rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 ${language === 'he' ? 'pl-16 sm:pl-20' : 'pr-16 sm:pr-20'} transition-all duration-300 stable-textarea hover:border-purple-400/50 placeholder-purple-300/60`} 
                  style={{ 
                    color: 'var(--text-primary)', 
                    backgroundColor: 'var(--bg-tertiary)',
                    textAlign: language === 'he' ? 'right' : 'left',
                    direction: language === 'en' ? 'ltr' : inputDir,
                    lineHeight: '1.5',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)'
                  }} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      if (rawPrompt.trim()) {
                        clarificationQuestion ? proceedWithEnhancement() : enhancePrompt();
                      }
                    }
                  }}
                />
                
                <div className={`absolute bottom-2 sm:bottom-3 lg:bottom-4 ${language === 'he' ? 'left-2 sm:left-3 lg:left-4' : 'right-2 sm:right-3 lg:right-4'} flex items-center gap-2`}>
                    {language === 'he' ? (
                      // Hebrew: Microphone first, then Submit
                      <>
                        {speechSupported && (
                          <Button
                            onClick={handleToggleListening}
                            variant="ghost"
                            size="icon"
                            className={`h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/10 ${isListening ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-gray-300'}`}
                            aria-label={t.recordPrompt}
                          >
                            {isListening ? (
                               <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
                                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white animate-pulse" />
                               </div>
                            ) : (
                              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </Button>
                        )}
                        <Button 
                          onClick={clarificationQuestion ? proceedWithEnhancement : enhancePrompt}
                          disabled={isProcessing || !rawPrompt.trim()}
                          className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                          style={{ 
                            background: isProcessing || !rawPrompt.trim() ? 'var(--text-muted)' : 'var(--gradient-magic)',
                            boxShadow: rawPrompt.trim() && !isProcessing ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
                            border: 'none'
                          }}
                          aria-label={t.submit}
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="hidden sm:inline">{t.processing}</span>
                            </>
                          ) : (
                            <>
                              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">{t.submit}</span>
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      // English: Submit first, then Microphone (with flex-row-reverse)
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Button 
                          onClick={clarificationQuestion ? proceedWithEnhancement : enhancePrompt}
                          disabled={isProcessing || !rawPrompt.trim()}
                          className="h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                          style={{ 
                            background: isProcessing ? 'var(--text-muted)' : 'var(--gradient-magic)',
                            boxShadow: !isProcessing ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
                            border: 'none'
                          }}
                          aria-label={t.submit}
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="hidden sm:inline">{t.processing}</span>
                            </>
                          ) : (
                            <>
                              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">{t.submit}</span>
                            </>
                          )}
                        </Button>
                        {speechSupported && (
                          <Button
                            onClick={handleToggleListening}
                            variant="ghost"
                            size="icon"
                            className={`h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/10 ${isListening ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-gray-300'}`}
                            aria-label={t.recordPrompt}
                          >
                            {isListening ? (
                               <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
                                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white animate-pulse" />
                               </div>
                            ) : (
                              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                </div>

              </div>
              <div className="h-5 mt-2">
                <AnimatePresence>
                  {rawPrompt.trim() && !isProcessing && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-center px-4" style={{ color: 'var(--text-muted)' }}
                    >
                      {t.orPressCtrlEnter} <kbd className="font-sans text-xs">Ctrl</kbd> + <kbd className="font-sans text-xs">Enter</kbd> {t.toSubmit}
                    </motion.p>
                  )}
                </AnimatePresence>
            </div>
            </div>

            <AnimatePresence>
              {clarificationQuestion && (
                <motion.div 
                  key="clarification-prompt-section"
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="bg-indigo-900/30 border border-indigo-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 my-3 sm:my-4"
                >
                  <label className="flex items-center gap-2 text-indigo-300 font-semibold mb-2 text-sm sm:text-base">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /> {t.clarificationQuestionLabel}
                  </label>
                  <p className="text-indigo-200 mb-3 text-sm sm:text-base">{clarificationQuestion}</p>
                  <div className="relative">
                    <Input 
                      value={userClarification} 
                      onChange={(e) => setUserClarification(e.target.value)} 
                      placeholder={t.clarificationPlaceholder} 
                      className={`bg-black/20 border-indigo-700/50 focus:border-indigo-500 focus-visible:ring-0 rounded-lg text-sm sm:text-base ${language === 'he' ? 'pl-16 sm:pl-20' : 'pr-16 sm:pr-20'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          proceedWithEnhancement();
                        }
                      }}
                    />
                    <Button 
                      onClick={proceedWithEnhancement}
                      disabled={isProcessing}
                      className={`absolute ${language === 'he' ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 h-7 sm:h-8 px-3 sm:px-4 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm`}
                      style={{ 
                        background: isProcessing ? 'var(--text-muted)' : 'var(--gradient-magic)',
                        boxShadow: !isProcessing ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
                        border: 'none'
                      }}
                      aria-label={t.submit}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="hidden sm:inline">{t.processing}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t.submit}</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)'}}>
                    {t.orPressCtrlEnter} <kbd className="font-sans text-xs">Ctrl</kbd> + <kbd className="font-sans text-xs">Enter</kbd> {t.toSubmit}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex justify-center items-center gap-2 text-xs text-center my-4"
              style={{ color: 'var(--text-muted)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.privacyNotice}</span>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
              <Button onClick={() => setShowExamples(!showExamples)} variant="ghost" className="text-xs sm:text-sm font-medium hover:bg-white/5 border border-dashed border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 transition-all duration-300 w-full sm:w-auto" style={{ color: 'var(--text-secondary)' }}>
                <FileText className="w-4 h-4 ml-2"/>{showExamples ? t.hideExamples : t.addExamples}
              </Button>
              <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="ghost" className="text-xs sm:text-sm font-medium hover:bg-white/5 border border-dashed border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 transition-all duration-300 w-full sm:w-auto" style={{ color: 'var(--text-secondary)' }}>
                <Settings className="w-4 h-4 ml-2"/>{showAdvanced ? t.hideAdvancedOptions : t.advancedOptions}
              </Button>
            </div>
            
            {/* The AdvancedOptions component is now directly imported and used */}
            <AdvancedOptions settings={advancedSettings} onSettingsChange={handleSettingsChange} isOpen={showAdvanced} setIsOpen={setShowAdvanced} t={t} />
            
            <AnimatePresence>
              {showExamples && (
                <motion.div 
                  key="examples-section"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                  animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }} 
                  exit={{ opacity: 0, height: 0, marginTop: 0 }} 
                  className="relative border-t border-white/10 pt-6"
                >
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{t.examplesLabel}</label>
                  <Textarea 
                    ref={examplesTextareaRef} 
                    value={examples} 
                    onChange={(e) => setExamples(e.target.value)} 
                    placeholder={t.examplesPlaceholder} 
                    className="bg-black/20 border-2 border-white/10 focus:border-purple-500/50 focus-visible:ring-0 text-base w-full custom-scrollbar rounded-2xl p-4 sm:p-6 transition-colors duration-300 examples-textarea" 
                    style={{ 
                      color: 'var(--text-primary)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      textAlign: language === 'he' ? 'right' : 'left',
                      lineHeight: '1.5'
                    }} 
                  />
                  {examples && (
                    <span className="absolute bottom-4 left-4 text-xs px-2 py-1 rounded-full" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)' }}>
                      {examples.length} {t.characters}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {enhancedResult && (
              <motion.div 
                key="enhanced-result-section"
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                transition={{ delay: 0.1, type: "spring", stiffness: 100 }} 
                className="mt-6 sm:mt-8 lg:mt-12" 
                aria-live="polite"
              >
                <div className="magic-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 prose-output relative backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.upgradedPrompt}</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <Button onClick={() => setShowDiff(!showDiff)} variant="ghost" className="p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-white/10 flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }} aria-label={showDiff ? t.showResult : t.showChanges}>
                          <GitCompareArrows className="w-4 h-4 sm:w-5 sm:h-5" />{showDiff ? t.showResult : t.showChanges}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {showDiff ? (
                      <DiffViewer oldText={rawPrompt} newText={enhancedResult.improved_prompt} />
                    ) : (
                      <>
                        {enhancedResult.context_section && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3" style={{ color: 'var(--text-muted)' }}>{t.context}</h4>
                            <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                              <pre 
                                className="context-output text-xs sm:text-sm leading-relaxed" 
                                style={{ 
                                  color: 'var(--text-secondary)',
                                  direction: language === 'en' ? 'ltr' : 'auto',
                                  textAlign: language === 'en' ? 'left' : 'auto'
                                }}
                              >
                                {enhancedResult.context_section}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3" style={{ color: 'var(--text-muted)' }}>{t.improvedPrompt}</h4>
                          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                            <pre 
                              ref={outputRef}
                              className={`output text-xs sm:text-sm leading-relaxed ${language === 'en' || outputDir === 'ltr' ? '' : 'rtl-output'}`} 
                              style={{ 
                                color: 'var(--text-primary)',
                                direction: language === 'en' ? 'ltr' : outputDir,
                                textAlign: language === 'en' ? 'left' : (outputDir === 'rtl' ? 'right' : 'left')
                              }}
                            >
                              {enhancedResult.improved_prompt}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="relative flex justify-center items-center mt-6 sm:mt-8">
                    <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.end}</span>
                    <Button 
                      ref={copyButtonRef} 
                      onClick={copyToClipboard} 
                      variant="outline"
                      className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs sm:text-sm border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 px-3 py-2 rounded-lg"
                      aria-label={t.copy}
                    >
                      <Copy className="w-4 h-4" />
                      <span>{t.copy}</span>
                    </Button>
                  </div>
                  
                  {copied && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.8 }} 
                      className="absolute top-3 sm:top-4 right-16 sm:right-20 bg-green-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md sm:rounded-lg"
                    >
                      {t.copiedSuccessfully}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 sm:mt-12 text-center"
          >
            <a 
              href={gptLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-4 rounded-full text-base font-bold transition-all duration-300 group hover:scale-105 magic-border shimmer"
              style={{ 
                background: 'var(--bg-tertiary)',
              }}
            >
              <img
                src={gptIconUrl}
                alt="Promptorium GPT Icon"
                className="w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110"
              />
              <span 
                className="bg-clip-text text-transparent group-hover:brightness-110"
                style={{
                  backgroundImage: 'var(--gradient-magic)',
                }}
              >
                {t.tryOnGPT}
              </span>
            </a>
          </motion.div>
          
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 sm:mt-12 lg:mt-16 text-center"
          >
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 lg:mb-6 px-4" style={{ color: 'var(--text-secondary)' }}>{t.didYouLikeIt}</h3>
              <ShareButtons />
          </motion.div>
        </main>
        
        <motion.footer 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center w-full px-4 pb-4 sm:pb-6"
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a 
              href="https://www.linkedin.com/in/eitan-rudiakov" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium transition-all duration-300 group hover:scale-105"
              style={{ color: 'var(--text-muted)' }}
            >
              <Linkedin className="w-4 h-4 group-hover:text-white transition-colors" />
              <span className="group-hover:text-white transition-colors">{t.contactUs}</span>
            </a>
            
            <div className="hidden sm:block w-px h-4 bg-gray-700"></div>

            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                <span>{t.footerLinkPrefix}</span>
                <a 
                  href={language === 'he' ? "https://parallaxer.ai" : "https://atoiagento.com"}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block transition-all duration-300 group"
                >
                  <span 
                    className="font-bold bg-clip-text text-transparent group-hover:brightness-110"
                    style={{
                      backgroundImage: 'var(--gradient-magic)',
                    }}
                  >
                    {t.footerLinkText}
                  </span>
                </a>
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
}

export default function PromptCrafterV3() {
    return (
        <LanguageProvider>
            <PromptCrafterContent />
        </LanguageProvider>
    );
}
