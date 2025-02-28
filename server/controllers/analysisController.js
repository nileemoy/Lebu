// server/src/controllers/analysisController.ts

import { OpenAI } from 'openai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import * as cheerio from 'cheerio';

// Load environment variables
dotenv.config();

// Initialize NodeCache (TTL: 3600 seconds = 1 hour)
const analysisCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const knownMisinformationDomains = [
  // India-specific misinformation sites
  'thenationalistview.com', 'postcard.news', 'opindia.com', 'kreately.in',
  'rightlog.in', 'sudarshannews.in', 'organiser.org', 'jantakareporter.com',
  'navbharattimes.indiatimes.com', 'pgurus.com', 'sirf-news.com',
  'mynation.net', 'tfipost.com', 'swarajyamag.com', 'hindupost.in',
  'newsbharati.com', 'deshgujarat.com', 'indiatimes.in', 'nationalviews.in',
  'republicworld.com', 'janatakaadesh.com', 'indiatvnews.in',
  
  // Global known misinformation sites
  'infowars.com', 'naturalnews.com', 'theepochtimes.com', 'breitbart.com',
  'beforeitsnews.com', 'worldtruth.tv', 'newsmax.com', 'dailystormer.su',
  'zerohedge.com'
];

const credibleIndianSources = [
  'thehindu.com', 'indianexpress.com', 'ndtv.com', 'theprint.in', 
  'thewire.in', 'news18.com', 'hindustantimes.com', 'livemint.com',
  'telegraphindia.com', 'tribuneindia.com', 'economictimes.indiatimes.com',
  'timesofindia.indiatimes.com', 'thestatesman.com', 'deccanherald.com',
  'theweek.in', 'frontline.thehindu.com', 'outlookindia.com', 'scroll.in',
  'firstpost.com', 'cnbctv18.com', 'businesstoday.in'
];

const trustedIndianGovAndEduDomains = [
  'gov.in', 'nic.in', 'edu.in', 'ac.in', 'ac' , 'res.in', 'india.gov.in',
  'mygov.in', 'digitalindia.gov.in', 'pib.gov.in', 'meity.gov.in',
  'rbi.org.in', 'uidai.gov.in', 'niti.gov.in', 'mea.gov.in',
  'iitb.ac.in', 'iisc.ac.in', 'iitm.ac.in', 'iitd.ac.in', 'jnu.ac.in',
  'du.ac.in', 'ignou.ac.in', 'aiims.edu', 'iitkgp.ac.in'
];

const misinfoKeywords = [
  'shocking', 'exclusive', 'conspiracy', 'secret', 'banned', 'censored',
  'miracle', 'cure', 'ancient secret', 'doctors hate', 'they don\'t want you to know',
  'government hiding', 'suppressed', 'exposed', 'revealed', 'scandal',
  'विस्फोटक', 'चौंकाने वाला', 'रहस्य', 'षड्यंत्र', 'प्रतिबंधित',
  'चमत्कार', 'इलाज', 'प्राचीन रहस्य', 'डॉक्टर नापसंद करते हैं'
];

