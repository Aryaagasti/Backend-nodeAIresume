const pdf = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const { extract } = require('textract');
const logger = require('./logger');
const pdf2pic = require('pdf2pic');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const parseResumeFile = async (file) => {
  try {
    let buffer = file.buffer;
    const extension = file.originalname.split('.').pop().toLowerCase();
    
    let text = '';
    
    if (extension === 'pdf') {
      try {
        // First try standard text extraction
        const data = await pdf(buffer);
        text = data.text;
        
        // Fallback to OCR if no text found
        if (!text.trim()) {
          logger.info('No text found in PDF, attempting OCR...');
          
          // Ensure buffer is fresh
          buffer = file.buffer;
          
          // Create temp directory
          const tempDir = path.join(__dirname, '../temp');
          await fs.mkdir(tempDir, { recursive: true });
          
          // Convert PDF to images
          const options = {
            density: 300,
            saveFilename: 'temp',
            savePath: tempDir,
            format: 'png',
            width: 2000,
            height: 2000
          };
          
          const convert = pdf2pic.fromBuffer(buffer, options);
          const pages = await convert.bulk(-1);

          // Process each page with OCR
          const worker = await createWorker();
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          
          for (const page of pages) {
            try {
              const { data: { text: pageText } } = await worker.recognize(page.path);
              text += pageText + '\n';
            } finally {
              await fs.unlink(page.path);
            }
          }
          
          await worker.terminate();
        }
      } catch (err) {
        logger.error(`PDF processing error: ${err.message}`);
        throw new Error('Failed to process PDF file');
      }
    } 
    else if (extension === 'docx' || extension === 'doc') {
      try {
        text = await new Promise((resolve, reject) => {
          extract({ buffer }, (err, extractedText) => {
            if (err) reject(err);
            else resolve(extractedText);
          });
        });
      } catch (err) {
        logger.error(`DOCX processing error: ${err.message}`);
        throw new Error('Failed to process Word document');
      }
    } 
    else if (extension === 'txt') {
      text = buffer.toString('utf-8');
    }
    else {
      throw new Error('Unsupported file format');
    }
    
    if (!text.trim()) {
      throw new Error('No text could be extracted from the file');
    }
    
    return text.trim();
  } catch (error) {
    logger.error(`File parsing failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  parseResumeFile
};