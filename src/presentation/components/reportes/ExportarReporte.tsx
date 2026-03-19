'use client'
import { Button } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'

export function ExportarReporte() {
    return (
        <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            className="no-print"
            size="small"
        >
            Imprimir reporte
        </Button>
    )
}