async function verifyWebsiteTrustIndia(url) {
  try {
    // Parse URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();
    const tld = domain.split('.').pop();

    // Initialize trust data
    const trustData = {
      https: parsedUrl.protocol === 'https:',
      isKnownMisinformation: false,
      isCredibleSource: false,
      isGovernmentOrEdu: false,
      hasTrustworthy: {
        tld: tld === 'in' || tld === 'org' || tld === 'com',
        keywords: false,
        subdomains: domain.includes('.gov.') || domain.includes('.ac.') || domain.includes('.edu.')
      },
      score: 50,
      reason: ''
    };

    // Check domain against known misinformation sites
    trustData.isKnownMisinformation = knownMisinformationDomains.some(d => domain.includes(d));
    // Check domain against credible sources
    trustData.isCredibleSource = credibleIndianSources.some(d => domain.includes(d));
    // Check if it's a government or educational domain
    trustData.isGovernmentOrEdu = trustedIndianGovAndEduDomains.some(d => domain.includes(d));

    // Try to fetch head of website to check SSL and other technical signals
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        maxRedirects: 3,
        validateStatus: null
      });

      // SSL is valid if we got a response
      trustData.validSsl = response && response.status !== 0;

      // Check security headers
      if (response && response.headers) {
        trustData.securityHeaders = {
          contentSecurity: !!response.headers['content-security-policy'],
          xFrameOptions: !!response.headers['x-frame-options'],
          strictTransport: !!response.headers['strict-transport-security']
        };
      }
    } catch (error) {
      console.error(`Failed to check technical signals for ${url}:`, error);
      trustData.validSsl = false;
      trustData.securityHeaders = { contentSecurity: false, xFrameOptions: false, strictTransport: false };
    }

    // Calculate trust score
    calculateIndianTrustScore(trustData, domain);

    return trustData;
  } catch (error) {
    console.error(`Error verifying trust for ${url}:`, error);
    return {
      https: false,
      isKnownMisinformation: false,
      isCredibleSource: false,
      isGovernmentOrEdu: false,
      hasTrustworthy: { tld: false, keywords: false, subdomains: false },
      validSsl: false,
      securityHeaders: { contentSecurity: false, xFrameOptions: false, strictTransport: false },
      score: 30,
      reason: 'Failed to verify website due to technical issues'
    };
  }
}

/**
 * Calculate trust score using India-specific criteria
 */
function calculateIndianTrustScore(trustData, domain) {
  let score = 50; // Start with neutral score
  let positiveFactors = [];
  let negativeFactors = [];

  // Check if domain is a known misinformation source
  if (trustData.isKnownMisinformation) {
    score -= 40;
    negativeFactors.push("Domain appears on list of known misinformation sources in India");
  }

  // Check if domain is a credible Indian news source
  if (trustData.isCredibleSource) {
    score += 30;
    positiveFactors.push("Domain is a recognized credible Indian news source");
  }

  // Check if domain is a government or educational site
  if (trustData.isGovernmentOrEdu) {
    score += 40;
    positiveFactors.push("Domain is an Indian government or educational institution");
  }

  // HTTPS and SSL
  if (trustData.https) {
    score += 5;
    positiveFactors.push("Uses secure HTTPS connection");
  } else {
    score -= 10;
    negativeFactors.push("Does not use secure HTTPS connection");
  }

  if (trustData.validSsl) {
    score += 5;
    positiveFactors.push("Has valid SSL certificate");
  }

  // TLD checks (.in domains get a boost)
  if (trustData.hasTrustworthy.tld) {
    if (domain.endsWith('.in')) {
      score += 5;
      positiveFactors.push("Uses official Indian TLD (.in)");
    }
  }

  // Check for misinformation keywords in domain
  const hasMisinfoKeyword = misinfoKeywords.some(keyword =>
    domain.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasMisinfoKeyword) {
    score -= 15;
    negativeFactors.push("Domain includes keywords often associated with misinformation");
  }

  // Security headers bonus
  if (trustData.securityHeaders) {
    let securityHeadersCount = 0;
    if (trustData.securityHeaders.contentSecurity) securityHeadersCount++;
    if (trustData.securityHeaders.xFrameOptions) securityHeadersCount++;
    if (trustData.securityHeaders.strictTransport) securityHeadersCount++;

    if (securityHeadersCount >= 2) {
      score += 5;
      positiveFactors.push("Implements security best practices");
    }
  }

  // Ensure score is within bounds
  trustData.score = Math.max(0, Math.min(100, score));

  // Generate reason based on factors
  if (positiveFactors.length > 0 && negativeFactors.length > 0) {
    trustData.reason = `Positive: ${positiveFactors.join(', ')}. Concerns: ${negativeFactors.join(', ')}.`;
  } else if (positiveFactors.length > 0) {
    trustData.reason = `Positive factors: ${positiveFactors.join(', ')}.`;
  } else if (negativeFactors.length > 0) {
    trustData.reason = `Concerns: ${negativeFactors.join(', ')}.`;
  } else {
    trustData.reason = 'No specific trust signals detected.';
  }
}

