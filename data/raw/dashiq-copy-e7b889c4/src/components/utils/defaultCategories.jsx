// Default categories for new users
export const getDefaultCategories = (language = 'he') => {
  const hebrewCategories = [
    // Expense Categories
    { name: "מזון ומשקאות", type: "expense", icon: "Utensils", sort_order: 1 },
    { name: "קניות", type: "expense", icon: "ShoppingCart", sort_order: 2 },
    { name: "תחבורה", type: "expense", icon: "Car", sort_order: 3 },
    { name: "בילויים", type: "expense", icon: "Film", sort_order: 4 },
    { name: "בריאות", type: "expense", icon: "HeartPulse", sort_order: 5 },
    { name: "חינוך", type: "expense", icon: "BookOpen", sort_order: 6 },
    { name: "בית ומשק", type: "expense", icon: "Home", sort_order: 7 },
    { name: "ביגוד", type: "expense", icon: "Shirt", sort_order: 8 },
    { name: "מתנות", type: "expense", icon: "Gift", sort_order: 9 },
    { name: "שירותים בנקאיים", type: "expense", icon: "Landmark", sort_order: 10 },
    { name: "חשבונות", type: "expense", icon: "Zap", sort_order: 11 },
    { name: "אחר", type: "expense", icon: "HelpCircle", sort_order: 12 },
    
    // Income Categories
    { name: "משכורת", type: "income", icon: "TrendingUp", sort_order: 1 },
    { name: "עבודה נוספת", type: "income", icon: "Zap", sort_order: 2 },
    { name: "השקעות", type: "income", icon: "TrendingUp", sort_order: 3 },
    { name: "מתנות", type: "income", icon: "Gift", sort_order: 4 },
    { name: "הכנסה אחרת", type: "income", icon: "HelpCircle", sort_order: 5 }
  ];

  const englishCategories = [
    // Expense Categories
    { name: "Food & Drinks", type: "expense", icon: "Utensils", sort_order: 1 },
    { name: "Shopping", type: "expense", icon: "ShoppingCart", sort_order: 2 },
    { name: "Transportation", type: "expense", icon: "Car", sort_order: 3 },
    { name: "Entertainment", type: "expense", icon: "Film", sort_order: 4 },
    { name: "Health", type: "expense", icon: "HeartPulse", sort_order: 5 },
    { name: "Education", type: "expense", icon: "BookOpen", sort_order: 6 },
    { name: "Home & Household", type: "expense", icon: "Home", sort_order: 7 },
    { name: "Clothing", type: "expense", icon: "Shirt", sort_order: 8 },
    { name: "Gifts", type: "expense", icon: "Gift", sort_order: 9 },
    { name: "Banking Services", type: "expense", icon: "Landmark", sort_order: 10 },
    { name: "Bills", type: "expense", icon: "Zap", sort_order: 11 },
    { name: "Other", type: "expense", icon: "HelpCircle", sort_order: 12 },
    
    // Income Categories
    { name: "Salary", type: "income", icon: "TrendingUp", sort_order: 1 },
    { name: "Freelance", type: "income", icon: "Zap", sort_order: 2 },
    { name: "Investments", type: "income", icon: "TrendingUp", sort_order: 3 },
    { name: "Gifts", type: "income", icon: "Gift", sort_order: 4 },
    { name: "Other Income", type: "income", icon: "HelpCircle", sort_order: 5 }
  ];

  return language === 'he' ? hebrewCategories : englishCategories;
};