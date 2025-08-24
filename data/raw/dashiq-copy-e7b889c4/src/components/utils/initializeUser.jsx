import { Category } from '@/api/entities';
import { getDefaultCategories } from './defaultCategories';
import { getCurrentLanguage } from './i18n';

// Initialize new user with default categories
export const initializeUserData = async () => {
  try {
    const currentLanguage = getCurrentLanguage();
    
    // Check if user already has categories
    const existingCategories = await Category.list();
    if (existingCategories && existingCategories.length > 0) {
      console.log('User already has categories, skipping initialization');
      return { success: true, message: 'User already initialized', categoriesCreated: 0 };
    }

    // Create default categories
    const defaultCategories = getDefaultCategories(currentLanguage);
    const createdCategories = [];

    console.log(`Creating ${defaultCategories.length} default categories for language: ${currentLanguage}`);

    for (const categoryData of defaultCategories) {
      try {
        const category = await Category.create(categoryData);
        createdCategories.push(category);
        console.log(`Created category: ${categoryData.name} (${categoryData.type})`);
      } catch (error) {
        console.error('Error creating category:', categoryData.name, error);
      }
    }

    console.log(`Successfully created ${createdCategories.length} default categories`);
    
    return {
      success: true,
      message: `Created ${createdCategories.length} default categories`,
      categoriesCreated: createdCategories.length
    };

  } catch (error) {
    console.error('Error initializing user data:', error);
    return {
      success: false,
      message: 'Failed to initialize user data',
      error: error.message,
      categoriesCreated: 0
    };
  }
};

// Check if user needs initialization and auto-initialize if needed
export const checkAndInitializeUser = async () => {
  try {
    const categories = await Category.list();
    const needsInitialization = !categories || categories.length === 0;
    
    if (needsInitialization) {
      console.log('User needs initialization, creating default categories...');
      const result = await initializeUserData();
      return {
        needsInitialization: true,
        categoryCount: result.categoriesCreated || 0,
        initializationResult: result
      };
    }
    
    return {
      needsInitialization: false,
      categoryCount: categories.length,
      initializationResult: { success: true, message: 'Already initialized' }
    };
  } catch (error) {
    console.error('Error checking user initialization:', error);
    return {
      needsInitialization: true,
      categoryCount: 0,
      error: error.message,
      initializationResult: { success: false, error: error.message }
    };
  }
};

// Check if user needs initialization
export const checkUserInitialization = async () => {
  try {
    const categories = await Category.list();
    return {
      needsInitialization: !categories || categories.length === 0,
      categoryCount: categories ? categories.length : 0
    };
  } catch (error) {
    console.error('Error checking user initialization:', error);
    return {
      needsInitialization: true,
      categoryCount: 0,
      error: error.message
    };
  }
};

export default {
  initializeUserData,
  checkUserInitialization,
  checkAndInitializeUser
};