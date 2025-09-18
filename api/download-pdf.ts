import { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'fs';
import { join } from 'path';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingId, customerName } = request.query;

    if (!bookingId || !customerName || Array.isArray(bookingId) || Array.isArray(customerName)) {
      return response.status(400).json({ error: 'Invalid parameters' });
    }

    // Clean parameters
    const cleanCustomerName = customerName.replace(/[^א-ת\u0590-\u05FF\w\s-]/g, '');
    const cleanBookingId = bookingId.replace(/[^\w-]/g, '');
    
    // Construct filename
    const filename = `הזמנה_${cleanCustomerName}_${cleanBookingId}.pdf`;
    const filePath = join('/tmp/signed-pdfs', filename);

    try {
      // Check if file exists and read it
      await fs.access(filePath);
      const pdfBuffer = await fs.readFile(filePath);

      // Set appropriate headers for PDF download
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.setHeader('Content-Length', pdfBuffer.length.toString());
      response.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes cache

      console.log(`PDF downloaded: ${filename} (${pdfBuffer.length} bytes)`);

      // Send the PDF file
      return response.status(200).send(pdfBuffer);

    } catch (fileError) {
      console.error(`File not found: ${filename}`, fileError);
      
      // If file doesn't exist, return a helpful error
      return response.status(404).json({
        error: 'PDF file not found',
        message: 'הקובץ המבוקש לא נמצא. יתכן שהוא נמחק או שלא נוצר בהצלחה.',
        bookingId: cleanBookingId,
        customerName: cleanCustomerName
      });
    }

  } catch (error) {
    console.error('Error downloading PDF:', error);
    return response.status(500).json({
      error: 'Failed to download PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}