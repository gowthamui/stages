import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.InputStream;

/**
 * @author mhebert
 */
public class PDFTests {

    public byte[] toByteArray(InputStream inputStream) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();

        int nRead;
        byte[] data = new byte[16384];

        while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }

        buffer.flush();

        return buffer.toByteArray();
    }

    @org.junit.Test
    public void appendText() {
        try {
            InputStream is = PDFTests.class.getResourceAsStream("RAD-HF_Consent.pdf");
            String current = new java.io.File(".").getCanonicalPath();
            System.out.println("Current dir:" + current);

            PdfReader pdfReader = new PdfReader(is);

            PdfStamper pdfStamper = new PdfStamper(pdfReader,
                    new FileOutputStream("HelloWorld-Stamped.pdf"));

            byte[] watermark = toByteArray(PDFTests.class.getResourceAsStream("watermark.png"));
            Image image = Image.getInstance(watermark);

            for (int i = 1; i <= pdfReader.getNumberOfPages(); i++) {

                PdfContentByte content = pdfStamper.getOverContent(i);

                image.setAbsolutePosition(0f, 0f);

                content.addImage(image);
            }

            pdfStamper.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @org.junit.Test
    public void appendParagraph() {
        try {
            // Create output PDF
            Document document = new Document(PageSize.A4);
            FileOutputStream outputStream = new FileOutputStream("HelloWorld-Stamped.pdf");
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            document.open();
            PdfContentByte cb = writer.getDirectContent();

            // Load existing PDF
            InputStream templateInputStream = PDFTests.class.getResourceAsStream("RAD-HF_Consent.pdf");
            PdfReader reader = new PdfReader(templateInputStream);
            document.setPageSize(reader.getPageSize(1));


            // Copy first page of existing PDF into output PDF
            for (int i = 1; i <= reader.getNumberOfPages(); i++) {

                PdfImportedPage page = writer.getImportedPage(reader, i);
                document.newPage();
                cb.addTemplate(page, 0, 0);
            }

            // Add your new data / text here
            // for example...
            document.newPage();
            byte[] watermark = toByteArray(PDFTests.class.getResourceAsStream("watermark.png"));
            Image image = Image.getInstance(watermark);




            Paragraph para = new Paragraph("Authorized Signature: ");
            Chunk sigUnderline = new Chunk("                                            ");
            sigUnderline.setUnderline(0.2f, -2f);
            para.add(sigUnderline);
            document.add(para);

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            para = new Paragraph("Date: ");
            Chunk dateUnderline = new Chunk("                       ");
            dateUnderline.setUnderline(0.2f, -2f);
            para.add(dateUnderline);
            document.add(para);


            document.add(image);
            document.add(new Paragraph());

            document.close();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

}
