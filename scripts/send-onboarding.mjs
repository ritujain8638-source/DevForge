import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Manually parse .env.local to load SMTP settings
const envPath = path.join(__dirname, '../.env.local');
const envConfig = {};
if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] ? match[2].trim() : '';
            // Remove wrapping quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }
            envConfig[match[1]] = value;
        }
    });
}

const smtpHost = envConfig.SMTP_HOST || 'smtp.purelymail.com';
const smtpPort = parseInt(envConfig.SMTP_PORT || '465', 10);
const smtpUser = envConfig.SMTP_USER;
const smtpPass = envConfig.SMTP_PASS;
const smtpFrom = envConfig.SMTP_FROM || 'DevForge <contact@devforge.club>';

if (!smtpUser || !smtpPass) {
    console.error("Error: SMTP_USER and SMTP_PASS must be configured in .env.local");
    process.exit(1);
}

// Get filter arg (e.g. "shubham", "all")
const filterArg = process.argv[2] ? process.argv[2].toLowerCase() : null;
if (!filterArg) {
    console.log("Usage: node scripts/send-onboarding.mjs <all | name-filter>");
    console.log("Example: node scripts/send-onboarding.mjs shubham");
    process.exit(0);
}

// 2. Define Executive Council Members & Mentors
const recipients = [
    {
        name: "Geetansh Goyal",
        role: "President",
        officialEmail: "geetansh@devforge.club",
        tempPassword: "G!WcL^5@=@DcJM",
        personalEmail: "2102508748@svyasa-sas.edu.in",
        responsibilities: "leading the club, representing DevForge before NST and external organizations, setting annual goals and initiatives, making strategic decisions, and ensuring collaboration between all teams."
    },
    {
        name: "Vikas Sharma",
        role: "Vice President",
        officialEmail: "vikas@devforge.club",
        tempPassword: "9eseyaL18LD!+V",
        personalEmail: "2102508823@svyasa-sas.edu.in",
        responsibilities: "coordinating committees, monitoring ongoing initiatives, acting on behalf of the President when required, and supporting strategic planning."
    },
    {
        name: "Dhruv Mehta",
        role: "General Secretary",
        officialEmail: "dhruv@devforge.club",
        tempPassword: "P=R1ZeKXW1ts!0",
        personalEmail: "2102508741@svyasa-sas.edu.in",
        responsibilities: "recording meeting minutes, maintaining club documentation, managing internal communication, and tracking decisions and action items."
    },
    {
        name: "Bhavesh Sharma",
        role: "Treasurer",
        officialEmail: "bhavesh@devforge.club",
        tempPassword: "B=yGXNRHKN!!Fy",
        personalEmail: "2102508727@svyasa-sas.edu.in",
        responsibilities: "budget planning, maintaining financial records, managing sponsorship funds, processing reimbursements, and ensuring financial transparency."
    },
    {
        name: "Nishtha Agarwal",
        role: "Membership Lead",
        officialEmail: "nishtha@devforge.club",
        tempPassword: "@^0b5*Of-s%NfX",
        personalEmail: "2102508773@svyasa-sas.edu.in",
        responsibilities: "managing applications, onboarding members, maintaining membership records, collecting feedback, and organizing orientation activities."
    },
    {
        name: "Luvya Padmaj Rana",
        role: "Technical Lead",
        officialEmail: "luvya@devforge.club",
        tempPassword: "WAeDOKTTWN%Qf%",
        personalEmail: "2102508765@svyasa-sas.edu.in",
        responsibilities: "planning workshops, leading technical projects, managing GitHub and technical infrastructure, supporting hackathons, and mentoring members."
    },
    {
        name: "Sahitya Singh",
        role: "Community Lead",
        officialEmail: "sahitya@devforge.club",
        tempPassword: "CWKZNteP82=d7#",
        personalEmail: "2102508794@svyasa-sas.edu.in",
        responsibilities: "building an inclusive community, managing Discord and communication spaces, organizing networking activities, and supporting member engagement."
    },
    {
        name: "Anant Sharma",
        role: "Marketing Lead",
        officialEmail: "anant@devforge.club",
        tempPassword: "JI%NXCMBU^s=NM",
        personalEmail: "2102508710@svyasa-sas.edu.in",
        responsibilities: "branding and outreach, social media management, promotions, event publicity, community campaigns, and ensuring brand consistency."
    },
    {
        name: "Shubham Sagar",
        role: "Mentor",
        officialEmail: "shubham@devforge.club",
        tempPassword: "-Vb&BJlC7G!K%=",
        personalEmail: "shubham.sagar@newtonschool.co",
        responsibilities: "guiding club members, providing technical expertise, and supporting developers as they build open-source contributions and community projects."
    }
];

