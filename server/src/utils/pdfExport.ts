import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateFleetSummaryPDF(
  res: Response,
  data: {
    kpis: any;
    roi: any[];
    costs: any[];
    fuelEfficiency: any[];
  },
): void {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="transitops-fleet-summary.pdf"');
  doc.pipe(res);

  const { kpis, roi, costs, fuelEfficiency } = data;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.fontSize(22).fillColor('#1a56db').text('TransitOps — Fleet Summary Report', { align: 'center' });
  doc.fontSize(10).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
  doc.moveDown(1.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(1);

  // ── Section 1: Fleet KPIs ─────────────────────────────────────────────────
  doc.fontSize(14).fillColor('#111827').text('1. Fleet KPIs', { underline: true });
  doc.moveDown(0.5);

  const kpiRows = [
    ['Total Vehicles',       kpis.totalVehicles],
    ['Available',            kpis.availableVehicles],
    ['On Trip',              kpis.onTripVehicles],
    ['In Shop (Maintenance)', kpis.inShopVehicles],
    ['Retired',              kpis.retiredVehicles],
    ['Fleet Utilisation',    `${kpis.fleetUtilization}%`],
    ['Active Trips',         kpis.activeTrips],
    ['Pending (Draft) Trips', kpis.pendingTrips],
    ['Drivers on Duty',      kpis.driversOnDuty],
    ['Total Drivers',        kpis.totalDrivers],
    ['Licences Expiring (30d)', kpis.expiring30Days],
    ['Suspended Drivers',    kpis.suspendedDrivers],
  ];

  doc.fontSize(10).fillColor('#374151');
  kpiRows.forEach(([label, value]) => {
    doc.text(`${label}:`, { continued: true, width: 250 }).fillColor('#1a56db').text(` ${value}`, { align: 'left' });
    doc.fillColor('#374151');
  });

  doc.moveDown(1.5);

  // ── Section 2: Vehicle ROI ────────────────────────────────────────────────
  doc.fontSize(14).fillColor('#111827').text('2. Vehicle ROI', { underline: true });
  doc.moveDown(0.5);

  if (roi.length === 0) {
    doc.fontSize(10).fillColor('#6b7280').text('No completed trip revenue data available yet.');
  } else {
    // Table header
    doc.fontSize(9).fillColor('#6b7280');
    doc.text('Vehicle', 50, doc.y, { width: 120 });
    doc.text('Revenue', 170, doc.y - doc.currentLineHeight(), { width: 90 });
    doc.text('Costs', 260, doc.y - doc.currentLineHeight(), { width: 90 });
    doc.text('Acquisition', 350, doc.y - doc.currentLineHeight(), { width: 90 });
    doc.text('ROI %', 440, doc.y - doc.currentLineHeight(), { width: 60 });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d1d5db').stroke();
    doc.moveDown(0.3);

    roi.slice(0, 8).forEach((r) => {
      const roiColor = r.roi >= 0 ? '#059669' : '#dc2626';
      doc.fontSize(9).fillColor('#111827');
      doc.text(`${r.vehicleName} (${r.regNumber})`, 50, doc.y, { width: 120 });
      doc.text(`₹${r.totalRevenue.toLocaleString()}`, 170, doc.y - doc.currentLineHeight(), { width: 90 });
      doc.text(`₹${r.totalCost.toLocaleString()}`,   260, doc.y - doc.currentLineHeight(), { width: 90 });
      doc.text(`₹${r.acquisitionCost.toLocaleString()}`, 350, doc.y - doc.currentLineHeight(), { width: 90 });
      doc.fillColor(roiColor).text(`${r.roi.toFixed(2)}%`, 440, doc.y - doc.currentLineHeight(), { width: 60 });
      doc.fillColor('#111827');
      doc.moveDown(0.2);
    });
  }

  doc.moveDown(1.5);

  // ── Section 3: Top 3 Fuel Efficiency ─────────────────────────────────────
  doc.fontSize(14).fillColor('#111827').text('3. Top Fuel Efficiency', { underline: true });
  doc.moveDown(0.5);

  if (fuelEfficiency.length === 0) {
    doc.fontSize(10).fillColor('#6b7280').text('No fuel log data available yet.');
  } else {
    fuelEfficiency.slice(0, 3).forEach((v, i) => {
      doc.fontSize(10).fillColor('#374151').text(
        `${i + 1}. ${v.vehicleName} (${v.regNumber}) — ${v.efficiencyKmPerLitre} km/L  ` +
        `(${v.totalDistanceKm} km / ${v.totalLitres} L)`,
      );
    });
  }

  // ── Footer on all pages ───────────────────────────────────────────────────
  const pageCount = (doc as any).bufferedPageRange?.()?.count ?? 1;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage?.(i);
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('TransitOps — Confidential', 50, 780, { align: 'center', width: 495 });
  }

  doc.end();
}
