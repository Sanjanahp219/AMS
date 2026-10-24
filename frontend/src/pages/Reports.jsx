import React, { useState, useEffect } from "react";
import { Download, Users, ClipboardList, CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import {
  getStudentsReport,
  getEnrollmentsReport,
  getPaymentsReport,
  getOutstandingReport,
  downloadReportCSV,
} from "../services/reportService";
import "./Reports.css";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("students");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (activeTab === "students") {
        res = await getStudentsReport();
      } else if (activeTab === "enrollments") {
        res = await getEnrollmentsReport();
      } else if (activeTab === "payments") {
        res = await getPaymentsReport();
      } else if (activeTab === "outstanding") {
        res = await getOutstandingReport();
      }
      setData(res?.data || []);
    } catch (err) {
      console.error("Failed to load report data:", err);
      setError("Unable to generate report data from the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const handleDownloadCSV = () => {
    downloadReportCSV(activeTab);
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Academy Reports & Analytics</h1>
          <p>Generate, review, and export real-time operational and financial reports</p>
        </div>
        <button className="btn-primary" onClick={handleDownloadCSV}>
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`report-tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <Users size={16} />
          <span>Student Directory</span>
        </button>
        <button
          className={`report-tab-btn ${activeTab === "enrollments" ? "active" : ""}`}
          onClick={() => setActiveTab("enrollments")}
        >
          <ClipboardList size={16} />
          <span>Course Enrollments</span>
        </button>
        <button
          className={`report-tab-btn ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          <CreditCard size={16} />
          <span>Fee Collections</span>
        </button>
        <button
          className={`report-tab-btn ${activeTab === "outstanding" ? "active" : ""}`}
          onClick={() => setActiveTab("outstanding")}
        >
          <AlertCircle size={16} />
          <span>Outstanding Balances</span>
        </button>
      </div>

      {/* Report Info Bar */}
      <div className="report-toolbar">
        <span style={{ fontSize: "14px", color: "#64748b" }}>
          Showing <strong>{data.length}</strong> records in this report
        </span>
        <button
          onClick={fetchReportData}
          style={{
            background: "none",
            border: "none",
            color: "#4f46e5",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <RefreshCw size={14} /> Refresh Report
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Dynamic Tab Tables */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Generating report...</div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
          <h3>No records in this report</h3>
          <p>As operations proceed in the academy, statistics will appear here.</p>
        </div>
      ) : (
        <div className="enrollments-table-wrapper">
          {activeTab === "students" && (
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr key={s._id}>
                    <td><strong style={{ color: "#4f46e5" }}>{s.studentId}</strong></td>
                    <td>{s.name}</td>
                    <td>{s.phone}</td>
                    <td>{s.email || "—"}</td>
                    <td>{s.city || "—"}</td>
                    <td>{new Date(s.registrationDate).toLocaleDateString()}</td>
                    <td><span className={`badge-tag ${s.status?.toLowerCase()}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "enrollments" && (
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th>Enrollment ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Agreed Fee</th>
                  <th>Discount</th>
                  <th>Final Payable</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((e) => (
                  <tr key={e._id}>
                    <td><strong style={{ color: "#4f46e5" }}>{e.enrollmentId}</strong></td>
                    <td>{e.student?.name}</td>
                    <td>{e.course?.name}</td>
                    <td>{e.batch?.batchName || "Self-Paced"}</td>
                    <td>₹{e.agreedFee?.toLocaleString("en-IN")}</td>
                    <td>₹{e.discount || 0}</td>
                    <td><strong>₹{e.finalPayable?.toLocaleString("en-IN")}</strong></td>
                    <td style={{ color: "#15803d" }}>₹{(e.paidAmount || 0).toLocaleString("en-IN")}</td>
                    <td><span className={`badge-tag ${e.status?.toLowerCase()}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "payments" && (
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.receiptNumber}</strong></td>
                    <td>{p.student?.name}</td>
                    <td>{p.enrollment?.course?.name || "Course"}</td>
                    <td style={{ color: "#15803d", fontWeight: "700" }}>₹{p.amount?.toLocaleString("en-IN")}</td>
                    <td><span className="badge-tag active">{p.paymentMethod}</span></td>
                    <td>{p.referenceNumber || "—"}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td><span className="badge-tag active">{p.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "outstanding" && (
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th>Enrollment ID</th>
                  <th>Student Name</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Total Payable</th>
                  <th>Amount Paid</th>
                  <th>Outstanding Due</th>
                </tr>
              </thead>
              <tbody>
                {data.map((o) => (
                  <tr key={o.enrollmentId}>
                    <td><strong style={{ color: "#4f46e5" }}>{o.enrollmentId}</strong></td>
                    <td><strong>{o.studentName}</strong> ({o.studentId})</td>
                    <td>{o.phone}</td>
                    <td>{o.courseName}</td>
                    <td>₹{o.finalPayable?.toLocaleString("en-IN")}</td>
                    <td style={{ color: "#15803d" }}>₹{o.paidAmount?.toLocaleString("en-IN")}</td>
                    <td style={{ color: "#dc2626", fontWeight: "700" }}>₹{o.outstandingBalance?.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
