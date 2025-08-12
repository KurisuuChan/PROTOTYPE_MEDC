// src/utils/pdfUtils.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const toBase64 = (url) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

export const generateProductPDF = async (products, brandingData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const logoBase64 = await toBase64(brandingData.logo_url);

    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity || 0) * (p.price || 0), 0);
    const availableCount = products.filter((p) => p.status === "Available").length;
    const unavailableCount = products.filter((p) => p.status === "Unavailable").length;

    const tableColumn = ["ID", "Name", "Category", "Quantity", "Price", "Expiry", "Status"];
    const tableRows = products.map((p) => [
      p.medicineId || "N/A",
      p.name || "N/A",
      p.category || "N/A",
      p.quantity,
      `PHP ${p.price ? p.price.toFixed(2) : "0.00"}`,
      p.expireDate || "N/A",
      p.status || "N/A",
    ]);

    const exportDateTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const drawHeaderAndSummary = () => {
      doc.addImage(logoBase64, "PNG", 14, 10, 20, 20);
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text(brandingData.name, 38, 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Malolos, Central Luzon, Philippines", 38, 24);
      doc.text("Phone: (123) 456-7890 | Email: contact@medcure.ph", 38, 28);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40);
      doc.text("Product Inventory Report", pageWidth - 14, 20, { align: "right" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Exported on: ${exportDateTime}`, pageWidth - 14, 25, { align: "right" });
      doc.setDrawColor(224, 224, 224);
      doc.line(14, 38, pageWidth - 14, 38);
      autoTable(doc, {
        body: [
          ["Total Products:", totalProducts],
          ["Total Quantity:", totalQuantity],
          ["Estimated Total Value:", `PHP ${totalValue.toFixed(2)}`],
          ["Available / Unavailable:", `${availableCount} / ${unavailableCount}`],
        ],
        startY: 42,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: { 0: { fontStyle: "bold" } },
      });
    };

    drawHeaderAndSummary();
    const summaryFinalY = doc.lastAutoTable.finalY;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: summaryFinalY + 5,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 },        // ID
        1: { cellWidth: 45 },        // Name
        2: { cellWidth: 30 },        // Category
        3: { cellWidth: 18, halign: "center" }, // Quantity
        4: { cellWidth: 22, halign: "right" }, // Price
        5: { cellWidth: 25 },        // Expiry
        6: { cellWidth: 25 },        // Status
      },
      margin: { top: 40 },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          drawHeaderAndSummary();
        }
        doc.setFontSize(8);
        doc.setTextColor(150);
        const footerText = `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
      },
    });

    doc.save(`${brandingData.name}_Product_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    return { success: true };
  } catch (err) {
    console.error("Failed to generate PDF:", err.message);
    return { success: false, error: err.message };
  }
};
