import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages after cover/first)
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, "Apex Horizon National Bank — Technical Project Report")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 40, 8.5 * 72 - 54, 11 * 72 - 40)
            
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 30, page_str)
        self.drawString(54, 30, "CONFIDENTIAL & PROPRIETARY — SYSTEM SPECIFICATION")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 40, 8.5 * 72 - 54, 40)
        self.restoreState()

def generate_pdf():
    pdf_path = r"c:\mini project\project_detailed_report.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom color palette
    c_navy = colors.HexColor("#0b192c")
    c_blue = colors.HexColor("#1e3a5f")
    c_slate = colors.HexColor("#334155")
    c_light = colors.HexColor("#f8fafc")
    c_emerald = colors.HexColor("#166534")

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.white
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#cbd5e1")
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#94a3b8")
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_navy,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_blue,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_slate,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_slate,
        leftIndent=15,
        spaceAfter=3
    )

    table_header_style = ParagraphStyle(
        'THStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    table_cell_style = ParagraphStyle(
        'TCStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=c_slate
    )

    pass_badge_style = ParagraphStyle(
        'PassBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=c_emerald
    )

    story = []

    # ================= HEADER BANNER =================
    header_content = [
        [Paragraph("APEX HORIZON NATIONAL BANK", title_style)],
        [Spacer(1, 4)],
        [Paragraph("Online Banking Simulator & Administrative Supervisory System — Technical Architecture Report", subtitle_style)],
        [Spacer(1, 6)],
        [Paragraph("Version: 3.4.2-SECURE &nbsp;|&nbsp; Host: localhost:3000 &nbsp;|&nbsp; Verified Build: Production Ready", meta_style)]
    ]
    header_table = Table(header_content, colWidths=[504])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_navy),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 14))

    # ================= 1. EXECUTIVE SUMMARY =================
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))
    story.append(Paragraph(
        "The <b>Apex Horizon Online Banking Simulator</b> is an authentic, full-featured retail banking web application crafted to replicate modern Tier-1 financial institutions (e.g., JPMorgan Chase, Citibank, and Bank of America).",
        body_style
    ))
    story.append(Paragraph("The platform provides a complete banking lifecycle across two distinct user roles:", body_style))
    story.append(Paragraph("&bull; <b>Customer Self-Service:</b> Online account opening/onboarding, multi-account ledger balances (Premier Checking and High-Yield Savings), Fedwire/ACH funds transfers with real-time balance settlement, transaction statements with search/filter/CSV export, and customer service requests (Credit Cards and Chequebooks).", bullet_style))
    story.append(Paragraph("&bull; <b>Bank Administration / Officer Console:</b> Central bank liquidity & vault oversight, patron user directory management with compliance account masking, and an interactive approval queue with Approve, Decline, and Delete capabilities.", bullet_style))
    story.append(Paragraph("&bull; <b>Security & Compliance:</b> 256-Bit TLS simulation, dynamic 5-minute inactivity session expiration with countdown timer, anti-fraud notifications, GLBA data masking, and FDIC regulatory disclosures.", bullet_style))

    story.append(Spacer(1, 10))

    # ================= 2. TECHNOLOGY STACK =================
    story.append(Paragraph("2. Technology Stack & Architectural Design", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))
    
    story.append(Paragraph("2.1 Front-End Layer", h2_style))
    story.append(Paragraph("&bull; <b>HTML5:</b> Semantic architecture using native landmarks (<code>header</code>, <code>nav</code>, <code>aside</code>, <code>main</code>, <code>section</code>, <code>footer</code>) with ARIA compliance.", bullet_style))
    story.append(Paragraph("&bull; <b>Tailwind CSS & Bespoke Tokens:</b> Curated executive palette featuring Bank Navy (<code>#0b192c</code>, <code>#060f1c</code>), Steel Blues (<code>#1e4f79</code>, <code>#286496</code>), and status colors (Emerald <code>#10b981</code>, Gold <code>#c5a059</code>, Crimson <code>#ef4444</code>).", bullet_style))
    story.append(Paragraph("&bull; <b>Typography:</b> Google Fonts <i>Plus Jakarta Sans</i> for modern UI readability and <i>JetBrains Mono</i> for tabular numbers and balances.", bullet_style))
    story.append(Paragraph("&bull; <b>Iconography:</b> Lucide Icons dynamic vector engine.", bullet_style))

    story.append(Paragraph("2.2 Single Page Application (SPA) Engine", h2_style))
    story.append(Paragraph("&bull; <b>Client-Side Routing:</b> Zero-reload dynamic DOM view manipulation switching seamlessly between Login, Customer Dashboard, and Admin Console.", bullet_style))
    story.append(Paragraph("&bull; <b>Sub-Page Isolation:</b> Dedicated view isolation ensuring Customer subpages and Admin subpages never collide or leak into adjacent portals.", bullet_style))
    story.append(Paragraph("&bull; <b>Cross-Tab Synchronizer:</b> Window <code>storage</code> event listener providing instant, bidirectional real-time synchronization between concurrent browser tabs.", bullet_style))

    story.append(Paragraph("2.3 Mock Backend & Data Persistence", h2_style))
    story.append(Paragraph("&bull; <b>Storage Engine:</b> Browser <code>localStorage</code> functioning as an atomic JSON document store under key <code>apex_horizon_bank_v1</code>.", bullet_style))
    story.append(Paragraph("&bull; <b>Relational Integrity:</b> Automatic linkage between User IDs, debit/credit transactions, and service request filings.", bullet_style))
    story.append(Paragraph("&bull; <b>Bilateral Clearing Simulation:</b> Transfers between registered patrons automatically identify the recipient account, crediting their balance while debiting the sender.", bullet_style))

    story.append(PageBreak())

    # ================= 3. CORE FUNCTIONAL MODULES =================
    story.append(Paragraph("3. Core Functional Modules", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))

    story.append(Paragraph("3.1 Authentication & Onboarding Portal", h2_style))
    story.append(Paragraph("&bull; <b>Dual-Mode Access Control:</b> Seamless toggle tabs between Customer Portal and Bank Officer / Admin Portal with role validation.", bullet_style))
    story.append(Paragraph("&bull; <b>Self-Service Account Creation:</b> Direct online enrollment creating Checking (<code>100XXXXXXX</code>) and High-Yield Savings (<code>200XXXXXXX</code>) accounts with initial deposits.", bullet_style))
    story.append(Paragraph("&bull; <b>Credentials Assistance:</b> Quick Demo Fillers (<code>jane / 1234</code>, <code>admin / admin</code>), show/hide password toggle, and Forgot Password recovery guidance.", bullet_style))

    story.append(Paragraph("3.2 Customer Banking Experience", h2_style))
    story.append(Paragraph("&bull; <b>Account Overview:</b> Real-time balances for Premier Checking, High-Yield Growth Savings (4.85% APY), and combined net liquid portfolio with credit score indicators.", bullet_style))
    story.append(Paragraph("&bull; <b>Funds Transfer Module (ACH & Fedwire):</b> Source account selector, beneficiary routing verification (9-digit ABA), purpose classification, and strict balance validation.", bullet_style))
    story.append(Paragraph("&bull; <b>Self-Account Transfer:</b> Instant modal to move funds between personal Checking and Savings accounts.", bullet_style))
    story.append(Paragraph("&bull; <b>Ledger & Statement Export:</b> Chronological transaction records with dynamic search, account filter, type filter (Debit/Credit), sorting, and instant CSV statement download.", bullet_style))
    story.append(Paragraph("&bull; <b>Service Requests:</b> Tiered Credit Card applications and MICR chequebook leaf orders with live status tracking and cancellation capabilities.", bullet_style))

    story.append(Paragraph("3.3 Bank Administration Console", h2_style))
    story.append(Paragraph("&bull; <b>Central Vault & Liquidity Monitor:</b> Supervisory metrics tracking active depositors, total liquidity, pending compliance reviews, and global network transaction stream.", bullet_style))
    story.append(Paragraph("&bull; <b>User Directory Management:</b> Roster of all registered customers with masked account details (<code>•••• •••• 4891</code>), balance breakdowns, full patron audit modals, and manual patron onboarding.", bullet_style))
    story.append(Paragraph("&bull; <b>Approval Queue:</b> Complete administrative triage permitting officers to <b>Approve</b>, <b>Decline</b>, or permanently <b>Delete/Purge</b> filings.", bullet_style))

    story.append(Spacer(1, 10))

    # ================= 4. DATABASE SCHEMA =================
    story.append(Paragraph("4. Database Schema Specification (LocalStorage)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))

    schema_data = [
        [Paragraph("Entity", table_header_style), Paragraph("Attribute", table_header_style), Paragraph("Type", table_header_style), Paragraph("Description", table_header_style)],
        [Paragraph("User", table_header_style), Paragraph("id", table_cell_style), Paragraph("String (PK)", table_cell_style), Paragraph("Unique patron identifier (e.g. usr_001)", table_cell_style)],
        ["", Paragraph("username / password", table_cell_style), Paragraph("String", table_cell_style), Paragraph("Authentication credentials", table_cell_style)],
        ["", Paragraph("checkingAcc / savingsAcc", table_cell_style), Paragraph("String", table_cell_style), Paragraph("10-digit account identifiers", table_cell_style)],
        ["", Paragraph("checkingBalance / savingsBalance", table_cell_style), Paragraph("Number", table_cell_style), Paragraph("Cleared liquid account balances", table_cell_style)],
        [Paragraph("Transaction", table_header_style), Paragraph("id", table_cell_style), Paragraph("String (PK)", table_cell_style), Paragraph("Unique transaction tracking ID (e.g. TXN-894101)", table_cell_style)],
        ["", Paragraph("userId / accountType", table_cell_style), Paragraph("String (FK)", table_cell_style), Paragraph("Owner binding and account classification", table_cell_style)],
        ["", Paragraph("amount / balanceAfter", table_cell_style), Paragraph("Number", table_cell_style), Paragraph("Monetary amount and post-settlement balance", table_cell_style)],
        ["", Paragraph("type / status", table_cell_style), Paragraph("String", table_cell_style), Paragraph("credit / debit flag and settlement state", table_cell_style)],
        [Paragraph("ServiceRequest", table_header_style), Paragraph("id", table_cell_style), Paragraph("String (PK)", table_cell_style), Paragraph("Filing identifier (e.g. REQ-1049)", table_cell_style)],
        ["", Paragraph("serviceType / details", table_cell_style), Paragraph("String", table_cell_style), Paragraph("Card tier or Chequebook specifications", table_cell_style)],
        ["", Paragraph("status", table_cell_style), Paragraph("String", table_cell_style), Paragraph("pending | approved | rejected", table_cell_style)]
    ]
    schema_table = Table(schema_data, colWidths=[90, 130, 90, 194])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(schema_table)

    story.append(PageBreak())

    # ================= 5. TEST MATRIX =================
    story.append(Paragraph("5. Test Execution Matrix", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))

    test_data = [
        [Paragraph("Test ID", table_header_style), Paragraph("Scenario & Scope", table_header_style), Paragraph("Execution Verification Criteria", table_header_style), Paragraph("Result", table_header_style)],
        [Paragraph("TC-01", table_cell_style), Paragraph("Dual Portal Switching", table_cell_style), Paragraph("Switch between Customer & Admin portals; inputs & titles adapt", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-02", table_cell_style), Paragraph("Customer Authentication", table_cell_style), Paragraph("Sign in as jane / 1234; routes directly to Customer Overview", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-03", table_cell_style), Paragraph("Overdraft Prevention", table_cell_style), Paragraph("Attempt transfer exceeding balance; blocked with alert toast", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-04", table_cell_style), Paragraph("ACH / Wire Transfer", table_cell_style), Paragraph("Transfer $250; balance drops, debit entry added to ledger", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-05", table_cell_style), Paragraph("Inter-User Clearing", table_cell_style), Paragraph("Send funds to peer; credits beneficiary account in real-time", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-06", table_cell_style), Paragraph("Self-Account Transfer", table_cell_style), Paragraph("Move $500 between Checking & Savings via modal", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-07", table_cell_style), Paragraph("Ledger Filtering & Search", table_cell_style), Paragraph("Filter by type and query string; responsive table updates", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-08", table_cell_style), Paragraph("Statement CSV Export", table_cell_style), Paragraph("Click export statement; downloads populated .csv file", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-09", table_cell_style), Paragraph("Product Applications", table_cell_style), Paragraph("Submit Credit Card & Chequebook requests; shows Pending", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-10", table_cell_style), Paragraph("Admin Approvals", table_cell_style), Paragraph("Admin clicks Approve / Decline; updates badges and tables", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-11", table_cell_style), Paragraph("Request Deletion", table_cell_style), Paragraph("Customer cancels filing; admin deletes record via trash icon", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-12", table_cell_style), Paragraph("Cross-Tab Sync", table_cell_style), Paragraph("Admin updates status in Tab A; Tab B reflects immediately", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-13", table_cell_style), Paragraph("Online Self-Registration", table_cell_style), Paragraph("Open account online; creates accounts & opens dashboard", table_cell_style), Paragraph("PASS", pass_badge_style)],
        [Paragraph("TC-14", table_cell_style), Paragraph("Database Demo Reset", table_cell_style), Paragraph("Click Reset DB; cleans state and restores factory seed data", table_cell_style), Paragraph("PASS", pass_badge_style)]
    ]
    test_table = Table(test_data, colWidths=[45, 140, 269, 50])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(test_table)

    story.append(Spacer(1, 12))

    # ================= 6. ROADMAP & CONCLUSION =================
    story.append(Paragraph("6. Production Roadmap & Conclusion", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))
    story.append(Paragraph(
        "The <b>Apex Horizon Online Banking Simulator</b> successfully delivers an enterprise-grade retail banking simulation meeting all functional, aesthetic, and architectural requirements.",
        body_style
    ))
    story.append(Paragraph("<b>Recommended Enterprise Extensions:</b>", body_style))
    story.append(Paragraph("1. <b>Backend REST/GraphQL Microservices:</b> Migrate from client-side <code>localStorage</code> to a Node.js/Express, Python/FastAPI, or Java Spring Boot backend paired with PostgreSQL.", bullet_style))
    story.append(Paragraph("2. <b>Cryptographic Security:</b> Introduce salted BCrypt password hashing and JWT/OAuth2 bearer token session authorization.", bullet_style))
    story.append(Paragraph("3. <b>Third-Party Financial Integrations:</b> Connect Plaid or Stripe Treasury sandbox APIs for simulated external bank linking and merchant settlement.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generated successfully:", pdf_path)

if __name__ == "__main__":
    generate_pdf()