// Filter recipients if arg is not "all"
const targets = filterArg === 'all' 
    ? recipients 
    : recipients.filter(r => r.name.toLowerCase().includes(filterArg) || r.role.toLowerCase().includes(filterArg) || r.officialEmail.toLowerCase().includes(filterArg));

if (targets.length === 0) {
    console.log(`No recipients found matching filter: "${filterArg}"`);
    process.exit(0);
}

// 3. Create Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: smtpUser,
        pass: smtpPass
    }
});

// 4. Send function
async function sendOnboardingEmails() {
    console.log(`Starting onboarding email dispatch for ${targets.length} recipient(s)...\n`);
    let successCount = 0;
    let failureCount = 0;

    for (const r of targets) {
        console.log(`Sending email to ${r.name} (${r.role}) at ${r.personalEmail}...`);

        const isMentor = r.role.toLowerCase() === 'mentor';
        const roleOpening = isMentor
            ? `As a <strong>${r.role}</strong>, your guidance, expertise, and support will be invaluable in helping our members build outstanding projects, contribute to open source, and grow as exceptional engineers and technology leaders.`
            : `As the ${r.role}, you will be responsible for <strong>${r.responsibilities}</strong>`;

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; color: #333333;">
                <div style="text-align: center; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #0891b2;">Welcome to DevForge!</h2>
                    <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Newton School of Technology, Bengaluru</p>
                </div>
                
                <p>Dear <strong>${r.name}</strong>,</p>
                
                <p>Welcome to <strong>DevForge</strong>, the official developer community at Newton School of Technology, Bengaluru!</p>
                
                <p>${roleOpening}</p>
                
                <p>To help you connect with the community and manage official communication, we have set up your official DevForge email account. Please find your credentials below:</p>
                
                <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-weight: bold; width: 140px; color: #0f766e;">Official Email:</td>
                            <td style="padding: 5px 0; font-family: monospace; font-size: 15px; color: #0f766e;">${r.officialEmail}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: bold; color: #0f766e;">Temp Password:</td>
                            <td style="padding: 5px 0; font-family: monospace; font-size: 15px; color: #0f766e;">${r.tempPassword}</td>
                        </tr>
                    </table>
                </div>
                
                <h3 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px;">Next Steps</h3>
                <ol style="padding-left: 20px; line-height: 1.6;">
                    <li>Log in to your email portal at <a href="https://purelymail.com" style="color: #06b6d4; text-decoration: none;">purelymail.com</a> (or use your preferred email client).</li>
                    <li><strong>Reset your password immediately</strong> to ensure account security.</li>
                    <li>Review the newly uploaded <strong>DevForge Governance Document</strong> on our club website to align on our shared values and guidelines.</li>
                </ol>

                <h3 style="color: #0891b2; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px;">⚙️ Mail Client Configuration (Optional)</h3>
                <p style="font-size: 14px; color: #555555; margin-bottom: 10px;">To configure this account in Apple Mail, Outlook, Thunderbird, or mobile clients:</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; background-color: #f8fafc; border-radius: 8px; padding: 10px; border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 180px;">Incoming Server (IMAP):</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">imap.purelymail.com (Port 993, SSL/TLS)</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Outgoing Server (SMTP):</td>
                        <td style="padding: 8px; font-family: monospace;">smtp.purelymail.com (Port 465, SSL/TLS)</td>
                    </tr>
                </table>
                
                <p style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 14px; color: #666666; text-align: center;">
                    This is an automated system setup email from the DevForge Governance Team.<br>
                    For support, contact <a href="mailto:contact@devforge.club" style="color: #06b6d4; text-decoration: none;">contact@devforge.club</a>
                </p>
            </div>
        `;

        const mailOptions = {
            from: smtpFrom,
            to: r.personalEmail,
            subject: `Welcome to DevForge! Your Account & Credentials (${r.role})`,
            html: htmlContent,
            text: `Dear ${r.name},\n\nWelcome to DevForge!\n\nOfficial Email: ${r.officialEmail}\nTemporary Password: ${r.tempPassword}\n\nPlease reset your password immediately upon first login. \n\nIncoming Server (IMAP): imap.purelymail.com\nOutgoing Server (SMTP): smtp.purelymail.com\n\nBest regards,\nDevForge Governance Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Success: Onboarding email sent to ${r.name}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error sending email to ${r.name}:`, error);
            failureCount++;
        }
    }

    console.log(`\nEmail Dispatch Completed. Success: ${successCount}, Failures: ${failureCount}`);
}

sendOnboardingEmails();