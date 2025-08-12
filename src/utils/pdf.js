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

export const generateReceiptPDF = async (saleDetails, brandingData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const logoBase64 = await toBase64(brandingData.url);

    // PDF Header
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

    // Receipt Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Official Receipt", pageWidth - 14, 20, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Sale ID: ${saleDetails.id}`, pageWidth - 14, 25, {
      align: "right",
    });
    doc.text(
      `Date: ${new Date(saleDetails.created_at).toLocaleString()}`,
      pageWidth - 14,
      30,
      { align: "right" }
    );

    doc.setDrawColor(224, 224, 224);
    doc.line(14, 40, pageWidth - 14, 40);

    // Items Table
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = saleDetails.items.map((item) => {
      const itemName = item.name || item.products?.name || "Unknown Product";
      const variantInfo = item.product_variants
        ? ` (${item.product_variants.unit_type})`
        : "";
      const displayName = itemName + variantInfo;

      return [
        displayName,
        item.quantity,
        `₱${(item.price_at_sale || item.price).toFixed(2)}`,
        `₱${(item.quantity * (item.price_at_sale || item.price)).toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: "plain",
      headStyles: { fontStyle: "bold" },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
    });

    // Totals Section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    if (saleDetails.discount_applied) {
      const subtotal = saleDetails.items.reduce(
        (sum, item) => sum + item.quantity * (item.price_at_sale || item.price),
        0
      );
      const discount = subtotal * 0.2;
      doc.text("Subtotal:", 14, finalY);
      doc.text(`₱${subtotal.toFixed(2)}`, pageWidth - 14, finalY, {
        align: "right",
      });
      doc.text("Discount (20%):", 14, finalY + 5);
      doc.text(`- ₱${discount.toFixed(2)}`, pageWidth - 14, finalY + 5, {
        align: "right",
      });
    }
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 14, finalY + 10);
    doc.text(
      `₱${saleDetails.total_amount.toFixed(2)}`,
      pageWidth - 14,
      finalY + 10,
      { align: "right" }
    );

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "Thank you for your purchase!",
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    doc.save(`Receipt-Sale-${saleDetails.id}.pdf`);
    return { success: true };
  } catch (err) {
    console.error("Failed to generate PDF:", err.message);
    return { success: false, error: err.message };
  }
};

export const generateProductPDF = async (products, brandingData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const logoBase64 = await toBase64(brandingData.logo_url);

    const totalProducts = products.length;
    const totalQuantity = products.reduce(
      (sum, p) => sum + (p.quantity || 0),
      0
    );
    const totalValue = products.reduce(
      (sum, p) => sum + (p.quantity || 0) * (p.price || 0),
      0
    );
    const availableCount = products.filter(
      (p) => p.status === "Available"
    ).length;
    const unavailableCount = products.filter(
      (p) => p.status === "Unavailable"
    ).length;

    const tableColumn = [
      "ID",
      "Name",
      "Category",
      "Quantity",
      "Price",
      "Expiry",
      "Status",
    ];
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
      doc.text("Product Inventory Report", pageWidth - 14, 20, {
        align: "right",
      });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Exported on: ${exportDateTime}`, pageWidth - 14, 25, {
        align: "right",
      });
      doc.setDrawColor(224, 224, 224);
      doc.line(14, 38, pageWidth - 14, 38);
      autoTable(doc, {
        body: [
          ["Total Products:", totalProducts],
          ["Total Quantity:", totalQuantity],
          ["Estimated Total Value:", `PHP ${totalValue.toFixed(2)}`],
          [
            "Available / Unavailable:",
            `${availableCount} / ${unavailableCount}`,
          ],
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
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 }, // ID
        1: { cellWidth: 45 }, // Name
        2: { cellWidth: 30 }, // Category
        3: { cellWidth: 18, halign: "center" }, // Quantity
        4: { cellWidth: 22, halign: "right" }, // Price
        5: { cellWidth: 25 }, // Expiry
        6: { cellWidth: 25 }, // Status
      },
      margin: { top: 40 },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          drawHeaderAndSummary();
        }
        doc.setFontSize(8);
        doc.setTextColor(150);
        const footerText = `Page ${
          data.pageNumber
        } of ${doc.internal.getNumberOfPages()}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
      },
    });

    doc.save(
      `${brandingData.name}_Product_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
    return { success: true };
  } catch (err) {
    console.error("Failed to generate PDF:", err.message);
    return { success: false, error: err.message };
  }
};
