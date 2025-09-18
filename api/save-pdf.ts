import { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import { join } from 'path';

interface SavePDFRequest {
  bookingId: string;
  customerName: string;
  pdfData: string; // base64 encoded PDF
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingId, customerName, pdfData }: SavePDFRequest = request.body;

    if (!bookingId || !customerName || !pdfData) {
      return response.status(400).json({ error: 'Missing required data' });
    }

    // Validate and clean filename
    const cleanCustomerName = customerName.replace(/[^א-ת\u0590-\u05FF\w\s-]/g, '');
    const cleanBookingId = bookingId.replace(/[^\w-]/g, '');
    
    // Create filename
    const filename = `הזמנה_${cleanCustomerName}_${cleanBookingId}.pdf`;
    
    // In production, we'll use /tmp directory which is available in Vercel functions
    const uploadsDir = '/tmp/signed-pdfs';
    const filePath = join(uploadsDir, filename);

    try {
      // Ensure directory exists
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (mkdirError) {
      console.log('Directory might already exist:', mkdirError);
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(
      pdfData.includes(',') ? pdfData.split(',')[1] : pdfData,
      'base64'
    );

    // Save PDF file
    await fs.writeFile(filePath, pdfBuffer);

    // Generate download URL
    const downloadUrl = `/api/download-pdf?bookingId=${encodeURIComponent(cleanBookingId)}&customerName=${encodeURIComponent(cleanCustomerName)}`;

    console.log(`PDF saved successfully: ${filename} (${pdfBuffer.length} bytes)`);

    return response.status(200).json({
      success: true,
      message: 'PDF saved successfully',
      downloadUrl,
      filename,
      size: pdfBuffer.length
    });

  } catch (error) {
    console.error('Error saving PDF:', error);
    return response.status(500).json({
      error: 'Failed to save PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}