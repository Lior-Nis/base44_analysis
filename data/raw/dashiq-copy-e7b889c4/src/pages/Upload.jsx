
import React, { useState, useEffect } from "react";
import { Transaction, Category, CategoryRule, UploadLog } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, FileUp, CheckCircle2, Loader2, BrainCircuit, PlusCircle, Clock, FileDown, Eye, Upload, Info, CheckCircle, Brain, ArrowRight, DollarSign, Shield, Lightbulb, Zap, ChevronUp, ChevronDown } from "lucide-react";
import { ExtractDataFromUploadedFile, UploadFile, InvokeLLM } from "@/api/integrations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { subMonths, addMonths, parseISO, differenceInDays } from 'date-fns';
import { t, isRTL } from '@/components/utils/i18n';
import { debounce } from '@/components/utils/index';
import EnhancedClassificationEngine from "../components/transactions/EnhancedClassificationEngine";
import PhoneticClusteringVisualization from "../components/transactions/PhoneticClusteringVisualization";
import { useUserPreferences } from "@/components/utils/UserPreferencesContext";
import { IconRenderer } from "@/components/utils/icons";


// Define a limit for fetching existing transactions for duplicate checks
// This acts as a "batch size" for this read operation.
const EXISTING_TRANSACTIONS_FETCH_LIMIT = 1000; // Fetch up to 1000 records at a time

// Helper function to clean business names before AI processing
const normalizeBusinessName = (name) => {
  if (!name) return '';
  // Common suffixes in Hebrew and English. Order matters (e.g., "Corp" before "Co")
  const suffixes = [
    /\s+corporation/gi, /\s+corp/gi,
    /\s+incorporated/gi, /\s+inc/gi,
    /\s+limited\s+liability\s+company/gi, /\s+llc/gi,
    /\s+limited/gi, /\s+ltd/gi,
    /\s+company/gi, /\s+co/gi,
    /בע"מ/g, /בעמ/g,
    /ח\.פ\./g, /ח\.פ/g, /חפ/g,
    /ע\.מ\./g, /ע\.מ/g, /עמ/g,
    / בע"מ/g, // with space
    / בעמ/g,
    / ח\.פ\./g,
    / ח\.פ/g,
    / חפ/g,
    / ע\.מ\./g,
    / ע\.מ/g,
    / עמ/g,
    /\./g, // Remove dots
    /\"/g, // Remove quotes
    /\'/g, // Remove single quotes
  ];
  let normalized = name;
  suffixes.forEach(suffix => {
    normalized = normalized.replace(suffix, '');
  });
  // Trim extra spaces and trailing punctuation
  return normalized.replace(/[.,\s]+$/, '').trim();
};

// Add currency conversion utility functions directly in the component
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];

const detectCurrency = (transaction) => {
  try {
    // First, try to detect currency from explicit currency fields
    const possibleCurrencyFields = [
      transaction.currency,
      transaction.original_currency,
      transaction.billing_currency
    ];

    for (const field of possibleCurrencyFields) {
      if (field && typeof field === 'string') {
        const currency = field.toUpperCase().trim();
        if (SUPPORTED_CURRENCIES.includes(currency) || currency === 'ILS' || currency === 'NIS' || currency === '₪') {
          return currency === 'NIS' || currency === '₪' ? 'ILS' : currency;
        }
      }
    }

    // Enhanced currency detection from amount string and other fields
    const fieldsToCheck = [
      transaction.billing_amount,
      transaction.amount,
      transaction.transaction_amount,
      transaction.description,
      transaction.details,
      transaction.business_name
    ];

    for (const field of fieldsToCheck) {
      if (field) {
        const fieldStr = String(field);

        // Check for currency symbols and codes
        if (fieldStr.includes('$') || fieldStr.includes('USD') || fieldStr.includes('Dollar')) return 'USD';
        if (fieldStr.includes('€') || fieldStr.includes('EUR') || fieldStr.includes('Euro')) return 'EUR';
        if (fieldStr.includes('£') || fieldStr.includes('GBP') || fieldStr.includes('Pound')) return 'GBP';
        if (fieldStr.includes('¥') || fieldStr.includes('JPY') || fieldStr.includes('Yen')) return 'JPY';
        if (fieldStr.includes('CHF') || fieldStr.includes('Swiss')) return 'CHF';
        if (fieldStr.includes('CAD') || fieldStr.includes('Canadian')) return 'CAD';
        if (fieldStr.includes('AUD') || fieldStr.includes('Australian')) return 'AUD';
        if (fieldStr.includes('₪') || fieldStr.includes('ILS') || fieldStr.includes('NIS') || fieldStr.includes('Shekel')) return 'ILS';
      }
    }

    // Default to ILS if no currency detected
    return 'ILS';
  } catch (error) {
    console.error('Error detecting currency:', error);
    return 'ILS';
  }
};

const getExchangeRate = async (fromCurrency, toCurrency, date) => {
  try {
    if (!fromCurrency || !toCurrency || !date) {
      throw new Error('Missing required parameters for exchange rate lookup');
    }

    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Use a reliable date format for the API (YYYY-MM-DD)
    const formattedDate = date ? format(new Date(date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

    const apiUrl = `https://api.frankfurter.app/${formattedDate}?from=${fromCurrency}&to=${toCurrency}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.rates || !data.rates[toCurrency]) {
      throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency} on ${formattedDate}`);
    }

    return data.rates[toCurrency];
  } catch (error) {
    console.error(`Failed to fetch exchange rate for ${fromCurrency} to ${toCurrency} on ${date}:`, error.message);
    throw error;
  }
};

