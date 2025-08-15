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
    const currencyPrefix = "PHP "; // Use text prefix for guaranteed compatibility

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
        `${currencyPrefix}${(item.price_at_sale || item.price).toFixed(2)}`,
        `${currencyPrefix}${(
          item.quantity * (item.price_at_sale || item.price)
        ).toFixed(2)}`,
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
      doc.text(
        `${currencyPrefix}${subtotal.toFixed(2)}`,
        pageWidth - 14,
        finalY,
        {
          align: "right",
        }
      );
      doc.text("Discount (20%):", 14, finalY + 5);
      doc.text(
        `- ${currencyPrefix}${discount.toFixed(2)}`,
        pageWidth - 14,
        finalY + 5,
        {
          align: "right",
        }
      );
    }
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 14, finalY + 10);
    doc.text(
      `${currencyPrefix}${saleDetails.total_amount.toFixed(2)}`,
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
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currencyPrefix = "PHP ";

    // --- REPORT DATA PREPARATION ---
    const totalProducts = products.length;
    const totalQuantity = products.reduce(
      (sum, p) => sum + (p.quantity || 0),
      0
    );
    const totalValue = products.reduce(
      (sum, p) => sum + (p.quantity || 0) * (p.cost_price || 0),
      0
    );
    const availableCount = products.filter(
      (p) => p.status === "Available"
    ).length;

    // --- TABLE DEFINITION ---
    const tableColumn = [
      "ID",
      "Name",
      "Category",
      "Supplier",
      "Stock",
      "Cost Price",
      "Expiry",
    ];
    const tableRows = products.map((p) => [
      p.medicineId || "N/A",
      p.name || "N/A",
      p.category || "N/A",
      p.supplier || "N/A",
      p.quantity,
      `${currencyPrefix}${p.cost_price ? p.cost_price.toFixed(2) : "0.00"}`,
      p.expireDate || "N/A",
    ]);

    // --- REUSABLE HEADER & FOOTER LOGIC ---
    const addHeader = () => {
      doc.addImage(logoBase64, "PNG", 15, 12, 18, 18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(33, 37, 41);
      doc.text(brandingData.name, 38, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text("Product Inventory Report", pageWidth - 15, 20, {
        align: "right",
      });
      doc.text(`Generated on: ${reportDate}`, pageWidth - 15, 26, {
        align: "right",
      });
    };

    const addFooter = (pageNumber, pageCount) => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    };

    // --- PDF GENERATION ---
    addHeader();

    // --- SUMMARY SECTION ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Inventory Summary", 15, 45);
    doc.setDrawColor(222, 226, 230);
    doc.line(15, 47, pageWidth - 15, 47);

    autoTable(doc, {
      body: [
        ["Total Unique Products:", totalProducts.toString()],
        ["Total Units in Stock:", totalQuantity.toString()],
        ["Total Inventory Cost:", `${currencyPrefix}${totalValue.toFixed(2)}`],
        ["Products Available:", availableCount.toString()],
      ],
      startY: 50,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", textColor: 49, cellWidth: 60 },
        1: { textColor: 85 },
      },
    });

    // --- MAIN TABLE ---
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: doc.lastAutoTable.finalY + 10,
      theme: "striped",
      headStyles: {
        fillColor: [40, 52, 71],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: {
        4: { halign: "center" },
        5: { halign: "right" },
      },
      didDrawPage: (data) => {
        // Only add header on subsequent pages, as page 1 is handled manually.
        if (data.pageNumber > 1) {
          addHeader();
        }
      },
      // Set top margin for the first page
      margin: { top: 40 },
    });

    // --- FINAL FOOTER ON ALL PAGES ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter(i, pageCount);
    }

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