// Initialize Perplexity API client
const perplexityApi = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Updated helper function to extract only body text using Cheerio
async function fetchUrlContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    // Remove script, style, and noscript tags
    $('script, style, noscript').remove();
    // Extract text from the body element
    const content = $('body').text();
    return content.replace(/\s+/g, ' ').trim();
  } catch (error) {
    throw new Error(`Failed to fetch URL content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Analyze with Perplexity API with fallback
async function analyzeWithPerplexity(prompt, systemRole) {
  try {
    console.log('Analyzing with web crawler ');
    const response = await perplexityApi.post('/chat/completions', {
      model: 'r1-1776', // Updated model name
      messages: [
        { role: 'system', content: systemRole },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error);
    console.log('Falling back to openai for analysis');

    // Fallback to OpenAI if Perplexity fails
    const fallbackResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemRole + ' (Note: This is a fallback analysis as the primary service is unavailable.)' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    });

    return fallbackResponse.choices[0].message.content + " [Analysis provided by fallback service]";
  }
}

// Extract JSON from OpenAI without response_format parameter
async function extractJSONFromOpenAI(system, prompt, fallbackValue) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system + ' IMPORTANT: Format your response as valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                        content.match(/\{[\s\S]*\}/) ||
                        content.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return JSON.parse(
          jsonMatch[0].startsWith('{') || jsonMatch[0].startsWith('[')
            ? jsonMatch[0]
            : jsonMatch[1]
        );
      } else {
        console.error('No JSON found in response');
        return fallbackValue;
      }
    } catch (parseError) {
      console.error('Error parsing JSON from response:', parseError);
      return fallbackValue;
    }
  } catch (error) {
    console.error('Error getting JSON from OpenAI:', error);
    return fallbackValue;
  }
}

// Determine if content contains misinformation by analyzing responses
async function detectMisinformation(content, perplexityResponse, openaiResponse) {
  try {
    if (content.trim().length < 5) {
      return { 
        isMisinformation: false, 
        confidence: 0, 
        reason: "Content too short for reliable analysis" 
      };
    }

    const combinedAnalysis = perplexityResponse + " " + openaiResponse;

    const misinfoKeywords = [
      "no scientific evidence", "lacks credibility", "unsubstantiated", 
      "misleading", "false claim", "misinformation", "disinformation",
      "unfounded", "pseudoscience", "not supported by research",
      "factually incorrect", "no credible sources", "conspiracy",
      "debunked", "false", "myth", "not credible", "unsupported"
    ];

    let keywordHits = 0;
    let matchedKeywords = [];

    misinfoKeywords.forEach(keyword => {
      if (combinedAnalysis.toLowerCase().includes(keyword.toLowerCase())) {
        keywordHits++;
        matchedKeywords.push(keyword);
      }
    });

    const misinfoConfidence = Math.min(100, keywordHits * 20);
    const MAX_CONTENT_LENGTH = 1000;
    const trimmedContent = content.length > MAX_CONTENT_LENGTH ? content.substring(0, MAX_CONTENT_LENGTH) + "..." : content;

    const verificationResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a fact-checking expert. Analyze the following content and determine if it contains misinformation, answering only YES or NO.' },
        { role: 'user', content: `Content: "${trimmedContent}"\n\nAnalysis so far suggests ${keywordHits > 0 ? "this might be misinformation with these issues: " + matchedKeywords.join(", ") : "no issues identified"}. Is this content likely misinformation? Reply with ONLY a single word: YES or NO.` }
      ],
      max_tokens: 10
    });

    const gptVerdict = verificationResponse.choices[0].message.content.trim().toUpperCase();
    const isMisinfo = gptVerdict.includes("YES") || misinfoConfidence >= 40;

    return {
      isMisinformation: isMisinfo,
      confidence: misinfoConfidence,
      reason: isMisinfo ?
        `Analysis found ${keywordHits} indicators of misinformation: ${matchedKeywords.join(", ")}` :
        "Content appears factually accurate"
    };
  } catch (error) {
    console.error('Error in misinformation detection:', error);
    return { 
      isMisinformation: false, 
      confidence: 0, 
      reason: "Analysis error: " + error.message 
    };
  }
}

// Analyze URL content using real APIs
export const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const cacheKey = `url-${url}`;
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    console.log(`Fetching content from URL: ${url}`);
    const content = await fetchUrlContent(url);

    console.log(`Verifying India-centric trust signals: ${url}`);
    const trustSignals = await verifyWebsiteTrustIndia(url);
    console.log(`India-centric trust signals:`, trustSignals);

    const perplexitySystemRole = 'You are a fact-checking assistant that analyzes content for credibility and accuracy. Provide detailed analysis on factual errors, source reputation, and potential misinformation, with particular attention to Indian news and content.';
    const perplexityPrompt = `Analyze this content from URL ${url} for credibility, factual accuracy, and potential misinformation. If the content appears to be from India or about Indian topics, pay extra attention to common misinformation patterns in Indian media:\n\n${content.substring(0, 4000)}`;
    const perplexityResponse = await analyzeWithPerplexity(perplexityPrompt, perplexitySystemRole);

    console.log('Analyzing the results');
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a media analysis expert specialized in identifying patterns of misinformation, manipulated media, and bias in content, with particular expertise in Indian media and information ecosystem.' },
        { role: 'user', content: `Analyze this content from URL ${url} for manipulation, bias, and signs of generated or misleading information. If the content relates to India, consider common patterns of misinformation in Indian media:\n\n${content.substring(0, 4000)}` }
      ],
      max_tokens: 1000
    });

    console.log('Analyzing source reputation');
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    const reputationResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a media literacy expert who evaluates the credibility of news sources, with particular expertise in Indian media ecosystem.' },
        { role: 'user', content: `Provide a brief assessment of the credibility and reputation of "${domain}" as a news source or information provider. Consider factors such as their history of factual reporting, political bias, and reliability. If this is an Indian source, mention that specifically. Additionally, here are technical trust signals about the site: ${JSON.stringify(trustSignals, null, 2)}. Respond in 2-3 sentences.` }
      ],
      max_tokens: 250
    });

    console.log('Extracting metadata and key facts');
    const metadataFallback = {
      title: domain,
      source: domain,
      publishDate: new Date().toISOString().split('T')[0],
      factualErrors: 0,
      misleadingClaims: 0,
      politicalBias: 'Unknown',
      sentiment: 'Neutral',
      indianContext: false
    };

    const metadataSystem = 'Extract key metadata from content. Format response as JSON with keys: title, source, publishDate, factualErrors (number), misleadingClaims (number), politicalBias (None, Slight, Moderate, Strong), sentiment (Positive, Negative, Neutral), indianContext (boolean, true if content relates to India).';
    const metadataPrompt = `Extract metadata from this content:\n\n${content.substring(0, 4000)}`;
    const metadata = await extractJSONFromOpenAI(metadataSystem, metadataPrompt, metadataFallback);

    console.log('Checking for misinformation');
    const misinfoCheck = await detectMisinformation(
      content,
      perplexityResponse,
      openaiResponse.choices[0].message.content
    );

    console.log('Calculating truth score and factors');
    const factorsFallback = {
      truthScore: 50,
      factors: [
        { name: 'Source Credibility', score: 50 },
        { name: 'Factual Accuracy', score: 50 },
        { name: 'Bias Assessment', score: 50 },
        { name: 'Manipulation Detection', score: 50 }
      ]
    };

    const factorsSystem = 'Based on the analysis, calculate 4 factors with scores from 0-100:\n1. Source Credibility\n2. Factual Accuracy\n3. Bias Assessment\n4. Manipulation Detection\n\nAlso calculate an overall truth score from 0-100. Format as JSON with keys: truthScore and factors (array of objects with name and score).';
    const factorsPrompt = `Perplexity analysis: ${perplexityResponse}\n\nOpenAI analysis: ${openaiResponse.choices[0].message.content}\n\nSource reputation: ${reputationResponse.choices[0].message.content}`;
    let factorsData = await extractJSONFromOpenAI(factorsSystem, factorsPrompt, factorsFallback);

    if (misinfoCheck.isMisinformation) {
      console.log(`Misinformation detected: ${misinfoCheck.reason}. Adjusting scores.`);
      const factualIndex = factorsData.factors.findIndex((f) => 
        f.name.toLowerCase().includes('factual') || f.name.toLowerCase().includes('accuracy'));
      
      if (factualIndex >= 0) {
        factorsData.factors[factualIndex].score = Math.max(5, 100 - factorsData.factors[factualIndex].score);
      }
      
      const misinfoWeight = 0.7;
      const originalWeight = 0.3;
      const misinfoBasedScore = 100 - misinfoCheck.confidence;
      factorsData.truthScore = Math.round(
        (misinfoBasedScore * misinfoWeight) + 
        (factorsData.truthScore * originalWeight)
      );
    }

    const originalTruthScore = factorsData.truthScore;
    const contentWeight = 0.6;
    const technicalWeight = 0.4;
    factorsData.truthScore = Math.round(
      (originalTruthScore * contentWeight) + 
      (trustSignals.score * technicalWeight)
    );

    console.log(`Original content trust score: ${originalTruthScore}, India-specific trust score: ${trustSignals.score}, Combined score: ${factorsData.truthScore}`);
    
    const credibilityIndex = factorsData.factors.findIndex((f) => 
      f.name.toLowerCase().includes('credibility') || f.name.toLowerCase().includes('source'));
    
    if (credibilityIndex >= 0) {
      factorsData.factors[credibilityIndex].score = Math.round(
        (factorsData.factors[credibilityIndex].score * 0.5) + 
        (trustSignals.score * 0.5)
      );
    } else {
      factorsData.factors.push({
        name: 'Indian Source Credibility',
        score: trustSignals.score
      });
    }
    
    if (trustSignals.isGovernmentOrEdu) {
      factorsData.factors.push({
        name: 'Indian Government/Educational Source',
        score: 90
      });
    }
    
    console.log('Generating summary');
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Provide a concise 3-4 sentence summary of the analysis, highlighting key findings about the content credibility, factual accuracy, and potential issues. If the content relates to India, mention this specifically.' },
        { role: 'user', content: `Perplexity analysis: ${perplexityResponse}\n\nOpenAI analysis: ${openaiResponse.choices[0].message.content}\n\nSource reputation: ${reputationResponse.choices[0].message.content}\n\nTechnical trust analysis: ${JSON.stringify(trustSignals, null, 2)}` }
      ],
      max_tokens: 300
    });
    
    console.log('Combining analysis results');
    const result = {
      id: `url-${Date.now()}`,
      type: 'url',
      url,
      title: metadata?.title || domain,
      source: metadata?.source || domain,
      publishDate: metadata?.publishDate || new Date().toISOString().split('T')[0],
      truthScore: factorsData.truthScore,
      credibility: factorsData.truthScore >= 70 ? 'High' : factorsData.truthScore >= 40 ? 'Medium' : 'Low',
      sourceReputation: reputationResponse.choices[0].message.content,
      factors: factorsData.factors,
      factualErrors: metadata?.factualErrors || 0,
      misleadingClaims: metadata?.misleadingClaims || 0,
      politicalBias: metadata?.politicalBias || 'Unknown',
      sentiment: metadata?.sentiment || 'Neutral',
      indianContext: metadata?.indianContext || false,
      misinformation: misinfoCheck.isMisinformation ? {
        detected: true,
        confidence: misinfoCheck.confidence,
        reason: misinfoCheck.reason
      } : {
        detected: false
      },
      indiaTrustSignals: {
        score: trustSignals.score,
        isKnownMisinformation: trustSignals.isKnownMisinformation,
        isCredibleSource: trustSignals.isCredibleSource,
        isGovernmentOrEdu: trustSignals.isGovernmentOrEdu,
        https: trustSignals.https,
        validSsl: trustSignals.validSsl,
        reason: trustSignals.reason
      },
      summary: summaryResponse.choices[0].message.content,
      timestamp: new Date().toISOString(),
      perplexityResponse: perplexityResponse,
      openaiResponse: openaiResponse.choices[0].message.content,
      rawContent: content.substring(0, 1000) + '...'
    };

    analysisCache.set(cacheKey, result);
    console.log('Analysis complete');
    res.json(result);
  } catch (error) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({ 
      error: 'Failed to analyze URL',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

// Analyze text content using real APIs
export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const textHash = crypto.createHash('sha256').update(text).digest('hex');
    const cacheKey = `text-${textHash}`;
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const perplexitySystemRole = 'You are a fact-checking assistant that analyzes content for credibility and accuracy. Provide detailed analysis on factual errors, and potential misinformation.';
    const perplexityPrompt = `Analyze this content for credibility, factual accuracy, and potential misinformation:\n\n${text.substring(0, 4000)}`;
    const perplexityResponse = await analyzeWithPerplexity(perplexityPrompt, perplexitySystemRole);

    console.log('Analyzing with OpenAI API');
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a media analysis expert specialized in identifying patterns of misinformation, AI-generated content, and bias. Analyze the provided content for these issues.' },
        { role: 'user', content: `Analyze this content for manipulation, bias, and signs of generated or misleading information:\n\n${text.substring(0, 4000)}` }
      ],
      max_tokens: 1000
    });

    console.log('Extracting metadata');
    const metadataFallback = {
      factualErrors: 0,
      misleadingClaims: 0,
      politicalBias: 'Unknown',
      sentiment: 'Neutral'
    };

    const metadataSystem = 'Extract key metadata from content. Format response as JSON with keys: factualErrors (number), misleadingClaims (number), politicalBias (None, Slight, Moderate, Strong), sentiment (Positive, Negative, Neutral).';
    const metadataPrompt = `Extract metadata from this content:\n\n${text.substring(0, 4000)}`;
    const metadata = await extractJSONFromOpenAI(metadataSystem, metadataPrompt, metadataFallback);

    console.log('Checking for misinformation');
    const misinfoCheck = await detectMisinformation(
      text,
      perplexityResponse,
      openaiResponse.choices[0].message.content
    );

    console.log('Calculating truth score and factors');
    const factorsFallback = {
      truthScore: 50,
      factors: [
        { name: 'Factual Accuracy', score: 50 },
        { name: 'Bias Assessment', score: 50 },
        { name: 'Manipulation Detection', score: 50 },
        { name: 'AI Generation Probability', score: 50 }
      ]
    };

    const factorsSystem = 'Based on the analysis, calculate 4 factors with scores from 0-100:\n1. Factual Accuracy\n2. Bias Assessment\n3. Manipulation Detection\n4. AI Generation Probability\n\nAlso calculate an overall truth score from 0-100. Format as JSON with keys: truthScore and factors (array of objects with name and score).';
    const factorsPrompt = `Perplexity analysis: ${perplexityResponse}\n\nOpenAI analysis: ${openaiResponse.choices[0].message.content}`;
    let factorsData = await extractJSONFromOpenAI(factorsSystem, factorsPrompt, factorsFallback);

    if (misinfoCheck.isMisinformation) {
      console.log(`Misinformation detected: ${misinfoCheck.reason}. Adjusting scores.`);
      const factualIndex = factorsData.factors.findIndex((f) =>
        f.name.toLowerCase().includes('factual') || f.name.toLowerCase().includes('accuracy'));
      if (factualIndex >= 0) {
        factorsData.factors[factualIndex].score = Math.max(5, 100 - factorsData.factors[factualIndex].score);
      }
      const misinfoWeight = 0.7;
      const originalWeight = 0.3;
      const misinfoBasedScore = 100 - misinfoCheck.confidence;
      factorsData.truthScore = Math.round(
        (misinfoBasedScore * misinfoWeight) +
        (factorsData.truthScore * originalWeight)
      );
    }

    console.log('Generating summary');
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Provide a concise 3-4 sentence summary of the analysis, highlighting key findings about the content credibility, factual accuracy, and potential issues.' },
        { role: 'user', content: `Perplexity analysis: ${perplexityResponse}\n\nOpenAI analysis: ${openaiResponse.choices[0].message.content}` }
      ],
      max_tokens: 300
    });

    console.log('Combining analysis results');
    const result = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      truthScore: factorsData.truthScore,
      factualErrors: metadata?.factualErrors || 0,
      misleadingClaims: metadata?.misleadingClaims || 0,
      sentiment: metadata?.sentiment || 'Neutral',
      politicalBias: metadata?.politicalBias || 'Unknown',
      factors: factorsData.factors,
      misinformation: misinfoCheck.isMisinformation ? {
        detected: true,
        confidence: misinfoCheck.confidence,
        reason: misinfoCheck.reason
      } : {
        detected: false
      },
      summary: summaryResponse.choices[0].message.content,
      timestamp: new Date().toISOString(),
      perplexityResponse: perplexityResponse,
      openaiResponse: openaiResponse.choices[0].message.content,
      rawContent: text.substring(0, 1000) + (text.length > 1000 ? '...' : '')
    };

    analysisCache.set(cacheKey, result);
    console.log('Analysis complete');
    res.json(result);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({
      error: 'Failed to analyze text',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

// Analyze image content
export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageFile = req.file;
    console.log(`Analyzing image: ${imageFile.originalname}`);

    const cacheKey = `image-${imageFile.originalname}-${imageFile.size}`;
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const imageBase64 = fs.readFileSync(imageFile.path, { encoding: 'base64' });

    console.log('Analyzing with OpenAI Vision API');
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        { role: "system", content: "You are an expert in detecting image manipulation, deepfakes, and visual misinformation. Analyze the provided image in detail for signs of manipulation." },
        { role: "user", content: [
            { type: "text", text: "Analyze this image for signs of manipulation, photoshopping, or deepfake technology. Look for inconsistencies, artifacts, unnatural elements, and other signs of digital alteration." },
            { type: "image_url", image_url: { url: `data:image/${imageFile.mimetype.split('/')[1]};base64,${imageBase64}` } }
          ]
        }
      ],
      max_tokens: 1000
    });

    console.log('Getting detailed manipulation analysis');
    const detailsFallback = { 
      manipulationDetected: false, 
      manipulatedRegions: [], 
      deepfakeConfidence: 0, 
      originalFound: false, 
      originalSource: null 
    };

    const detailsSystem = "Based on the initial image analysis, provide specific details about potential manipulation. Format as JSON with keys: manipulationDetected (boolean), manipulatedRegions (array of strings), deepfakeConfidence (number 0-100), originalFound (boolean), originalSource (string or null).";
    const detailsPrompt = `Initial analysis: ${visionResponse.choices[0].message.content}`;
    const details = await extractJSONFromOpenAI(detailsSystem, detailsPrompt, detailsFallback);

    console.log('Calculating truth score and factors');
    const factorsFallback = {
      truthScore: 50,
      factors: [
        { name: 'Image Quality', score: 50 },
        { name: 'Manipulation Detection', score: 50 },
        { name: 'Deepfake Probability', score: 50 },
        { name: 'Overall Authenticity', score: 50 }
      ]
    };

    const factorsSystem = 'Based on the image analysis, calculate 4 factors with scores from 0-100:\n1. Image Quality\n2. Manipulation Detection\n3. Deepfake Probability\n4. Overall Authenticity\n\nAlso calculate an overall truth score from 0-100. Format as JSON with keys: truthScore and factors (array of objects with name and score).';
    const factorsPrompt = `Image analysis: ${visionResponse.choices[0].message.content}`;
    const factorsData = await extractJSONFromOpenAI(factorsSystem, factorsPrompt, factorsFallback);

    console.log('Generating summary');
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Provide a concise 3-4 sentence summary of the image analysis, highlighting key findings about authenticity and potential manipulation.' },
        { role: 'user', content: `Image analysis: ${visionResponse.choices[0].message.content}` }
      ],
      max_tokens: 300
    });

    const uploadDir = path.join(__dirname, '../uploads/analyzed');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${imageFile.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.copyFileSync(imageFile.path, filePath);

    console.log('Combining analysis results');
    const result = {
      id: `image-${Date.now()}`,
      type: 'image',
      filename: imageFile.originalname,
      truthScore: factorsData.truthScore,
      manipulationDetected: details.manipulationDetected,
      deepfakeConfidence: details.deepfakeConfidence,
      manipulatedRegions: details.manipulatedRegions,
      originalFound: details.originalFound,
      originalSource: details.originalSource,
      factors: factorsData.factors,
      summary: summaryResponse.choices[0].message.content,
      timestamp: new Date().toISOString(),
      visionResponse: visionResponse.choices[0].message.content,
      imagePath: `/uploads/analyzed/${fileName}`
    };

    analysisCache.set(cacheKey, result);
    fs.unlinkSync(imageFile.path);

    console.log('Analysis complete');
    res.json(result);
  } catch (error) {
    console.error('Error analyzing image:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

// Analyze video content - simplified due to complexity
export const analyzeVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    const videoFile = req.file;
    console.log(`Analyzing video: ${videoFile.originalname}`);

    const cacheKey = `video-${videoFile.originalname}-${videoFile.size}`;
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    console.log('Getting basic analysis');
    const basicResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert in detecting video manipulation and deepfakes. Based on the limited information provided, estimate the likelihood of manipulation." },
        { role: "user", content: `Analyze this video file information:\nFilename: ${videoFile.originalname}\nSize: ${videoFile.size} bytes\nMIME type: ${videoFile.mimetype}` }
      ],
      max_tokens: 500
    });

    console.log('Generating detailed analysis');
    const detailsFallback = { 
      manipulationDetected: false, 
      deepfakeConfidence: 0, 
      manipulatedElements: [], 
      inconsistencies: [] 
    };

    const detailsSystem = "Create a simulated video analysis result as JSON with these keys: manipulationDetected (boolean), deepfakeConfidence (number 0-100), manipulatedElements (array of strings), inconsistencies (array of strings).";
    const detailsPrompt = `Based on this filename and information, create a detailed analysis simulation:\nFilename: ${videoFile.originalname}\nSize: ${videoFile.size} bytes\nMIME type: ${videoFile.mimetype}`;
    const details = await extractJSONFromOpenAI(detailsSystem, detailsPrompt, detailsFallback);

    console.log('Calculating truth score and factors');
    const factorsFallback = {
      truthScore: 50,
      factors: [
        { name: 'Video Quality', score: 50 },
        { name: 'Manipulation Likelihood', score: 50 },
        { name: 'Deepfake Probability', score: 50 },
        { name: 'Content Authenticity', score: 50 }
      ]
    };

    const factorsSystem = 'Based on the analysis, calculate 4 factors with scores from 0-100:\n1. Video Quality\n2. Manipulation Likelihood\n3. Deepfake Probability\n4. Content Authenticity\n\nAlso calculate an overall truth score from 0-100. Format as JSON with keys: truthScore and factors (array of objects with name and score).';
    const factorsPrompt = `Video analysis: ${basicResponse.choices[0].message.content}`;
    const factorsData = await extractJSONFromOpenAI(factorsSystem, factorsPrompt, factorsFallback);

    console.log('Generating summary');
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Provide a concise 3-4 sentence summary of the video analysis, acknowledging the limitations of the analysis and highlighting potential authenticity concerns.' },
        { role: 'user', content: `Video analysis: ${basicResponse.choices[0].message.content}` }
      ],
      max_tokens: 300
    });

    const uploadDir = path.join(__dirname, '../uploads/analyzed');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${videoFile.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.copyFileSync(videoFile.path, filePath);

    console.log('Combining analysis results');
    const result = {
      id: `video-${Date.now()}`,
      type: 'video',
      filename: videoFile.originalname,
      truthScore: factorsData.truthScore,
      manipulationDetected: details.manipulationDetected,
      deepfakeConfidence: details.deepfakeConfidence,
      manipulatedElements: details.manipulatedElements,
      inconsistencies: details.inconsistencies,
      factors: factorsData.factors,
      summary: summaryResponse.choices[0].message.content,
      timestamp: new Date().toISOString(),
      basicResponse: basicResponse.choices[0].message.content,
      videoPath: `/uploads/analyzed/${fileName}`
    };

    analysisCache.set(cacheKey, result);
    fs.unlinkSync(videoFile.path);

    console.log('Analysis complete');
    res.json(result);
  } catch (error) {
    console.error('Error analyzing video:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'Failed to analyze video',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
