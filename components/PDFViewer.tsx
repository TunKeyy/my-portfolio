import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
  file: string
}

export function PDFViewer({ file }: PDFViewerProps) {
  return (
    <div style={{ height: '700px', overflow: 'auto' }}>
          <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
            <Viewer fileUrl={file} />
          </Worker>
        </div>
  )
}