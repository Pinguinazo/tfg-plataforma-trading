import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const printInvoices = (transactionsArray, globalUser, rate, sym) => {
  if (!transactionsArray || transactionsArray.length === 0) return;

  const userName = globalUser?.username || 'Trader Anónimo';
  const fechaEmision = new Date().toLocaleString();

  const doc = new jsPDF();

  const brandColor = [30, 58, 138]; 
  const textColor = [100, 116, 139]; 

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.text('TradingPulse Trading S.L.', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text('Plataforma de Simulación Institucional', 14, 26);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('JUSTIFICANTE TRANSACCIONES', 196, 26, { align: 'right' });

  doc.setDrawColor(...brandColor);
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Datos del Cliente:', 14, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${userName}`, 14, 46);
  doc.text(`ID Interno: ${globalUser?.id || globalUser?.user_id || 'N/A'}`, 14, 52);

  doc.setFont('helvetica', 'bold');
  doc.text('Detalles de Emisión:', 196, 40, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${fechaEmision}`, 196, 46, { align: 'right' });
  doc.text(`Nº Operaciones: ${transactionsArray.length}`, 196, 52, { align: 'right' });

  const tableColumn = ["Fecha y Hora", "Tipo", "Activo", "Volumen", "Precio Ud.", "Subtotal"];
  const tableRows = [];
  let grandTotal = 0;

  const formatTxDate = (tx) => {
    let val = tx.created_at || tx.timestamp || tx.date || tx.time || tx.fecha || tx.tx_date;
    if (!val) return 'Fecha desconocida';

    if (typeof val === 'string' && val.length >= 18) {
      try {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setBigUint64(0, BigInt(val), false);
        const floatDate = view.getFloat64(0, false);
        if (floatDate > 1500000000000 && floatDate < 2000000000000) {
          return new Date(floatDate).toLocaleString();
        }
      } catch (e) {}
    }
    
    if (val instanceof Date) return val.toLocaleString();
    let d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    d = new Date(Number(val));
    if (!isNaN(d.getTime())) return d.toLocaleString();
    d = new Date(Number(val) * 1000);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    
    return 'Fecha desconocida';
  };

  transactionsArray.forEach(tx => {
    const tipo = tx.type === 'BUY' ? 'COMPRA' : 'VENTA';
    const totalTx = (tx.amount * tx.price) * rate;
    grandTotal += totalTx;
    
    const precioUnidad = (tx.price * rate).toFixed(4);
    const txFecha = formatTxDate(tx);

    tableRows.push([
      txFecha,
      tipo,
      tx.ticker,
      tx.amount.toLocaleString(),
      `${precioUnidad}${sym}`,
      `${totalTx.toFixed(2)}${sym}`
    ]);
  });

  tableRows.push([
    { content: 'Importe Total Consolidado:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
    { content: `${grandTotal.toFixed(2)}${sym}`, styles: { fontStyle: 'bold', textColor: brandColor } }
  ]);

  autoTable(doc, {
    startY: 65,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: brandColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      1: { fontStyle: 'bold' },
      5: { halign: 'right', fontStyle: 'bold' } 
    }
  });

  const finalY = doc.lastAutoTable.finalY || 80;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Documento mercantil generado automáticamente por TradingPulse. Válido como justificante de simulación de mercado.', 105, finalY + 20, { align: 'center' });
  doc.text(`© ${new Date().getFullYear()} TradingPulse Inc. Todos los derechos reservados.`, 105, finalY + 25, { align: 'center' });

  doc.save(`Justificante_Mercado_${Date.now()}.pdf`);
};