const convertTransactionCurrency = async (transaction) => {
  try {
    if (!transaction) {
      throw new Error('Transaction is undefined');
    }

    const originalCurrency = detectCurrency(transaction);

    // Debug logging to help troubleshoot
    console.log(`Transaction: ${transaction.business_name || 'Unknown'}, Amount: ${transaction.billing_amount}, Detected Currency: ${originalCurrency}`);

    if (originalCurrency === 'ILS') {
      return {
        ...transaction,
        original_currency: 'ILS',
        currency: 'ILS',
        currency_converted: false
      };
    }

    let amount = transaction.billing_amount;
    if (typeof amount === 'string') {
      // Remove all non-numeric characters except decimal point and minus sign
      amount = parseFloat(amount.replace(/[^\d.-]/g, ''));
    }

    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount for conversion: ${transaction.billing_amount}`);
    }

    if (!transaction.date) {
      throw new Error("Transaction date is missing for currency conversion.");
    }

    const exchangeRate = await getExchangeRate(originalCurrency, 'ILS', transaction.date);
    const ilsAmount = Math.round(amount * exchangeRate * 100) / 100; // Round to 2 decimal places

    console.log(`Converted ${amount} ${originalCurrency} to ${ilsAmount} ILS (rate: ${exchangeRate}) on ${transaction.date}`);

    return {
      ...transaction,
      original_currency: originalCurrency,
      original_amount: amount,
      billing_amount: ilsAmount, // This is now in ILS
      transaction_amount: ilsAmount, // Also update transaction_amount
      currency: 'ILS', // Set currency to ILS after conversion
      exchange_rate: exchangeRate,
      conversion_date: transaction.date,
      currency_converted: true
    };
  } catch (error) {
    console.warn(`Error converting transaction: ${transaction.business_name || 'N/A'} (Amount: ${transaction.billing_amount}, Currency: ${transaction.currency}): ${error.message}`);
    return {
      ...transaction,
      original_currency: detectCurrency(transaction), // Still store detected original currency
      currency: detectCurrency(transaction), // Keep original currency if conversion fails
      currency_converted: false,
      conversion_error: error.message
    };
  }
};

// Helper functions - ensure they're properly defined
const validateTransactionData = (transaction) => {
  const errors = [];

  if (!transaction.date || transaction.date === '') {
    errors.push('Date is required');
  }

  if (!transaction.business_name || transaction.business_name.trim() === '') {
    errors.push('Business name is required');
  }

  if (transaction.billing_amount === null || isNaN(parseFloat(transaction.billing_amount))) {
    errors.push('Valid amount is required');
  }

  return errors;
};

const normalizeDate = (dateValue) => {
  try {
    if (!dateValue) return null;

    const dateStr = String(dateValue).trim();
    if (dateStr === '') return null;

    // Try different date formats
    const formats = [
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, // DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
      /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, // YYYY-MM-DD or YYYY/MM/DD
    ];

    let parsedDate = null;

    for (const formatRegex of formats) {
      const match = dateStr.match(formatRegex);
      if (match) {
        let year, month, day;
        if (formatRegex.source.startsWith('^\\d{1,2}')) { // DD/MM/YYYY or DD-MM/YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
        } else { // YYYY-MM-DD or YYYY/MM/DD
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        }

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          // Construct date as YYYY-MM-DD string to avoid timezone issues with Date objects
          parsedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          break;
        }
      }
    }

    if (!parsedDate) {
      // Fallback: try to parse with new Date() directly
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        parsedDate = format(d, 'yyyy-MM-dd');
      }
    }

    return parsedDate; // Return YYYY-MM-DD format string
  } catch (error) {
    console.error('Error normalizing date:', error);
    return null;
  }
};


export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [extractedTransactions, setExtractedTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [categorizing, setCategorizing] = useState(false);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [newRules, setNewRules] = useState([]);
  const [savingData, setSavingData] = useState(false);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [viewMode, setViewMode] = useState("upload"); // State for main tabs, retained for clarity although now controlled by defaultValue
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseError, setParseError] = useState(null);
  const [duplicateSets, setDuplicateSets] = useState([]);
  const [showDuplicateResolutionDialog, setShowDuplicateResolutionDialog] = useState(false);
  const [transactionsToReview, setTransactionsToReview] = useState([]);
  const [resolvedDuplicates, setResolvedDuplicates] = useState({});
  const [uploadLog, setUploadLog] = useState(null); // For UploadLog entity
  const [userHasTransactions, setUserHasTransactions] = useState(false); // To check if user has any transactions at all
  const [isLoadingExisting, setIsLoadingExisting] = useState(true); // For initial check
  // Add state for collapsible guide
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  // Add drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);

  const { toast } = useToast();

  // Update all toast messages in upload operations
  const handleFileProcessed = (data) => {
    if (data.transactions && data.transactions.length > 0) {
      toast({
        title: t('toast.success'),
        description: t('toast.fileProcessed') + ` (${data.transactions.length} ${t('transactions.title')})`,
      });
    } else {
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('toast.uploadError'),
      });
    }
  };

  const handleUploadError = () => {
    toast({
      variant: "destructive",
      title: t('toast.error'),
      description: t('toast.uploadError'),
    });
  };

  const handleTemplateDownload = () => {
    try {
      toast({
        title: t('upload.toast.templateDownloadTitle'),
        description: t('upload.toast.templateDownloadSuccess'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error in handleTemplateDownload:', error);
    }
  };

  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const fetchedCategories = await Category.list('sort_order'); // Sort categories
        setCategories(fetchedCategories);
        loadRules();
        loadUploadHistory();
      } catch (error) {
        console.error("Error loading initial data for upload page:", error);
        toast({ title: t('common.error'), description: t('upload.toast.initialDataLoadFailed'), variant: "destructive" });
      }
    };
    loadInitialData();
    checkInitialTransactions();
  }, []);

  React.useEffect(() => {
    if (extractedTransactions.length > 0) {
      const count = extractedTransactions.filter(t => !t.category_id).length;
      setUncategorizedCount(count);
    }
  }, [extractedTransactions]);

  const loadCategories = async () => {
    const cats = await Category.list('sort_order');
    setCategories(cats);
  };

  const loadRules = async () => {
    const rulesList = await CategoryRule.list();
    setRules(rulesList);
  };

  const loadUploadHistory = async () => {
    try {
      const logs = await UploadLog.list('-upload_date');
      setUploadLogs(logs);
    } catch (error) {
      console.error("Error loading upload history:", error);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.type === "application/vnd.ms-excel" || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError(t('upload.errors.csvOnly'));
      setFile(null);
    }
  };

  // Add drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.type === "application/vnd.ms-excel" || droppedFile.name.endsWith('.csv'))) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError(t('upload.errors.csvOnly'));
        setFile(null);
      }
    }
  };

  const processFile = async () => {
    if (!file || !(file instanceof File) || file.size === 0) {
      handleUploadError(); // Replaced specific invalid file toast with generic upload error
      setUploading(false);
      return;
    }

    setUploading(true);
    setProgress(0);
    let retryCount = 3;

    while (retryCount > 0) {
      try {
        setProgress(10);

        const uploadResult = await Promise.race([
          UploadFile({ file }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout')), 30000)
          )
        ]);

        if (!uploadResult || !uploadResult.file_url) {
          throw new Error(t('upload.errors.fileUploadFailed'));
        }

        setProgress(40);

        // Use a more flexible schema that can handle various CSV formats
        const extractionSchema = {
          type: "array", // Changed from "object" to "array"
          description: "Array of financial transactions from CSV file",
          items: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "Transaction date in any format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY, etc.)"
              },
              business_name: {
                type: "string",
                description: "Name of the business, merchant, store, or payee. May be in columns like: business, merchant, store, company, payee, description, details"
              },
              amount: {
                type: "number",
                description: "Transaction amount as a positive number. May be in columns like: amount, sum, total, price, cost, value"
              },
              description: {
                type: "string",
                description: "Additional details or notes about the transaction"
              },
              currency: { // Added for currency conversion
                type: "string",
                description: "Currency of the transaction (e.g., USD, EUR, GBP, ILS)"
              }
            },
            required: ["date", "business_name", "amount"]
          }
        };

        console.log('Starting file extraction with flexible schema');

        const result = await Promise.race([
          ExtractDataFromUploadedFile({
            file_url: uploadResult.file_url,
            json_schema: extractionSchema
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('ExtractData timeout')), 60000)
          )
        ]);

        setProgress(70);

        // Enhanced debugging and result processing
        console.log("ExtractDataFromUploadedFile result:", {
          status: result?.status,
          outputType: typeof result?.output,
          outputLength: Array.isArray(result?.output) ? result.output.length : 'not array',
          hasOutput: !!result?.output,
          details: result?.details,
          error: result?.error
        });

        let transactions = [];

        if (result && result.status === "success") {
          console.log("Extraction successful, processing output...");

          // Handle different response formats more robustly
          if (Array.isArray(result.output)) {
            transactions = result.output;
            console.log("Found transactions as direct array:", transactions.length);
          } else if (result.output && typeof result.output === 'object') {
            // Look for arrays in the object
            const possibleArrays = Object.values(result.output).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              transactions = possibleArrays[0];
              console.log("Found transactions in nested array:", transactions.length);
            } else if (result.output.transactions && Array.isArray(result.output.transactions)) {
              transactions = result.output.transactions;
              console.log("Found transactions in output.transactions:", transactions.length);
            } else {
              // Try to convert single object to array
              if (result.output.date || result.output.business_name || result.output.amount) {
                transactions = [result.output];
                console.log("Converted single transaction to array");
              }
            }
          }
        } else {
          console.error("Extraction failed or returned no data");
          console.log("Full result:", JSON.stringify(result, null, 2));
        }

        console.log("Transactions found:", transactions.length);
        console.log("Sample transactions:", JSON.stringify(transactions.slice(0, 3), null, 2));


        if (transactions && transactions.length > 0) {
          console.log("Processing", transactions.length, "transactions");

          // Enhanced normalization with better error handling
          const normalizedTransactions = transactions.map((transaction, index) => {
            console.log(`Processing transaction ${index + 1}:`, transaction);

            const normTrans = { ...transaction };

            // Normalize Date with more flexible parsing - FIXED VERSION
            if (normTrans.date) {
              try {
                let parsedDate = null;
                const dateStr = String(normTrans.date).trim();

                console.log(`Attempting to parse date: "${dateStr}"`);

                // Try DD/MM/YYYY or DD-MM/YYYY first (Israeli standard preference)
                const ddmmMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (ddmmMatch) {
                  const day = parseInt(ddmmMatch[1]);
                  const month = parseInt(ddmmMatch[2]);
                  const year = parseInt(ddmmMatch[3]);

                  // Heuristic: if day > 12, it must be DD/MM. If month > 12, it's ambiguous, assume DD/MM (Israeli preference)
                  if (day > 12 || (day <= 12 && month > 12)) { // Day greater than 12 makes it unambiguous DD/MM/YYYY
                    // Create date as YYYY-MM-DD string directly to avoid timezone issues
                    parsedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    console.log(`Parsed as DD/MM/YYYY: ${day}/${month}/${year} -> ${parsedDate}`);
                  } else if (month <= 12 && day <= 12) {
                    // Ambiguous case (e.g., 01/02/2023). Prioritize DD/MM/YYYY for Israeli context
                    parsedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    console.log(`Ambiguous date, prioritized as DD/MM/YYYY: ${day}/${month}/${year} -> ${parsedDate}`);
                  }
                }

                // Try YYYY-MM-DD or YYYY/MM/DD format
                if (!parsedDate) {
                  const isoMatch = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
                  if (isoMatch) {
                    const year = parseInt(isoMatch[1]);
                    const month = parseInt(isoMatch[2]);
                    const day = parseInt(isoMatch[3]);
                    parsedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    console.log(`Parsed as YYYY-MM-DD: ${parsedDate}`);
                  }
                }

                // Validate the parsed date string
                if (parsedDate && parsedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  // Additional validation: check if it's a valid date
                  const testDate = new Date(parsedDate + 'T00:00:00');
                  if (!isNaN(testDate.getTime())) {
                    normTrans.date = parsedDate;
                    console.log(`Date normalized to: ${normTrans.date}`);
                  } else {
                    console.warn("Invalid date after parsing:", parsedDate);
                    normTrans.date = null;
                  }
                } else {
                  console.warn("Could not parse date value:", dateStr);
                  normTrans.date = null;
                }
              } catch (e) {
                console.warn("Error during date parsing:", normTrans.date, e);
                normTrans.date = null;
              }
            } else {
              normTrans.date = null;
            }

            // Normalize Business Name with flexible field mapping
            let businessName = null;

            // Try different possible field names from schema description
            const businessFields = ['business_name', 'business', 'merchant', 'store', 'company', 'payee', 'description', 'details', 'name'];
            for (const field of businessFields) {
              if (transaction[field] && typeof transaction[field] === 'string' && transaction[field].trim()) {
                businessName = transaction[field].trim();
                console.log(`Found business name from field "${field}": "${businessName}"`);
                break;
              }
            }
            normTrans.business_name = businessName;
            if (!normTrans.business_name) {
              console.warn("Business name could not be extracted from common fields.");
              normTrans.business_name = null;
            }


            // Normalize Amount with flexible field mapping and sign handling
            let amount = 0;
            let isNegative = false;

            const amountFields = ['amount', 'sum', 'total', 'price', 'cost', 'value', 'billing_amount'];
            for (const field of amountFields) {
              if (transaction[field] !== null && transaction[field] !== undefined) {
                let currentAmountCandidate = transaction[field];
                if (typeof currentAmountCandidate === 'string') {
                  // Check for negative sign
                  if (currentAmountCandidate.includes('-')) {
                    isNegative = true;
                  }
                  // Clean string for parsing, removing negative sign if present as it's handled by isNegative
                  const cleanAmount = currentAmountCandidate.replace(/[^\d.-]/g, ''); // Removed currencies to strip as it's handled by regex. Original: `/[^\d.-]/g, ''` -> `/[^\d.-]/g, ''`
                  const parsedAmount = parseFloat(cleanAmount);
                  if (!isNaN(parsedAmount)) {
                    amount = parsedAmount;
                    console.log(`Found amount from string field "${field}": "${currentAmountCandidate}" -> ${isNegative ? -amount : amount}`);
                    break;
                  }
                } else if (typeof currentAmountCandidate === 'number') {
                  if (currentAmountCandidate < 0) {
                    isNegative = true;
                  }
                  amount = Math.abs(currentAmountCandidate); // Always take absolute value for storage
                  console.log(`Found amount from number field "${field}": ${currentAmountCandidate}`);
                  break;
                }
              }
            }

            if (isNaN(amount) || amount <= 0) {
              console.warn("Invalid or non-positive amount after checking all fields:", JSON.stringify(transaction), "-> setting to 0");
              amount = 0;
            }

            // Set final billing amount and income status
            normTrans.billing_amount = amount;
            normTrans.transaction_amount = amount;
            normTrans.is_income = isNegative; // Refunds are income

            // Ensure details is string or null (from 'description' or 'details' in raw transaction)
            normTrans.details = typeof transaction.description === 'string' && transaction.description.trim()
                ? transaction.description.trim()
                : (typeof transaction.details === 'string' && transaction.details.trim()
                    ? transaction.details.trim()
                    : null);

            // Extract currency - enhanced detection
            if (typeof transaction.currency === 'string' && transaction.currency.trim()) {
              normTrans.currency = transaction.currency.toUpperCase().trim();
            } else {
              // Try to detect from amount field or other fields
              normTrans.currency = detectCurrency(transaction);
            }

            // Normalize currency codes
            if (normTrans.currency === 'NIS' || normTrans.currency === '₪') {
              normTrans.currency = 'ILS';
            } else if (normTrans.currency === '$') {
              normTrans.currency = 'USD';
            } else if (normTrans.currency === '€') {
              normTrans.currency = 'EUR';
            } else if (normTrans.currency === '£') {
              normTrans.currency = 'GBP';
            }

            console.log(`Transaction ${index + 1} after normalization:`, {
              date: normTrans.date,
              business_name: normTrans.business_name,
              billing_amount: normTrans.billing_amount,
              details: normTrans.details,
              is_income: normTrans.is_income,
              currency: normTrans.currency,
              valid: !!(normTrans.date && normTrans.business_name && normTrans.billing_amount > 0)
            });

            return normTrans;
          });

          // Filter out transactions missing critical fields AFTER normalization
          const validTransactions = normalizedTransactions.filter((t, index) => {
            const hasDate = !!t.date;
            const hasBusinessName = !!t.business_name;
            const hasValidAmount = t.billing_amount > 0;
            const isValid = hasDate && hasBusinessName && hasValidAmount;
            if (!isValid) {
              console.warn(`Skipping transaction ${index + 1} due to missing critical fields after normalization:`, {
                hasDate: hasDate,
                hasBusinessName: hasBusinessName,
                hasValidAmount: hasValidAmount,
                originalTransaction: transactions[index], // Original raw transaction for context
                normalizedTransaction: t // Normalized transaction with current state of fields
              });
            }
            return isValid;
          });

          console.log(`Valid transactions after filtering: ${validTransactions.length} out of ${normalizedTransactions.length}`);

          if (validTransactions.length !== normalizedTransactions.length) {
            const skippedCount = normalizedTransactions.length - validTransactions.length;
            toast({
              title: t('toast.invalidRecordsSkippedTitle'),
              description: t('toast.invalidRecordsSkippedDesc', { count: skippedCount }),
              variant: "default",
            });
          }

          if (validTransactions.length === 0) {
            // Provide detailed error information for the user
            let detailedError = 'לא נמצאו עסקאות תקינות בקובץ.';
            if (normalizedTransactions.length > 0) {
                const firstInvalid = normalizedTransactions.find(t => !(t.date && t.business_name && t.billing_amount > 0));
                if (firstInvalid) {
                    detailedError += ` בדוק את העמודות הבאות: `;
                    if (!firstInvalid.date) detailedError += `תאריך (התקבל: "${firstInvalid.date}"), `;
                    if (!firstInvalid.business_name) detailedError += `שם עסק (התקבל: "${firstInvalid.business_name}"), `;
                    if (!(firstInvalid.billing_amount > 0)) detailedError += `סכום (התקבל: "${firstInvalid.billing_amount}").`;
                    detailedError = detailedError.replace(/, $/, '.'); // Clean up trailing comma
                    detailedError = detailedError.replace(/,$/, '.'); // Clean up trailing comma
                }
            } else {
                 detailedError += ' ייתכן שהקובץ ריק או לא מכיל נתונים תקינים.';
            }

            throw new Error(detailedError);
          }

          // Step 2: Currency conversion with proper error handling
          setProgress(60);
          let processedTransactions = validTransactions;

          try {
            console.log("Starting currency conversion for transactions...");

            const conversionLog = {
              total: validTransactions.length,
              converted: 0,
              failed: 0,
              errors: []
            };

            const convertedTransactions = [];

            // Process transactions in small batches to avoid overwhelming the API
            const batchSize = 5;
            for (let i = 0; i < validTransactions.length; i += batchSize) {
              const batch = validTransactions.slice(i, i + batchSize);

              const batchPromises = batch.map(async (transaction) => {
                try {
                  const result = await convertTransactionCurrency(transaction);

                  if (result.currency_converted) {
                    conversionLog.converted++;
                  } else if (result.conversion_error) {
                    conversionLog.failed++;
                    conversionLog.errors.push(`${result.business_name || 'Unknown'}: ${result.conversion_error}`);
                  }

                  return result;
                } catch (error) {
                  conversionLog.failed++;
                  conversionLog.errors.push(`${transaction.business_name || 'Unknown'}: ${error.message}`);
                  return {
                    ...transaction,
                    currency_converted: false,
                    conversion_error: error.message
                  };
                }
              });

              const batchResults = await Promise.all(batchPromises);
              convertedTransactions.push(...batchResults);

              // Small delay between batches to be respectful to the API
              if (i + batchSize < validTransactions.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }

            processedTransactions = convertedTransactions;

            // Show conversion results
            if (conversionLog.converted > 0) {
              toast({
                title: t('upload.toast.currencyConversionTitle'),
                description: t('upload.toast.currencyConversionSuccess', {
                  converted: conversionLog.converted,
                  total: conversionLog.total
                }),
                duration: 6000
              });
            }

            if (conversionLog.failed > 0) {
              console.warn("Some currency conversions failed:", conversionLog.errors);
              toast({
                title: t('upload.toast.currencyConversionPartialTitle'),
                description: t('upload.toast.currencyConversionPartial', {
                  failed: conversionLog.failed,
                  total: conversionLog.total
                }),
                variant: "warning",
                duration: 8000
              });
            }

          } catch (conversionError) {
            console.error("Currency conversion failed:", conversionError);
            toast({
              title: t('upload.toast.currencyConversionFailedTitle'),
              description: t('upload.toast.currencyConversionFailed'),
              variant: "warning",
              duration: 6000
            });
            // Continue with original transactions if conversion fails
          }

          setProgress(70);

          // Step 3: Auto-categorize transactions
          const categorizedTransactions = processedTransactions.map(transaction => {
            let category_id = null;
            let is_income = transaction.is_income; // Keep income status from refund check

            // First, check for refunds
            if (is_income) {
                const refundCategory = categories.find(c => c.name === "Refunds" || c.name === "החזרים");
                if (refundCategory) {
                    category_id = refundCategory.id;
                }
            }

            // If not categorized as a refund, apply existing rules
            if (!category_id) {
                const matchingRule = rules.find(rule =>
                  transaction.business_name && rule.business_name_pattern &&
                  transaction.business_name.toLowerCase().includes(rule.business_name_pattern.toLowerCase())
                );

                if (matchingRule) {
                    category_id = matchingRule.category_id;
                    // Rule determines income status if not a refund or if refund category not found
                    is_income = categories.find(c => c.id === matchingRule.category_id)?.type === "income";
                }
            }

            return {
              ...transaction,
              category_id,
              is_income
            };
          });

          console.log("Final categorized transactions:", categorizedTransactions.length);
          setExtractedTransactions(categorizedTransactions);
          setProgress(90);

          if (categorizedTransactions.length > 0) {
            await categorizeUnknownTransactions(categorizedTransactions);
          }
          setProgress(100);
          handleFileProcessed({ transactions: categorizedTransactions }); // Using the new handler
          break;
        } else {
          // Enhanced error reporting for initial extraction
          const errorDetails = result?.details || result?.error || 'לא זוהו נתונים בקובץ';
          console.error("No transactions found. Full result:", result);

          let userErrorMessage = 'לא נמצאו עסקאות בקובץ. ';

          if (result?.status === 'success' && (!result.output || (Array.isArray(result.output) && result.output.length === 0))) {
            userErrorMessage = 'הקובץ עובד בהצלחה אך לא נמצאו נתונים. ודא שהקובץ מכיל שורות עם נתונים (לא רק כותרות).';
          } else if (result?.details) {
            if (result.details.includes('empty') || result.details.includes('no data')) {
              userErrorMessage = 'הקובץ ריק או לא מכיל נתונים.';
            } else if (result.details.includes('format') || result.details.includes('parse') || result.details.includes('CSV')) {
              userErrorMessage = 'פורמט הקובץ לא נתמך. נסה לשמור את הקובץ כ-CSV UTF-8.';
            } else if (result.details.includes('column') || result.details.includes('header') || result.details.includes('field')) {
              userErrorMessage = 'המערכת לא זיהתה את העמודות הנדרשות. ודא שיש עמודות לתאריך, שם עסק וסכום.';
            }
          }

          throw new Error(`${userErrorMessage} פרטים נוספים: ${errorDetails}`);
        }
      } catch (error) {
        console.error(`Error processing file (attempt ${4 - retryCount}):`, error);
        retryCount--;

        let userErrorMessage = t('upload.errors.genericProcessingFailed');

        if (error.message) {
          if (error.message.includes('timeout')) {
            userErrorMessage = 'הזמן הקצוב עבר. הקובץ גדול מדי או החיבור איטי.';
          } else if (error.message.includes('לא נמצאו עסקאות')) {
            userErrorMessage = error.message; // Use the detailed error message
          } else if (error.message.includes('SQL') || error.message.includes('Used the following SQL query') || error.message.includes('פורמט הקובץ לא תקין')) {
            userErrorMessage = 'בעיה בפורמט הקובץ. נסה להשתמש בתבנית CSV פשוטה יותר.';
          } else {
            userErrorMessage = error.message.includes('שגיאה בעיבוד') ? error.message : `שגיאה בעיבוד הקובץ: ${error.message}`;
          }
        }

        if (retryCount === 0) {
          handleUploadError(); // Replaced specific processing failed toast with generic upload error
          setProgress(0);
        } else {
          toast({
            title: t('common.retryingTitle', { count: retryCount }), // Standardized title
            description: userErrorMessage, // Kept specific error message
            duration: 8000,
          });
          await new Promise(resolve => setTimeout(resolve, 2000 * (3 - retryCount + 1)));
          setProgress(prev => Math.max(0, prev - 10));
        }
      }
    }
    setUploading(false);
  };

  const categorizeUnknownTransactions = async (transactions) => {
    setCategorizing(true);
    let aiCategorizedCounts = { high: 0, medium: 0, low: 0, total_processed: 0 };
    const updatedTransactions = [...transactions];

    try {
      const uncategorized = transactions.filter(t => !t.category_id && t.business_name);
      if (uncategorized.length === 0) {
        setCategorizing(false);
        return;
      }

      const batchSize = 15;
      let newRulesProposedBatch = [];

      for (let i = 0; i < uncategorized.length; i += batchSize) {
        const batch = uncategorized.slice(i, i + batchSize);
        // Use normalizeBusinessName for AI processing
        const uniqueBusinessNames = [...new Set(batch.map(t => normalizeBusinessName(t.business_name)).filter(Boolean))];

        if (uniqueBusinessNames.length === 0) continue;

        // --- Step 1: Infer Business Type using AI with Web Search ---
        let inferredBusinesses = [];
        try {
            const inferenceResult = await retryOperation(
                async () => InvokeLLM({
                    prompt: `
                        You are an expert business analyst AI. For each business name, use your knowledge and real-time web search to provide a concise 'business_type' (e.g., "Supermarket", "Coffee Shop", "Gas Station", "Clothing Store") and relevant 'keywords' that describe the business's services or products.

                        Business Names to Analyze:
                        ${JSON.stringify(uniqueBusinessNames)}

                        Return your answer ONLY in the specified JSON format.
                    `,
                    response_json_schema: {
                        type: "object", properties: {
                            inferred_businesses: {
                                type: "array", items: {
                                    type: "object", properties: {
                                        business_name: { type: "string" }, business_type: { type: "string" }, keywords: { type: ["array", "null"], items: { type: "string" } } // Keywords can be null
                                    }, required: ["business_name", "business_type"] // Keywords no longer required
                                }
                            }}, required: ["inferred_businesses"]
                    },
                    add_context_from_internet: true
                }), 2, 3000
            );
            if (inferenceResult?.inferred_businesses) {
                inferredBusinesses = inferenceResult.inferred_businesses;
            }
        } catch (error) {
            console.error("AI Step 1 (Inference) failed for batch:", error);
            // Continue to next batch even if this one fails
            continue;
        }

        if (inferredBusinesses.length === 0) {
             console.log("AI Step 1 (Inference) returned no data for batch.");
             continue;
        }


        // --- Step 2: Map to Category with Confidence Score ---
        try {
            const mappingResult = await retryOperation(
                async () => InvokeLLM({
                    prompt: `
                        You are a precise financial categorization AI. Your task is to map businesses to a predefined list of financial categories based on the provided analysis.
                        1. For each business below, review its inferred 'business_type' and 'keywords'.
                        2. Find the single best matching category from the 'Available Categories' list. The match must be logical and clear.
                        3. **CRITICAL: You MUST return a 'confidence_score' ('high', 'medium', 'low') for each categorization.**
                           - 'high': You are highly confident in the match and the category is very specific to this business type.
                           - 'medium': The match is plausible but could be ambiguous, or the business might fit multiple categories (e.g., a general store that sells groceries and hardware). This requires user review.
                           - 'low': You are very uncertain about the match, or the business type is too generic/broad to assign a specific category. Effectively, this means it should remain uncategorized for user's decision.
                        4. If you are uncertain or cannot find a confident match, you MUST return null for the 'category_id' and 'low' for 'confidence_score'. Do not guess.
                        5. Determine if the category implies income or expense.

                        Businesses to Map:
                        ${JSON.stringify(inferredBusinesses)}

                        Available Categories (You MUST use these 'id' values for 'category_id'):
                        ${JSON.stringify(categories.map(c => ({
                            id: c.id,
                            name: c.name,
                            type: c.type,
                            description: `Use for businesses related to ${c.name}.`
                        })))}

                        Return your answer ONLY in the specified JSON format.
                    `,
                    response_json_schema: {
                        type: "object", properties: {
                            categorizations: {
                                type: "array", items: {
                                    type: "object", properties: {
                                        business_name: { type: "string" },
                                        category_id: { type: ["string", "null"] },
                                        confidence_score: { type: "string", enum: ["high", "medium", "low"] }
                                    }, required: ["business_name", "category_id", "confidence_score"]
                                }
                            }}, required: ["categorizations"]
                    },
                    add_context_from_internet: false // IMPORTANT: No web search here
                }), 2, 3000
            );

            if (mappingResult?.categorizations) {
                mappingResult.categorizations.forEach(cat => {
                    // Find the original transaction (unnormalized name) that corresponds to this AI result (normalized name)
                    const originalTransactionInBatch = batch.find(t => normalizeBusinessName(t.business_name) === cat.business_name);
                    if (!originalTransactionInBatch) return;

                    const matchedCategory = categories.find(c => c.id === cat.category_id);

                    // Update all matching transactions in the full list, for this original business name
                    updatedTransactions.forEach((transaction, index) => {
                        if (transaction.business_name === originalTransactionInBatch.business_name && !transaction.category_id) {
                            updatedTransactions[index].ai_confidence = cat.confidence_score;
                            // Only update category_id and is_income if confidence is not 'low' and a category was found.
                            // However, we preserve the original is_income if it was a refund from initial parsing.
                            if (cat.confidence_score !== 'low' && matchedCategory) {
                                updatedTransactions[index].category_id = cat.category_id;
                                // Only update is_income if the transaction wasn't already marked as income due to a negative amount (refund)
                                // or if the AI determined a new income/expense type.
                                if (!updatedTransactions[index].is_income) { // If it's not a refund from original data, then apply AI's income/expense type
                                  updatedTransactions[index].is_income = matchedCategory.type === "income";
                                }
                                aiCategorizedCounts[cat.confidence_score]++;
                            } else {
                                updatedTransactions[index].category_id = null; // Treat low confidence as uncategorized
                                // is_income remains as is, e.g., if it was a refund (true) or default (false)
                                aiCategorizedCounts.low++; // Count explicitly for low confidence
                            }
                            aiCategorizedCounts.total_processed++;
                        }
                    });

                    // Propose a new rule only for high or medium confidence categories
                    if (cat.confidence_score !== 'low' && cat.category_id) {
                        const alreadyProposedInBatch = newRulesProposedBatch.some(r => r.business_name_pattern === originalTransactionInBatch.business_name);
                        if (!alreadyProposedInBatch) {
                            newRulesProposedBatch.push({
                                business_name_pattern: originalTransactionInBatch.business_name, // Use original business name for rule
                                category_id: cat.category_id
                            });
                        }
                    }
                });
            }
        } catch (error) {
             console.error("AI Step 2 (Mapping) failed for batch:", error);
             // Continue to next batch
             continue;
        }

        // Update state progressively after each batch
        setExtractedTransactions([...updatedTransactions]);

        // Merge batch proposed rules with existing newRules state, handling uniqueness
        setNewRules(prev => {
            const rulesMap = new Map(prev.map(r => [r.business_name_pattern, r]));
            newRulesProposedBatch.forEach(newRule => {
                // Add or update, map ensures latest rule for a business_name_pattern
                rulesMap.set(newRule.business_name_pattern, newRule);
            });
            return Array.from(rulesMap.values());
        });
        newRulesProposedBatch = []; // Clear the batch-specific rules for the next iteration

        // Brief pause between batches
        if (i + batchSize < uncategorized.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: t('upload.toast.aiCategorizationConfidenceTitle'),
        description: t('upload.toast.aiCategorizationConfidenceDescription', {
            high: aiCategorizedCounts.high,
            medium: aiCategorizedCounts.medium,
            low: aiCategorizedCounts.low
        }),
        duration: 8000
      });

    } catch (error) {
      console.error("Error during the AI categorization process:", error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('upload.toast.categorizationErrorDescription'),
      });
    } finally {
      setCategorizing(false);
    }
  };

  const retryOperation = async (operation, maxRetries = 2, delayMs = 3000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  };

  const handleCategoryChange = (transactionIndex, categoryId) => {
    const transaction = extractedTransactions[transactionIndex];
    if (!transaction) return;

    setExtractedTransactions(prev => {
      const updated = [...prev];
      const category = categories.find(c => c.id === categoryId);

      updated[transactionIndex] = {
        ...updated[transactionIndex],
        category_id: categoryId,
        is_income: category?.type === "income", // Always set based on selected category type
        ai_confidence: null // User has manually set it, so AI confidence is no longer relevant
      };

      return updated;
    });

    // This is the feedback loop: User's choice becomes a rule.
    if (transaction.business_name) {
      setNewRules(prev => {
          const rulesMap = new Map(prev.map(r => [r.business_name_pattern, r]));
          // Add or update the rule with the user's explicit choice
          rulesMap.set(transaction.business_name, {
              business_name_pattern: transaction.business_name,
              category_id: categoryId
          });
          return Array.from(rulesMap.values());
      });
    }
  };

  const saveTransactions = async () => {
    setSavingData(true);
    try {
      const validTransactionsToSave = extractedTransactions.filter(t =>
        t.category_id &&
        t.date && // Ensure date exists
        t.business_name && // Ensure business_name exists
        typeof t.billing_amount === 'number' && // Ensure billing_amount is a number
        t.billing_amount > 0 // Ensure amount is positive (it's stored as absolute)
      );

      if (validTransactionsToSave.length === 0) {
        toast({
            variant: "warning",
            title: t('upload.toast.noTransactionsSavedTitle'),
            description: t('upload.toast.noTransactionsSavedDescription'),
        });
        setSavingData(false);
        return;
      }

      // Log any transactions that were extracted but not saved due to missing data
      const notSavedCount = extractedTransactions.length - validTransactionsToSave.length;
      if (notSavedCount > 0) {
          toast({
              title: t('upload.toast.transactionsNotSavedTitle'),
              description: t('upload.toast.transactionsNotSavedDescription', { count: notSavedCount }),
              variant: "warning",
              duration: 7000,
          });
      }


      const batchSize = 3;
      let processedCount = 0;

      for (let i = 0; i < validTransactionsToSave.length; i += batchSize) {
        const batch = validTransactionsToSave.slice(i, i + batchSize);

        await Promise.all(batch.map(async (transaction) => {
          try {
            // Final check before create (redundant with filter above but good for safety)
            if (!transaction.date || !transaction.business_name || typeof transaction.billing_amount !== 'number' || !transaction.category_id || transaction.billing_amount <= 0) {
                console.warn("Skipping creation of invalid transaction object:", transaction);
                return; // Skip this specific transaction
            }
            await Transaction.create(transaction);
          } catch (error) {
            console.error("Error creating transaction:", error, transaction);
          }
        }));

        processedCount += batch.length;

        if (i + batchSize < validTransactionsToSave.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (newRules.length > 0) {
        for (let i = 0; i < newRules.length; i += batchSize) {
          const batch = newRules.slice(i, i + batchSize);

          await Promise.all(batch.map(async (rule) => {
            try {
              await CategoryRule.create(rule);
            } catch (error) {
              console.error("Error creating rule:", error);
            }
          }));

          if (i + batchSize < newRules.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      await UploadLog.create({
        filename: file.name,
        upload_date: new Date().toISOString(),
        record_count: validTransactionsToSave.length,
        status: validTransactionsToSave.length === extractedTransactions.length ? "success" : "partial",
        notes: t('upload.log.notes', { savedCount: validTransactionsToSave.length, totalExtracted: extractedTransactions.length, notSavedCount: notSavedCount })
      });

      loadUploadHistory();

      setFile(null);
      setExtractedTransactions([]);
      setProgress(0);
      setNewRules([]);
      setActiveTab("all");

      loadRules();
      loadCategories();

      toast({
        title: t('toast.success'), // Standardized title
        description: t('upload.toast.transactionsSavedSuccessDescription', { count: validTransactionsToSave.length }), // Kept specific message
      });
    } catch (error) {
      console.error("Error saving transactions:", error);

      if (error.message && error.message.includes('429')) {
        toast({
          variant: "destructive",
          title: t('toast.error'), // Standardized title
          description: t('upload.toast.rateLimitDescription'), // Kept specific message
        });
      } else {
        toast({
          variant: "destructive",
          title: t('toast.error'), // Standardized title
          description: error.message || t('upload.toast.savingErrorGeneric'), // Kept specific message
        });
      }
    }
    setSavingData(false);
  };

  const getFilteredTransactions = () => {
    if (activeTab === "all") return extractedTransactions;
    if (activeTab === "uncategorized") return extractedTransactions.filter(t => !t.category_id);
    return extractedTransactions.filter(t => t.category_id);
  };

  const setAllUncategorizedToCategory = (categoryId) => {
    setExtractedTransactions(prev => {
      const updated = [...prev];
      const category = categories.find(c => c.id === categoryId);

      updated.forEach((transaction, index) => {
        if (!transaction.category_id) {
          updated[index].category_id = categoryId;
          updated[index].is_income = category?.type === "income"; // Set based on selected category type
          updated[index].ai_confidence = null; // Manually categorized

          if (transaction.business_name) {
            const existingRuleIndex = newRules.findIndex(
              r => r.business_name_pattern === transaction.business_name
            );

            if (existingRuleIndex === -1) {
              setNewRules(prevRules => [ // Use functional update for setNewRules
                ...prevRules,
                {
                  business_name_pattern: transaction.business_name,
                  category_id: categoryId
                }
              ]);
            }
          }
        }
      });

      return updated;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.unknownDate');
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (e) {
      return t('common.invalidDate');
    }
  };

  const renderUploadHistory = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('upload.history.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('upload.history.empty.title')}</h3>
              <p className="text-gray-500">{t('upload.history.empty.description')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full divide-y">
                <thead>
                  <tr className="bg-gray-50">
                    <th className={`px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('upload.history.table.uploadDate')}</th>
                    <th className={`px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('upload.history.table.filename')}</th>
                    <th className={`px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('upload.history.table.recordCount')}</th>
                    <th className={`px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('upload.history.table.status')}</th>
                    <th className={`px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t('upload.history.table.details')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {uploadLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                        {formatDate(log.upload_date)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <FileUp className="w-4 h-4 text-gray-400 mr-2" />
                          {log.filename}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                        {log.record_count}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                        <Badge
                          className={
                            log.status === "success" ? "bg-green-100 text-green-800" :
                            log.status === "partial" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }
                        >
                          {log.status === "success" ? t('upload.history.status.success') :
                           log.status === "partial" ? t('upload.history.status.partial') :
                           t('upload.history.status.failed')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                        {log.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const checkInitialTransactions = async () => {
    setIsLoadingExisting(true);
    try {
      const T_firstCheck = await Transaction.list(undefined, 1); // Check if any transaction exists
      setUserHasTransactions(T_firstCheck.length > 0);
    } catch (error) {
      console.error("Error checking initial transactions:", error);
      toast({ title: t('common.error'), description: t('upload.toast.initialDataLoadFailed'), variant: "destructive" });
    } finally {
      setIsLoadingExisting(false);
    }
  };


  const loadExistingTransactionsForDuplicateCheck = async (newTransactions) => {
    if (newTransactions.length === 0) return [];

    const dates = newTransactions.map(t => {
      try {
        // Ensure date is valid before parsing
        return t.date ? parseISO(t.date) : null;
      } catch (e) {
        const d = new Date(t.date);
        return isNaN(d.getTime()) ? null : d;
      }
    }).filter(d => d !== null);

    if (dates.length === 0) {
      // toast({ title: "שגיאת תאריכים", description: "לא ניתן היה לעבד תאריכים בעסקאות החדשות.", variant: "destructive" });
      // No need for toast here if the main processing handles this
      return [];
    }

    const minDate = new Date(Math.min.apply(null, dates));
    const maxDate = new Date(Math.max.apply(null, dates));

    const startDate = subMonths(minDate, 1);
    const endDate = addMonths(maxDate, 1);

    try {
      const filter = {
        date: {
          $gte: format(startDate, 'yyyy-MM-dd'),
          $lte: format(endDate, 'yyyy-MM-dd')
        }
      };
      const existing = await Transaction.list(undefined, EXISTING_TRANSACTIONS_FETCH_LIMIT, filter);

      if (existing.length >= EXISTING_TRANSACTIONS_FETCH_LIMIT) {
          toast({
              title: t('upload.toast.dataWarningTitle'),
              description: t('upload.toast.dataWarningDescription', { limit: EXISTING_TRANSACTIONS_FETCH_LIMIT }),
              variant: "warning",
              duration: 7000,
          });
      }
      return existing;
    } catch (error) {
      console.error("Error loading existing transactions for duplicate check:", error);
      toast({
        title: t('toast.error'), // Standardized title
        description: t('upload.toast.existingTransactionsLoadErrorDescription'), // Kept specific message
        variant: "destructive",
      });
      return [];
    }
  };

  const autoCategorizeTransaction = (transaction, rules, categories) => {
    // Added null checks for transaction.business_name and rule.business_name_pattern
    const matchingRule = rules.find(rule =>
      transaction.business_name && rule.business_name_pattern &&
      transaction.business_name.toLowerCase().includes(rule.business_name_pattern.toLowerCase())
    );

    const category_id = matchingRule?.category_id || null;
    const is_income = matchingRule
      ? categories.find(c => c.id === matchingRule.category_id)?.type === "income"
      : (typeof transaction.billing_amount === 'number' && transaction.billing_amount > 0); // Heuristic: positive amount is income if no rule

    return { category_id, is_income };
  };

  const findDuplicateTransactions = (newTransactions, existingTransactions) => {
    const duplicateSets = [];

    newTransactions.forEach(newTransaction => {
      // Ensure newTransaction has the required fields before comparing
      if (!newTransaction.date || !newTransaction.business_name || typeof newTransaction.billing_amount !== 'number') {
        return; // Skip if essential data is missing
      }

      existingTransactions.forEach(existingTransaction => {
        // Ensure existingTransaction has the required fields
        if (!existingTransaction.date || !existingTransaction.business_name || typeof existingTransaction.billing_amount !== 'number') {
          return; // Skip if essential data is missing
        }

        // Compare based on date, business name, and billing amount
        // Dates should be compared consistently, e.g., by converting to yyyy-MM-dd strings or Date objects
        const newDateStr = format(new Date(newTransaction.date), 'yyyy-MM-dd');
        const existingDateStr = format(new Date(existingTransaction.date), 'yyyy-MM-dd');

        if (
          newDateStr === existingDateStr &&
          newTransaction.business_name.trim().toLowerCase() === existingTransaction.business_name.trim().toLowerCase() &&
          newTransaction.billing_amount === existingTransaction.billing_amount
        ) {
          duplicateSets.push({
            newTransaction: newTransaction,
            existingTransaction: existingTransaction
          });
        }
      });
    });

    return duplicateSets;
  };

  const parseDateString = (dateStr) => {
    console.log(`Parsing date string: "${dateStr}"`);

    // Try DD/MM/YYYY or DD-MM/YYYY first (Israeli standard preference)
    const ddmmMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmMatch) {
      const day = parseInt(ddmmMatch[1]);
      const month = parseInt(ddmmMatch[2]);
      const year = parseInt(ddmmMatch[3]);

      // Validate ranges
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        // Heuristic: if day > 12, it must be DD/MM
        if (day > 12 || (day <= 12 && month > 12)) {
          const result = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          console.log(`Parsed as DD/MM/YYYY: ${day}/${month}/${year} -> ${result}`);
          return result;
        } else if (month <= 12 && day <= 12) {
          // Ambiguous case - prioritize DD/MM/YYYY for Israeli context
          const result = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          console.log(`Ambiguous date, prioritized as DD/MM/YYYY: ${day}/${month}/${year} -> ${result}`);
          return result;
        }
      }
    }

    // Try YYYY-MM-DD or YYYY/MM/DD format
    const isoMatch = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1]);
      const month = parseInt(isoMatch[2]);
      const day = parseInt(isoMatch[3]);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        const result = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        console.log(`Parsed as YYYY-MM-DD: ${result}`);
        return result;
      }
    }

    console.warn("Could not parse date string:", dateStr);
    return null;
  };

  const handleFileUpload = async () => {
    if (!file) {
        toast({ variant: "destructive", title: t('toast.error'), description: t('upload.toast.noFileSelectedDescription') }); // Standardized title
        return;
    }
    setIsProcessing(true);
    setParseError(null);
    setDuplicateSets([]);
    setTransactionsToReview([]);
    setResolvedDuplicates({});
    setUploadProgress(10);

    let parsedTransactions;
    try {
      // Use simplified schema for file upload as well
      const extractionSchemaForDialog = {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Transaction date in YYYY-MM-DD format"
            },
            business_name: {
              type: "string",
              description: "Name of the business"
            },
            transaction_amount: {
              type: "number",
              description: "Total transaction amount"
            },
            billing_amount: {
              type: "number",
              description: "Amount billed this period"
            },
            details: {
              type: "string",
              description: "Additional transaction details"
            },
            currency: {
              type: "string",
              description: "Currency of the transaction (e.g., USD, EUR, GBP, ILS)"
            }
          },
          required: ["date", "business_name", "billing_amount"]
        }
      };

      const { output, error: extractErrorDetails, status: extractStatus } = await ExtractDataFromUploadedFile({
        file: file,
        json_schema: extractionSchemaForDialog
      });

      if (extractStatus !== "success" || !output ) {
        const errorDetail = extractErrorDetails?.message || extractErrorDetails?.details || t('upload.errors.invalidOutputFormat');
        console.error("Error parsing file with integration or invalid output:", errorDetail, output);
        setParseError(t('upload.errors.fileProcessingError', { error: errorDetail }));
        setIsProcessing(false);
        setUploadProgress(0);
        toast({ variant: "destructive", title: t('toast.error'), description: t('upload.toast.fileProcessingErrorDetails', { details: errorDetail })}); // Standardized title
        return;
      }
      parsedTransactions = Array.isArray(output) ? output : [];

      if (parsedTransactions.length === 0 && extractStatus === "success") {
        // It's possible the file was empty or had no parsable rows by the integration
        setParseError(t('upload.errors.noTransactionsOrUnprocessable'));
        setIsProcessing(false);
        setUploadProgress(0);
        return;
      }
      setUploadProgress(30);

    } catch (e) {
      console.error("Error during file parsing process in handleFileUpload:", e);
      setParseError(t('upload.errors.fileReadError', { error: e.message }));
      setIsProcessing(false);
      setUploadProgress(0);
      return;
    }

    // Robust client-side validation and normalization for parsedTransactions in handleFileUpload
    const normalizedAndValidatedTransactions = parsedTransactions.map(t => {
        const normTrans = { ...t };

        // Date - FIXED VERSION to avoid timezone issues
        if (normTrans.date) {
          try {
            let parsedDateString = null;

            if (typeof normTrans.date === 'object') {
              if (normTrans.date.year && normTrans.date.month && normTrans.date.day) {
                // Direct string construction to avoid timezone issues
                const year = parseInt(normTrans.date.year);
                const month = parseInt(normTrans.date.month);
                const day = parseInt(normTrans.date.day);
                parsedDateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              } else if (normTrans.date instanceof Date) {
                // Extract date components without timezone conversion
                const year = normTrans.date.getFullYear();
                const month = normTrans.date.getMonth() + 1; // getMonth() is 0-based
                const day = normTrans.date.getDate();
                parsedDateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              } else {
                // Try to parse as string
                const dateStr = String(normTrans.date).trim();
                parsedDateString = parseDateString(dateStr);
              }
            } else {
              // Parse as string
              const dateStr = String(normTrans.date).trim();
              parsedDateString = parseDateString(dateStr);
            }

            normTrans.date = parsedDateString;
          } catch (e) {
            console.warn("Error parsing date in handleFileUpload:", normTrans.date, e);
            normTrans.date = null;
          }
        } else {
          normTrans.date = null;
        }

        // Business Name
        normTrans.business_name = typeof normTrans.business_name === 'string' ? normTrans.business_name.trim() : null;
        if (!normTrans.business_name) normTrans.business_name = null;

        // Billing Amount
        if (typeof normTrans.billing_amount === 'string') {
          const pAmount = parseFloat(normTrans.billing_amount.replace(/,/g, ''));
          normTrans.billing_amount = isNaN(pAmount) ? 0 : pAmount;
        } else if (typeof normTrans.billing_amount !== 'number') {
          normTrans.billing_amount = 0;
        }
         if (normTrans.billing_amount === null || typeof normTrans.billing_amount === 'undefined') normTrans.billing_amount = 0;


        // Transaction Amount
        if (typeof normTrans.transaction_amount === 'string') {
          const pAmount = parseFloat(normTrans.transaction_amount.replace(/,/g, ''));
          normTrans.transaction_amount = isNaN(pAmount) ? normTrans.billing_amount : pAmount;
        } else if (typeof normTrans.transaction_amount !== 'number') {
          normTrans.transaction_amount = normTrans.billing_amount;
        }
        if (normTrans.transaction_amount === null || typeof normTrans.transaction_amount === 'undefined') normTrans.transaction_amount = normTrans.billing_amount;

        normTrans.details = typeof normTrans.details === 'string' ? normTrans.details : null;

        // Currency
        normTrans.currency = typeof t.currency === 'string' ? t.currency.toUpperCase() : 'ILS';
        if (normTrans.currency === 'NIS' || normTrans.currency === '₪') {
          normTrans.currency = 'ILS';
        } else if (normTrans.currency === '$') {
          normTrans.currency = 'USD';
        }

        return normTrans;
    });

    const validParsedTransactions = normalizedAndValidatedTransactions.filter(t => {
        if (!t.date || !t.business_name || t.billing_amount === null || typeof t.billing_amount === 'undefined') {
            console.warn("handleFileUpload: Skipping parsed transaction due to missing required fields after normalization:", t);
            return false;
        }
        return true;
    });

    if (validParsedTransactions.length !== normalizedAndValidatedTransactions.length) {
        const skippedCount = normalizedAndValidatedTransactions.length - validParsedTransactions.length;
        toast({
            title: t('upload.toast.recordsMissingDataSkippedTitle'),
            description: t('upload.toast.recordsMissingDataSkippedDescription', { count: skippedCount }),
            variant: "warning",
            duration: 8000
        });
    }

    if (validParsedTransactions.length === 0) {
        setParseError(t('upload.errors.noValidTransactionsAfterNormalization'));
        setIsProcessing(false);
        setUploadProgress(0);
        return;
    }

    const rulesList = await CategoryRule.list();
    const categoriesList = await Category.list(); // Ensure categories are loaded for autoCategorizeTransaction
    const newTransactions = validParsedTransactions.map(t => {
      const { category_id, is_income } = autoCategorizeTransaction(t, rulesList, categoriesList); // Pass categoriesList
      return {
        ...t,
        // date is already YYYY-MM-DD
        category_id: category_id,
        is_income: is_income,
        import_batch: new Date().toISOString() + "_" + (file?.name || 'unknown_file')
      };
    });
    setUploadProgress(40);

    const existingTransactions = await loadExistingTransactionsForDuplicateCheck(newTransactions);
    setUploadProgress(60);

    const duplicates = findDuplicateTransactions(newTransactions, existingTransactions);

    if (duplicates.length > 0) {
      setDuplicateSets(duplicates);
      const duplicateNewTransactionKeys = new Set(
        duplicates.map(ds => `${ds.newTransaction.date}-${ds.newTransaction.business_name}-${ds.newTransaction.billing_amount}`)
      );
      setTransactionsToReview(
        newTransactions.filter(nt =>
            duplicateNewTransactionKeys.has(`${nt.date}-${nt.business_name}-${nt.billing_amount}`)
        )
      );
      setShowDuplicateResolutionDialog(true);
      setIsProcessing(false); // Stop processing here to allow user interaction
    } else {
      // No duplicates found, proceed to save all new transactions
      try {
        if (newTransactions.length > 0) {
          await Transaction.bulkCreate(newTransactions);
          setUploadProgress(100);
          toast({
            title: t('toast.success'), // Standardized title
            description: t('upload.toast.uploadProcessingCompleteDescription', { count: newTransactions.length }), // Kept specific message
          });
          await UploadLog.create({
            filename: file?.name || 'unknown_file',
            upload_date: new Date().toISOString(),
            record_count: newTransactions.length,
            status: "success",
            notes: t('upload.log.noDuplicates')
          });
          loadUploadHistory();
        } else {
          toast({
            title: t('upload.toast.noNewTransactionsToAddTitle'),
            description: t('upload.toast.noNewTransactionsToAddDescription'),
            variant: "info"
          });
        }
      } catch (error) {
        console.error("Error bulk creating transactions in handleFileUpload (no duplicates):", error);
        toast({
          variant: "destructive",
          title: t('toast.error'), // Standardized title
          description: t('upload.toast.addTransactionsErrorDescription'), // Kept specific message
        });
         await UploadLog.create({
            filename: file?.name || 'unknown_file',
            upload_date: new Date().toISOString(),
            record_count: newTransactions.length, // Log attempted count
            status: "failed",
            notes: t('upload.log.bulkAddError', { error: error.message })
          });
      } finally {
        setIsProcessing(false);
        setUploadProgress(0);
        setFile(null); // Reset file input
      }
    }
  };

  const handleResolveDuplicates = async (actions) => {
    setResolvedDuplicates(actions);
    setShowDuplicateResolutionDialog(false);
    await processResolvedTransactions(actions);
  };


  const handleSkipAll = () => {
    const actions = {};
    transactionsToReview.forEach(trans => {
        // Ensure key matches the one used in processResolvedTransactions
        const key = `${format(new Date(trans.date), 'yyyy-MM-dd')}-${trans.business_name}-${trans.billing_amount}`;
        actions[key] = 'skip';
    });
    handleResolveDuplicates(actions);
  };

  const handleAddAll = () => {
    const actions = {};
    transactionsToReview.forEach(trans => {
        const key = `${format(new Date(trans.date), 'yyyy-MM-dd')}-${trans.business_name}-${trans.billing_amount}`;
        actions[key] = 'add';
    });
    handleResolveDuplicates(actions);
  };


  const handleIndividualResolution = (transaction, action) => {
    const key = `${format(new Date(transaction.date), 'yyyy-MM-dd')}-${transaction.business_name}-${transaction.billing_amount}`;
    setResolvedDuplicates(prev => ({ ...prev, [key]: action }));
  };

  const processResolvedTransactions = async (resolvedActions) => {
    setIsProcessing(true);
    setUploadProgress(70);

    let newTransactionsCreatedCount = 0;
    let transactionsUpdatedCount = 0; // Not used in current logic, but kept for potential future use
    let transactionsSkippedCount = 0;

    const transactionsToCreate = [];

    // Iterate over original `transactionsToReview` to decide action for each
    transactionsToReview.forEach(originalNewTrans => {
        // Key must match the one used in handleSkipAll/handleAddAll
        const key = `${format(new Date(originalNewTrans.date), 'yyyy-MM-dd')}-${originalNewTrans.business_name}-${originalNewTrans.billing_amount}`;
        const action = resolvedActions[key] || 'skip'; // Default to skip

        if (action === 'add') {
            transactionsToCreate.push(originalNewTrans);
        } else { // 'skip' or 'merge-id' (currently merge implies skip new)
            transactionsSkippedCount++;
        }
    });

    try {
        if (transactionsToCreate.length > 0) {
            await Transaction.bulkCreate(transactionsToCreate);
            newTransactionsCreatedCount = transactionsToCreate.length;
        }
        setUploadProgress(100);
        toast({
            title: t('toast.success'), // Standardized title
            description: t('upload.toast.duplicateProcessingCompleteDescription', { added: newTransactionsCreatedCount, skipped: transactionsSkippedCount }), // Kept specific message
        });
         await UploadLog.create({
            filename: file.name,
            upload_date: new Date().toISOString(),
            record_count: transactionsToReview.length,
            status: newTransactionsCreatedCount > 0 ? "partial" : "success",
            notes: t('upload.log.duplicatesProcessed', { added: newTransactionsCreatedCount, skipped: transactionsSkippedCount })
          });
        loadUploadHistory(); // Refresh history
    } catch (error) {
        console.error("Error processing resolved transactions:", error);
        toast({
            variant: "destructive",
            title: t('toast.error'), // Standardized title
            description: t('upload.toast.processingTransactionsErrorDescription'), // Kept specific message
        });
        await UploadLog.create({
            filename: file.name,
            upload_date: new Date().toISOString(),
            record_count: transactionsToReview.length,
            status: "failed",
            notes: t('upload.log.duplicatesProcessingError', { error: error.message })
          });
    } finally {
        setIsProcessing(false);
        setUploadProgress(0);
        setShowDuplicateResolutionDialog(false);
        setDuplicateSets([]);
        setTransactionsToReview([]);
        setFile(null);
        // loadTransactions(); // If needed to refresh a list on the page
    }
};


  const loadTransactions = async () => {
    // This function is a placeholder. If this page needs to display a list
    // of all transactions (e.g., for a different view mode not shown),
    // implement the logic to fetch and set transactions here.
    // Example:
    // try {
    //   const allTransactions = await Transaction.list('-date');
    //   // setSomeStateVariable(allTransactions);
    // } catch (error) {
    //   console.error("Error loading all transactions:", error);
    //   toast({ title: "שגיאה בטעינת עסקאות", description: "לא ניתן היה לטעון את רשימת העסקאות המלאה.", variant: "destructive" });
    // }
  };

  const arrayBufferToWorkbook = (arrayBuffer) => {
    // This function is also a placeholder from the original code.
    // If direct XLSX parsing on the client-side is needed (e.g., with a library like SheetJS),
    // implement that here. Otherwise, if server-side extraction is used, this might not be necessary.
  };

  const isRTLLayout = isRTL();

  return (
    <div className={`min-h-screen w-full max-w-full ${isRTLLayout ? 'pr-2 pl-2' : 'px-2'} sm:px-4 lg:px-6 mx-auto overflow-hidden`} dir={isRTLLayout ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-none space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Header - Mobile Optimized with Better RTL Support */}
        <div className="flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
          <Upload className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary flex-shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight overflow-hidden">
              <span className="block truncate">{t('upload.title')}</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 leading-tight overflow-hidden">
              <span className="block truncate">{t('upload.subtitle')}</span>
            </p>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8 sm:h-9">
              <TabsTrigger value="upload" className="text-xs sm:text-sm px-1 overflow-hidden">
                <span className="truncate">{t('navigation.upload')}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm px-1 overflow-hidden">
                <span className="truncate">{t('upload.history.title')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-2 sm:mt-3 w-full">
              {error && (
                <Alert variant="destructive" className="mb-3 w-full">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm leading-tight overflow-hidden">
                    <span className="block break-words">{error}</span>
                  </AlertDescription>
                </Alert>
              )}
              {parseError && (
                <Alert variant="destructive" className="mb-3 w-full">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm leading-tight overflow-hidden">
                    <span className="block break-words">{parseError}</span>
                  </AlertDescription>
                </Alert>
              )}

              {!extractedTransactions.length > 0 ? (
                <>
                  {/* Enhanced Upload Section - Fixed Mobile Layout */}
                  <div className="w-full space-y-3 sm:space-y-4 overflow-hidden">
                    {/* File Upload Card - Mobile Optimized with No Overflow */}
                    <Card className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200 shadow-sm w-full overflow-hidden">
                      <CardHeader className="text-center pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6">
                        <div className="mx-auto w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                          <FileUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-blue-900 leading-tight overflow-hidden">
                          <span className="block break-words px-1">{t('upload.dropZone.title')}</span>
                        </CardTitle>
                        <p className="text-blue-700 text-xs sm:text-sm font-medium leading-tight mt-1 overflow-hidden">
                          <span className="block break-words px-1">{t('upload.dropZone.dragOrClick')}</span>
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                        {/* File Selection Area - No Overflow */}
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-3 sm:p-4 lg:p-6 text-center transition-all duration-200 cursor-pointer group w-full overflow-hidden ${
                            isDragOver
                              ? 'border-blue-500 bg-blue-100/50'
                              : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/30'
                          }`}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('file-upload').click()}
                        >
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                          />

                          <div className="space-y-2 w-full overflow-hidden">
                            <div className={`mx-auto w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center transition-transform duration-200 shadow-sm ${
                              isDragOver ? 'scale-110' : 'group-hover:scale-105'
                            }`}>
                              <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
                            </div>

                            <div className="space-y-1 w-full overflow-hidden px-1">
                              <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 leading-tight overflow-hidden">
                                <span className="block break-words">
                                  {isDragOver ? 'Drop file here' : t('upload.dropZone.selectFile')}
                                </span>
                              </p>
                              <p className="text-xs text-gray-600 leading-tight overflow-hidden">
                                <span className="block break-words">{t('upload.dropZone.supportedFormats')}</span>
                              </p>
                            </div>

                            <div className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium max-w-full overflow-hidden">
                              <Info className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate text-xs">{t('upload.dropZone.maxFileSize')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Selected File Display - No Overflow */}
                        {file && (
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200 shadow-sm w-full overflow-hidden">
                            <div className="flex items-start justify-between mb-2 gap-2 overflow-hidden">
                              <div className="flex items-start gap-2 min-w-0 flex-1 overflow-hidden">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <p className="font-medium text-gray-900 text-xs sm:text-sm leading-tight overflow-hidden">
                                    <span className="block break-words">{t('upload.fileSelected')}</span>
                                  </p>
                                  <p className="text-xs text-gray-600 leading-tight mt-0.5 overflow-hidden">
                                    <span className="block truncate">{file.name}</span>
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs flex-shrink-0 whitespace-nowrap">
                                {(file.size / 1024).toFixed(1)} KB
                              </Badge>
                            </div>

                            {/* Progress Bar - No Overflow */}
                            {uploading && (
                              <div className="space-y-2 mb-3 w-full overflow-hidden">
                                <div className="flex justify-between text-xs font-medium overflow-hidden">
                                  <span className="text-blue-600 flex-1 truncate pr-2">{t('upload.dropZone.processing')}</span>
                                  <span className="text-blue-600 flex-shrink-0">{progress}%</span>
                                </div>
                                <div className="relative w-full overflow-hidden">
                                  <Progress value={progress} className="h-2 w-full" />
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 rounded-full animate-pulse" />
                                </div>
                              </div>
                            )}

                            {/* Process Button - No Overflow */}
                            {!uploading && (
                              <div className="w-full overflow-hidden">
                                <Button
                                  onClick={processFile}
                                  className="w-full h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg overflow-hidden"
                                >
                                  <div className="flex items-center justify-center gap-1 sm:gap-2 w-full min-w-0 overflow-hidden">
                                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <div className="text-center min-w-0 flex-1 overflow-hidden">
                                      <div className="font-bold overflow-hidden">
                                        <span className="block truncate px-1">{t('upload.processFile')}</span>
                                      </div>
                                      <div className="text-xs text-blue-100 font-normal hidden sm:block mt-0.5 overflow-hidden">
                                        <span className="block truncate px-1">{t('upload.processFileSubtext')}</span>
                                      </div>
                                    </div>
                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  </div>
                                </Button>
                              </div>
                            )}

                            {/* Processing State - No Overflow */}
                            {uploading && (
                              <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg border border-blue-200 w-full overflow-hidden">
                                <div className="flex items-center gap-2 text-blue-700 min-w-0 overflow-hidden">
                                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="font-medium text-xs sm:text-sm leading-tight overflow-hidden">
                                      <span className="block truncate">{t('upload.processing.analyzing')}</span>
                                    </p>
                                    <p className="text-xs text-blue-600 leading-tight mt-0.5 hidden sm:block overflow-hidden">
                                      <span className="block truncate">{t('upload.processing.pleaseWait')}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Collapsible Upload Guide - No Overflow */}
                    <Card className="shadow-sm border-0 bg-white w-full overflow-hidden">
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6 overflow-hidden"
                        onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                      >
                        <CardTitle className="text-base flex items-center justify-between text-gray-800 w-full overflow-hidden">
                          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            </div>
                            <span className="flex-1 overflow-hidden">
                              <span className="block truncate">{t('upload.guide.title')}</span>
                            </span>
                          </div>
                          {isGuideExpanded ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </CardTitle>
                        {!isGuideExpanded && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-tight overflow-hidden">
                            <span className="block break-words pr-8">{t('upload.guide.clickToExpand')}</span>
                          </p>
                        )}
                      </CardHeader>

                      {isGuideExpanded && (
                        <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4 lg:px-6 overflow-hidden">
                          <div className="space-y-3 w-full overflow-hidden">
                            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200 w-full overflow-hidden">
                              <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2 overflow-hidden">
                                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 overflow-hidden">
                                  <span className="block truncate">{t('upload.guide.quickStart')}</span>
                                </span>
                              </h3>
                              <div className="grid gap-2 sm:gap-3 w-full overflow-hidden">
                                {/* Step 1 - No Overflow */}
                                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-md border border-blue-200 shadow-sm w-full overflow-hidden">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                                    1
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <h4 className="font-medium text-blue-900 mb-1 text-xs sm:text-sm leading-tight overflow-hidden">
                                      <span className="block truncate">{t('upload.guide.step1.title')}</span>
                                    </h4>
                                    <p className="text-xs text-blue-800 mb-2 leading-tight overflow-hidden">
                                      <span className="block break-words">{t('upload.guide.step1.description')}</span>
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50 h-7 sm:h-8 px-2 sm:px-3 text-xs w-full sm:w-auto overflow-hidden"
                                      onClick={() => {
                                        const headers = "date,business_name,amount,currency,description\n";
                                        const today = new Date();
                                        const todayStr = today.toISOString().split('T')[0];
                                        const yesterdayStr = new Date(today.getTime() - 24*60*60*1000).toISOString().split('T')[0];

                                        const examples = [
                                          `${todayStr},"Super Yochananof",150.50,"ILS","Weekly groceries"`,
                                          `${todayStr},"Aroma Tel Aviv",35.90,"ILS","Coffee and cake"`,
                                          `${yesterdayStr},"Paz Gas Station",-280.00,"ILS","Refund for fuel"`,
                                          `${yesterdayStr},"Amazon",55.20,"USD","Book purchase"`,
                                          `${yesterdayStr},"Pizza Hut",89.90,"ILS","Dinner"`
                                        ].join('\n') + '\n';

                                        const csvContent = headers + examples;
                                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);
                                        link.download = "transactions_template.csv";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        handleTemplateDownload();
                                      }}
                                    >
                                      <FileDown className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span className="truncate text-xs">{t('upload.guide.step1.button')}</span>
                                    </Button>
                                  </div>
                                </div>

                                {/* Step 2 - No Overflow */}
                                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-md border border-blue-200 shadow-sm w-full overflow-hidden">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                                    2
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <h4 className="font-medium text-blue-900 mb-1 text-xs sm:text-sm leading-tight overflow-hidden">
                                      <span className="block truncate">{t('upload.guide.step2.title')}</span>
                                    </h4>
                                    <p className="text-xs text-blue-800 mb-2 leading-tight overflow-hidden">
                                      <span className="block break-words">{t('upload.guide.step2.description')}</span>
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 w-full overflow-hidden">
                                      <div className="flex items-center gap-1 p-1 sm:p-1.5 bg-green-50 rounded-md border border-green-200 overflow-hidden">
                                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                        <span className="text-xs font-medium text-green-800 flex-1 overflow-hidden">
                                          <span className="block truncate">{t('upload.guide.step2.fields.date')}</span>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 p-1 sm:p-1.5 bg-green-50 rounded-md border border-green-200 overflow-hidden">
                                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                        <span className="text-xs font-medium text-green-800 flex-1 overflow-hidden">
                                          <span className="block truncate">{t('upload.guide.step2.fields.businessName')}</span>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 p-1 sm:p-1.5 bg-green-50 rounded-md border border-green-200 overflow-hidden">
                                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                        <span className="text-xs font-medium text-green-800 flex-1 overflow-hidden">
                                          <span className="block truncate">{t('upload.guide.step2.fields.amount')}</span>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 p-1 sm:p-1.5 bg-yellow-50 rounded-md border border-yellow-200 overflow-hidden">
                                        <Info className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                                        <span className="text-xs font-medium text-yellow-800 flex-1 overflow-hidden">
                                          <span className="block truncate">{t('upload.guide.step2.fields.currency')}</span>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-2 p-2 bg-amber-50 rounded-md border border-amber-200 w-full overflow-hidden">
                                      <div className="flex items-start gap-1 overflow-hidden">
                                        <Zap className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-amber-800 font-medium leading-tight flex-1 overflow-hidden">
                                          <span className="block break-words">{t('upload.guide.step2.autoDetect')}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Step 3 - No Overflow */}
                                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-md border border-blue-200 shadow-sm w-full overflow-hidden">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                                    3
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <h4 className="font-medium text-blue-900 mb-1 text-xs sm:text-sm leading-tight overflow-hidden">
                                      <span className="block truncate">{t('upload.guide.step3.title')}</span>
                                    </h4>
                                    <p className="text-xs text-blue-800 mb-2 leading-tight overflow-hidden">
                                      <span className="block break-words">{t('upload.guide.step3.description')}</span>
                                    </p>
                                    <div className="flex items-center gap-1 p-1 sm:p-1.5 bg-green-50 rounded-md border border-green-200 overflow-hidden">
                                      <Brain className="w-3 h-3 text-green-600 flex-shrink-0" />
                                      <span className="text-xs font-medium text-green-800 flex-1 overflow-hidden">
                                        <span className="block truncate">{t('upload.guide.step3.aiProcessing')}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Features Highlight - No Overflow */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full overflow-hidden">
                              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 overflow-hidden">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                </div>
                                <h4 className="font-medium text-green-900 mb-1 text-xs sm:text-sm leading-tight overflow-hidden">
                                  <span className="block break-words">{t('upload.features.currencyConversion.title')}</span>
                                </h4>
                                <p className="text-xs text-green-700 leading-tight overflow-hidden">
                                  <span className="block break-words">{t('upload.features.currencyConversion.description')}</span>
                                </p>
                              </div>

                              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200 overflow-hidden">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                                </div>
                                <h4 className="font-medium text-purple-900 mb-1 text-xs sm:text-sm leading-tight overflow-hidden">
                                  <span className="block break-words">{t('upload.features.aiCategorization.title')}</span>
                                </h4>
                                <p className="text-xs text-purple-700 leading-tight overflow-hidden">
                                  <span className="block break-words">{t('upload.features.aiCategorization.description')}</span>
                                </p>
                              </div>

                              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 overflow-hidden">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                </div>
                                <h4 className="font-medium text-blue-900 mb-1 text-xs sm:text-sm leading-tight overflow-hidden">
                                  <span className="block break-words">{t('upload.features.duplicateDetection.title')}</span>
                                </h4>
                                <p className="text-xs text-blue-700 leading-tight overflow-hidden">
                                  <span className="block break-words">{t('upload.features.duplicateDetection.description')}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                </>
              ) : (
                // Categorization Section - No Overflow
                <Card className="w-full overflow-hidden">
                  <CardHeader className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 overflow-hidden">
                    <div className="min-w-0 overflow-hidden">
                      <CardTitle className="text-base sm:text-lg leading-tight overflow-hidden">
                        <span className="block break-words">
                          {t('upload.categorization.title', { count: extractedTransactions.length })}
                        </span>
                      </CardTitle>
                    </div>
                    <div className="w-full sm:w-auto overflow-hidden">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-8 sm:h-9">
                          <TabsTrigger value="all" className="text-xs sm:text-sm px-1 overflow-hidden">
                            <span className="truncate">{t('upload.categorization.tabs.all')}</span>
                          </TabsTrigger>
                          <TabsTrigger value="categorized" className="text-xs sm:text-sm px-1 overflow-hidden">
                            <span className="truncate">{t('upload.categorization.tabs.categorized')}</span>
                          </TabsTrigger>
                          <TabsTrigger value="uncategorized" className="relative text-xs sm:text-sm px-1 overflow-hidden">
                            <span className="truncate pr-6">{t('upload.categorization.tabs.uncategorized')}</span>
                            {uncategorizedCount > 0 && (
                              <Badge className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-xs px-1 py-0 min-w-0 h-4">
                                {uncategorizedCount}
                              </Badge>
                            )}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 lg:px-6 overflow-hidden">
                    <div className="space-y-3 sm:space-y-4">
                      {categorizing && (
                        <Alert className="bg-blue-50 border-blue-200">
                          <div className="flex items-center">
                            <BrainCircuit className="h-4 w-4 text-blue-500 mr-2 animate-pulse flex-shrink-0" />
                            <span className="text-xs sm:text-sm break-words">{t('upload.categorization.autoCategorizingProgress')}</span>
                          </div>
                        </Alert>
                      )}

                      {activeTab === "uncategorized" && uncategorizedCount > 0 && (
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                          <h3 className="font-medium text-xs sm:text-sm">{t('upload.categorization.bulkCategorize.title')}</h3>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {categories.map((category) => (
                              <Badge
                                key={category.id}
                                className="cursor-pointer bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 py-1 px-2 text-xs"
                                onClick={() => setAllUncategorizedToCategory(category.id)}
                              >
                                <span className="truncate">{category.name}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mobile-First Transaction Table */}
                      <div className="w-full overflow-x-auto"> {/* Keep overflow-x-auto for table itself */}
                        <div className="inline-block min-w-full align-middle">
                          {/* Mobile Card Layout for Small Screens */}
                          <div className="sm:hidden space-y-3">
                            {getFilteredTransactions().map((transaction, index) => {
                              let cardClass = "bg-white border rounded-lg p-3 space-y-2";
                              if (transaction.ai_confidence === 'medium') {
                                cardClass += " border-yellow-200 bg-yellow-50";
                              } else if (!transaction.category_id) {
                                cardClass += " border-red-200 bg-red-50";
                              }

                              return (
                                <div key={index} className={cardClass}>
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-sm truncate">
                                        {transaction.business_name || 'N/A'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="font-medium text-sm">
                                        {transaction.currency === 'ILS' ? '₪' : transaction.currency + ' '}
                                        {(typeof transaction.billing_amount === 'number' ? transaction.billing_amount : 0).toLocaleString()}
                                      </div>
                                      {transaction.currency_converted && transaction.original_amount && transaction.original_currency && (
                                        <div className="text-xs text-gray-500">
                                          {t('upload.categorization.table.convertedFrom', { 
                                            originalAmount: transaction.original_amount.toLocaleString(), 
                                            originalCurrency: transaction.original_currency 
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <RadioGroup
                                      value={transaction.is_income ? "income" : "expense"}
                                      onValueChange={(value) => {
                                        setExtractedTransactions(prev => {
                                          const updated = [...prev];
                                          updated[index].is_income = value === "income";
                                          updated[index].ai_confidence = null;
                                          return updated;
                                        });
                                      }}
                                      className="flex gap-4"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="expense" id={`expense-${index}`} />
                                        <Label htmlFor={`expense-${index}`} className="text-xs">
                                          {t('upload.categorization.table.typeExpense')}
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="income" id={`income-${index}`} />
                                        <Label htmlFor={`income-${index}`} className="text-xs">
                                          {t('upload.categorization.table.typeIncome')}
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                    
                                    <div className="flex items-center gap-2">
                                      <Select
                                        key={`${transaction.id || index}-category`}
                                        value={transaction.category_id || ""}
                                        onValueChange={(value) => handleCategoryChange(index, value)}
                                      >
                                        <SelectTrigger className="w-full h-8">
                                          <SelectValue placeholder={t('categories.selectCategory')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {categories
                                            .filter(c => c.type === (transaction.is_income ? "income" : "expense"))
                                            .map((category) => (
                                              <SelectItem key={category.id} value={category.id}>
                                                <div className="flex items-center gap-2">
                                                  <IconRenderer iconName={category.icon} size={16} />
                                                  <span className="truncate">{category.name}</span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                      {transaction.ai_confidence === 'medium' && (
                                        <Eye className="h-4 w-4 text-yellow-600 flex-shrink-0" title={t('upload.categorization.table.confidence.reviewNeeded')} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Desktop Table Layout for Larger Screens */}
                          <div className="hidden sm:block rounded-md border min-w-full">
                            <table className="min-w-full divide-y">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className={`px-3 sm:px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('upload.categorization.table.date')}
                                  </th>
                                  <th className={`px-3 sm:px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('upload.categorization.table.business')}
                                  </th>
                                  <th className={`px-3 sm:px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('upload.categorization.table.amount')}
                                  </th>
                                  <th className={`px-3 sm:px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('upload.categorization.table.type')}
                                  </th>
                                  <th className={`px-3 sm:px-6 py-3 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('upload.categorization.table.category')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y">
                                {getFilteredTransactions().map((transaction, index) => {
                                  let rowClass = "";
                                  if (transaction.ai_confidence === 'medium') {
                                    rowClass = "bg-yellow-50";
                                  } else if (!transaction.category_id) {
                                    rowClass = "bg-red-50";
                                  }

                                  return (
                                    <tr key={index} className={rowClass}>
                                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                                      </td>
                                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm">
                                        <div className="max-w-[120px] sm:max-w-[200px] truncate">
                                          {transaction.business_name || 'N/A'}
                                        </div>
                                      </td>
                                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                                        <div>
                                          {transaction.currency === 'ILS' ? '₪' : transaction.currency + ' '}
                                          {(typeof transaction.billing_amount === 'number' ? transaction.billing_amount : 0).toLocaleString()}
                                        </div>
                                        {transaction.currency_converted && transaction.original_amount && transaction.original_currency && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {t('upload.categorization.table.convertedFrom', { 
                                              originalAmount: transaction.original_amount.toLocaleString(), 
                                              originalCurrency: transaction.original_currency 
                                            })}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                                        <RadioGroup
                                          value={transaction.is_income ? "income" : "expense"}
                                          onValueChange={(value) => {
                                            setExtractedTransactions(prev => {
                                              const updated = [...prev];
                                              updated[index].is_income = value === "income";
                                              updated[index].ai_confidence = null;
                                              return updated;
                                            });
                                          }}
                                          className="flex gap-3 lg:gap-4"
                                        >
                                          <div className="flex items-center space-x-1 lg:space-x-2">
                                            <RadioGroupItem value="expense" id={`expense-${index}`} />
                                            <Label htmlFor={`expense-${index}`} className="text-xs lg:text-sm">
                                              {t('upload.categorization.table.typeExpense')}
                                            </Label>
                                          </div>
                                          <div className="flex items-center space-x-1 lg:space-x-2">
                                            <RadioGroupItem value="income" id={`income-${index}`} />
                                            <Label htmlFor={`income-${index}`} className="text-xs lg:text-sm">
                                              {t('upload.categorization.table.typeIncome')}
                                            </Label>
                                          </div>
                                        </RadioGroup>
                                      </td>
                                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <Select
                                            key={`${transaction.id || index}-category`}
                                            value={transaction.category_id || ""}
                                            onValueChange={(value) => handleCategoryChange(index, value)}
                                          >
                                            <SelectTrigger className="w-full max-w-[150px] lg:max-w-[200px] h-8">
                                              <SelectValue placeholder={t('categories.selectCategory')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categories
                                                .filter(c => c.type === (transaction.is_income ? "income" : "expense"))
                                                .map((category) => (
                                                  <SelectItem key={category.id} value={category.id}>
                                                    <div className="flex items-center gap-2">
                                                      <IconRenderer iconName={category.icon} size={16} />
                                                      <span className="truncate">{category.name}</span>
                                                    </div>
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                          </Select>
                                          {transaction.ai_confidence === 'medium' && (
                                            <Eye className="h-4 w-4 text-yellow-600 flex-shrink-0" title={t('upload.categorization.table.confidence.reviewNeeded')} />
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setExtractedTransactions([]);
                            setNewRules([]);
                            setFile(null);
                          }}
                          className="w-full sm:w-auto order-2 sm:order-1"
                        >
                          {t('upload.categorization.actions.cancel')}
                        </Button>
                        <Button
                          onClick={saveTransactions}
                          disabled={savingData || extractedTransactions.filter(t=>t.category_id && t.billing_amount > 0).length === 0}
                          className="w-full sm:w-auto order-1 sm:order-2"
                        >
                          {savingData ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                              <span className="truncate">{t('upload.categorization.actions.saving')}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">
                                {t('upload.categorization.actions.save', { 
                                  count: extractedTransactions.filter(t=>t.category_id && t.billing_amount > 0).length 
                                })}
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-3 sm:mt-4 w-full overflow-hidden">
              {renderUploadHistory()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Duplicate Resolution Dialog - Mobile Optimized */}
        {showDuplicateResolutionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50" dir={isRTLLayout ? 'rtl' : 'ltr'}>
            <Card className="w-full max-w-full sm:max-w-2xl max-h-[90vh] flex flex-col mx-2 sm:mx-0">
              <CardHeader className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                <CardTitle className="text-base sm:text-lg break-words">{t('upload.duplicates.title')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  {t('upload.duplicates.description')}
                  {duplicateSets.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 break-words">
                      {t('upload.duplicates.example')} {format(new Date(duplicateSets[0].newTransaction.date), 'dd/MM/yyyy')}, {duplicateSets[0].newTransaction.business_name}, ₪{duplicateSets[0].newTransaction.billing_amount}
                      <br/>
                      {t('upload.duplicates.similarTo')} {format(new Date(duplicateSets[0].existingTransaction.date), 'dd/MM/yyyy')}, {duplicateSets[0].existingTransaction.business_name}, ₪{duplicateSets[0].existingTransaction.billing_amount}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="overflow-y-auto flex-grow px-3 sm:px-4 lg:px-6">
                {/* Mobile-First Duplicate List */}
                <div className="space-y-2 sm:hidden">
                  {transactionsToReview.map((transaction, index) => {
                    const key = `${format(new Date(transaction.date), 'yyyy-MM-dd')}-${transaction.business_name}-${transaction.billing_amount}`;
                    const currentResolution = resolvedDuplicates[key] || 'skip';
                    return (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">{transaction.business_name}</div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(transaction.date), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          <div className="text-sm font-medium flex-shrink-0">
                            {transaction.currency === 'ILS' ? '₪' : transaction.currency + ' '}
                            {transaction.billing_amount.toLocaleString()}
                          </div>
                        </div>
                        <Select
                          value={currentResolution}
                          onValueChange={(value) => handleIndividualResolution(transaction, value)}
                        >
                          <SelectTrigger className="w-full h-8">
                            <SelectValue/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">{t('upload.duplicates.actions.add')}</SelectItem>
                            <SelectItem value="skip">{t('upload.duplicates.actions.skip')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={`px-4 py-2 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>
                          {t('upload.duplicates.table.date')}
                        </th>
                        <th className={`px-4 py-2 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>
                          {t('upload.duplicates.table.business')}
                        </th>
                        <th className={`px-4 py-2 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>
                          {t('upload.duplicates.table.amount')}
                        </th>
                        <th className={`px-4 py-2 ${isRTLLayout ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>
                          {t('upload.duplicates.table.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactionsToReview.map((transaction, index) => {
                        const key = `${format(new Date(transaction.date), 'yyyy-MM-dd')}-${transaction.business_name}-${transaction.billing_amount}`;
                        const currentResolution = resolvedDuplicates[key] || 'skip';
                        return (
                          <tr key={key}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {format(new Date(transaction.date), 'dd/MM/yyyy')}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <div className="max-w-[150px] truncate">{transaction.business_name}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {transaction.currency === 'ILS' ? '₪' : transaction.currency + ' '}
                              {transaction.billing_amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <Select
                                value={currentResolution}
                                onValueChange={(value) => handleIndividualResolution(transaction, value)}
                              >
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="add">{t('upload.duplicates.actions.add')}</SelectItem>
                                  <SelectItem value="skip">{t('upload.duplicates.actions.skip')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 border-t pt-3 sm:pt-4 px-3 sm:px-4 lg:px-6">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
                  <Button variant="outline" onClick={handleSkipAll} className="w-full sm:w-auto text-xs sm:text-sm">
                    {t('upload.duplicates.actions.skipAll')}
                  </Button>
                  <Button variant="outline" onClick={handleAddAll} className="w-full sm:w-auto text-xs sm:text-sm">
                    {t('upload.duplicates.actions.addAll')}
                  </Button>
                </div>
                <Button
                  onClick={() => handleResolveDuplicates(resolvedDuplicates)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2 text-xs sm:text-sm"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" /> : null}
                  <span className="truncate">{t('upload.duplicates.actions.continue')}</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
