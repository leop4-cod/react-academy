export interface CertificateEntity {
  id: number;
  studentId: number;
  courseId: number;
  courseTitle?: string;
  issuedAt: string;
  certificateCode: string;
  pdfUrl?: string;
}
