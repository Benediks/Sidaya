// types/jspdf-autotable.d.ts
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: { [key: number]: any };
    styles?: {
      fontSize?: number;
      cellPadding?: number;
      overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
      cellWidth?: 'auto' | 'wrap' | number;
      minCellHeight?: number;
      halign?: 'left' | 'center' | 'right' | 'justify';
      valign?: 'top' | 'middle' | 'bottom';
      fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
      lineColor?: number | number[];
      lineWidth?: number | { top?: number; right?: number; bottom?: number; left?: number };
      fillColor?: number | number[] | false;
      textColor?: number | number[];
    };
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;

  export interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}