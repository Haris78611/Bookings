import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { PageHeader } from '../../components/AdminUI';
import { Button, Card } from '../../components/UI';
import { Booking, Agent } from '../../types';
import { VoucherTemplate } from '../../components/VoucherTemplate';


const VoucherPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const { bookings, agencies } = useAppContext();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const booking = bookings.find(b => b.id === bookingId);
    const agent = booking?.agencyId ? agencies.find(a => a.id === booking.agencyId) : null;

    const handleDownloadVoucher = async () => {
        if (!booking) return;
        const input = document.getElementById(`voucher-template-${booking.id}`);
        if (!input) {
            console.error("Voucher template element not found.");
            return;
        }

        setIsGeneratingPdf(true);
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const canvas = await (window as any).html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = (window as any).jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Voucher_${booking.id}.pdf`);
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Error generating PDF voucher. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    if (!booking) {
        return (
            <>
                <PageHeader title="Voucher Not Found">
                    <Link to="/admin/bookings" className="text-sm font-bold text-primary hover:underline">&larr; Back to Bookings</Link>
                </PageHeader>
                <Card className="p-12 text-center">
                    <p className="text-red-500 font-bold">The booking with ID "{bookingId}" could not be found in the registry.</p>
                </Card>
            </>
        );
    }

    return (
        <>
            <PageHeader title={`Voucher: ${booking.id}`}>
                <div className="print-hide">
                    <div className="flex items-center gap-3">
                        <Button onClick={() => window.print()} variant="primary" className="!rounded-lg">Print</Button>
                        <Button onClick={handleDownloadVoucher} disabled={isGeneratingPdf} variant="secondary" className="!rounded-lg">
                            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                        </Button>
                        <Link to="/admin/bookings" className="text-sm font-bold text-primary hover:underline">&larr; Back to Bookings</Link>
                    </div>
                </div>
            </PageHeader>
            <div className="animate-in fade-in duration-500 voucher-container">
                <VoucherTemplate booking={booking} agent={agent} id={`voucher-template-${booking.id}`} />
            </div>

            <style>{`
                @media print {
                    body > #root > div, body > #root > div > main > div > div:first-child { 
                        display: none !important;
                    }
                    .print-hide {
                        display: none !important;
                    }
                    body > #root > div > main > div > .voucher-container {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    #root, main, .animate-in {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    #voucher-template-${booking.id} {
                        box-shadow: none !important;
                        border: none !important;
                        max-width: 100% !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </>
    );
};

export default VoucherPage;
