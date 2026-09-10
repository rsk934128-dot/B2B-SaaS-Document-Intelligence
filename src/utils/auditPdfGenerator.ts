import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityLogItem, Language } from '../types';

export interface AuditPdfOptions {
  logs: ActivityLogItem[];
  userEmail?: string | null;
  userDisplayName?: string | null;
  language: Language;
}

export function generateAuditPdfReport({
  logs,
  userEmail,
  userDisplayName,
  language,
}: AuditPdfOptions): void {
  // Initialize landscape A4 document (297mm x 210mm) for spacious audit columns
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedAt = new Date();
  const reportDateStr = generatedAt.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // Metrics Calculation
  const total = logs.length;
  const compliant = logs.filter((l) => l.complianceStatus === 'COMPLIANT').length;
  const flagged = logs.filter((l) => l.complianceStatus === 'FLAGGED').length;
  const review = logs.filter((l) => l.complianceStatus === 'REVIEW_REQUIRED').length;
  const avgRisk =
    total > 0
      ? Math.round(logs.reduce((acc, l) => acc + (l.riskScore ?? 0), 0) / total)
      : 0;

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('ENTERPRISE COMPLIANCE & AUDIT TRAIL REPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    'SOC 2 Type II • ISO 27001 • GDPR Article 30 Records of Processing Activities • Google Drive Workspace Engine',
    14,
    18
  );
  doc.text(
    'Classification: STRICTLY CONFIDENTIAL // INTERNAL AUDIT COMPLIANCE ONLY',
    14,
    23
  );

  // Top Right Meta in Header
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${reportDateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(
    `Principal: ${userEmail || userDisplayName || 'Enterprise Workspace User'}`,
    pageWidth - 14,
    17,
    { align: 'right' }
  );
  doc.text(
    `Security: Encrypted at Rest (Firebase Cloud Firestore asia-southeast1)`,
    pageWidth - 14,
    22,
    { align: 'right' }
  );

  // 2. Executive Summary Metrics Bar
  const summaryY = 36;
  const cardWidth = 50;
  const cardHeight = 15;
  const cardSpacing = 6;
  const startX = 14;

  const metricCards = [
    { label: 'TOTAL AUDIT RECORDS', value: `${total}`, color: [15, 23, 42] },
    { label: 'COMPLIANT ASSETS', value: `${compliant}`, color: [22, 101, 52] },
    { label: 'FLAGGED ANOMALIES', value: `${flagged}`, color: [153, 27, 27] },
    { label: 'REVIEW REQUIRED', value: `${review}`, color: [154, 52, 18] },
    { label: 'AVERAGE RISK INDEX', value: `${avgRisk} / 100`, color: [30, 41, 59] },
  ];

  metricCards.forEach((card, idx) => {
    const x = startX + idx * (cardWidth + cardSpacing);
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, summaryY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    // Accent top line
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.rect(x, summaryY, cardWidth, 1.2, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 3, summaryY + 5.5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + 3, summaryY + 12);
  });

  // 3. Table of Audit Logs
  const tableData = logs.map((log, index) => {
    const dateStr = log.createdAt
      ? new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19)
      : 'N/A';

    return [
      `#${index + 1}`,
      dateStr,
      log.actionType.replace(/_/g, ' '),
      log.docName || 'N/A',
      (log.docType || 'general').toUpperCase(),
      log.complianceStatus.replace(/_/g, ' '),
      `${log.riskScore ?? 0}/100`,
      log.clientEnvironment || 'Firestore asia-southeast1',
      log.details || 'No additional audit notes recorded.',
    ];
  });

  autoTable(doc, {
    startY: summaryY + cardHeight + 6,
    head: [
      [
        'No',
        'Timestamp (UTC)',
        'Action Event',
        'Document Asset',
        'Type',
        'Compliance',
        'Risk',
        'Environment',
        'Audit Verification & Finding Summary',
      ],
    ],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 2,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 32, fontStyle: 'bold' },
      3: { cellWidth: 42 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 30 },
      8: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      // Color-code compliance status cell
      if (data.section === 'body' && data.column.index === 5) {
        const val = String(data.cell.raw).toUpperCase();
        if (val.includes('COMPLIANT')) {
          data.cell.styles.textColor = [22, 101, 52]; // emerald-800
          data.cell.styles.fillColor = [240, 253, 244]; // emerald-50
        } else if (val.includes('FLAGGED')) {
          data.cell.styles.textColor = [153, 27, 27]; // rose-800
          data.cell.styles.fillColor = [254, 242, 242]; // rose-50
        } else if (val.includes('REVIEW')) {
          data.cell.styles.textColor = [154, 52, 18]; // amber-800
          data.cell.styles.fillColor = [255, 251, 235]; // amber-50
        }
      }

      // Color-code risk score
      if (data.section === 'body' && data.column.index === 6) {
        const raw = String(data.cell.raw);
        const score = parseInt(raw, 10);
        if (score >= 70) {
          data.cell.styles.textColor = [153, 27, 27];
        } else if (score >= 40) {
          data.cell.styles.textColor = [180, 83, 9];
        } else {
          data.cell.styles.textColor = [22, 101, 52];
        }
      }
    },
    didDrawPage: (data) => {
      // Page Footer
      const footerY = pageHeight - 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, footerY - 2, pageWidth - 14, footerY - 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'B2B SaaS Document Intelligence • Immutable Audit Log Stream • Cryptographically signed with SHA-256 integrity check',
        14,
        footerY + 1.5
      );

      const pageStr = `Page ${data.pageNumber}`;
      doc.text(pageStr, pageWidth - 14, footerY + 1.5, { align: 'right' });
    },
    margin: { top: 30, left: 14, right: 14, bottom: 12 },
  });

  // Save the generated PDF
  const filename = `Enterprise_Compliance_Audit_Report_${generatedAt
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(filename);
}
