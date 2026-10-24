import React, { useState, useEffect } from "react";
import { Plus, Search, CreditCard, IndianRupee, FileText, X, CheckCircle, Printer } from "lucide-react";
import { getPayments, recordPayment } from "../services/paymentService";
import { getEnrollments } from "../services/enrollmentService";
import "./Payments.css";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  // Modal State for Record Payment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    enrollmentId: "",
    amount: "",
    paymentMethod: "Cash",
    referenceNumber: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  // Modal State for Receipt View
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [paymentsRes, enrollRes] = await Promise.all([
        getPayments({ search: searchTerm, method: methodFilter }),
        getEnrollments({ status: "Active" }),
      ]);
      setPayments(paymentsRes.data || []);
      setEnrollments(enrollRes.data || []);
    } catch (err) {
      console.error("Failed to load payments:", err);
      setError("Unable to load payments from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, methodFilter]);

  // Find remaining balance for chosen enrollment in modal
  const selectedEnrollment = enrollments.find((e) => e._id === formData.enrollmentId);
  const remainingBalance = selectedEnrollment
    ? Math.max(0, (Number(selectedEnrollment.finalPayable) || 0) - (Number(selectedEnrollment.paidAmount) || 0))
    : 0;

  const handleOpenModal = () => {
    const defaultEnroll = enrollments.find((e) => {
      const bal = (Number(e.finalPayable) || 0) - (Number(e.paidAmount) || 0);
      return bal > 0;
    }) || enrollments[0];

    const bal = defaultEnroll
      ? Math.max(0, (Number(defaultEnroll.finalPayable) || 0) - (Number(defaultEnroll.paidAmount) || 0))
      : 0;

    setFormData({
      enrollmentId: defaultEnroll ? defaultEnroll._id : "",
      amount: bal > 0 ? bal : "",
      paymentMethod: "UPI",
      referenceNumber: "",
      notes: "Fee installment",
      paymentDate: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleEnrollmentSelect = (enrollmentId) => {
    const enr = enrollments.find((e) => e._id === enrollmentId);
    const bal = enr ? Math.max(0, (Number(enr.finalPayable) || 0) - (Number(enr.paidAmount) || 0)) : 0;
    setFormData({
      ...formData,
      enrollmentId,
      amount: bal,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.amount) <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }
    if (Number(formData.amount) > remainingBalance) {
      alert(`Amount exceeds remaining balance of ₹${remainingBalance}.`);
      return;
    }

    try {
      const res = await recordPayment(formData);
      alert("Payment recorded successfully!");
      setIsModalOpen(false);
      fetchData();
      if (res.data?.payment) {
        setSelectedReceipt(res.data.payment);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment.");
    }
  };

  return (
    <div className="payments-container">
      {/* Header */}
      <div className="payments-header">
        <div>
          <h1>Fee Payments & Receipts</h1>
          <p>Record fee payments, track installments, and issue official academy receipts</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <Plus size={18} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="payments-filter-bar">
        <div className="payments-search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by receipt number, student, or transaction reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="courses-filter-select"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="All">All Payment Methods</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Card">Card</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading payment transactions...</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
          <CreditCard size={40} style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} />
          <h3>No payment records found</h3>
          <p>Click "Record Payment" above to record a fee transaction.</p>
        </div>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Payment ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference No</th>
                <th>Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{p.receiptNumber}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>{p.paymentId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>{p.student?.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{p.student?.studentId}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "500" }}>{p.enrollment?.course?.name || "Enrolled Course"}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", color: "#15803d", fontSize: "15px" }}>
                      ₹{p.amount?.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                      }}
                    >
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td style={{ fontSize: "13px", color: "#64748b" }}>
                    {p.referenceNumber || "—"}
                  </td>
                  <td style={{ fontSize: "13px", color: "#64748b" }}>
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      style={{
                        background: "#e0e7ff",
                        color: "#4338ca",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FileText size={14} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Record Fee Payment</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Student Enrollment *</label>
                <select
                  required
                  value={formData.enrollmentId}
                  onChange={(e) => handleEnrollmentSelect(e.target.value)}
                >
                  <option value="">-- Choose Student & Course --</option>
                  {enrollments.map((e) => {
                    const bal = Math.max(0, (Number(e.finalPayable) || 0) - (Number(e.paidAmount) || 0));
                    return (
                      <option key={e._id} value={e._id}>
                        {e.student?.name} - {e.course?.name} (Pending: ₹{bal.toLocaleString("en-IN")})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedEnrollment && (
                <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Course Total Payable: ₹{selectedEnrollment.finalPayable}</div>
                  <div style={{ fontSize: "12px", color: "#16a34a" }}>Already Paid: ₹{selectedEnrollment.paidAmount || 0}</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#dc2626", marginTop: "4px" }}>
                    Remaining Due: ₹{remainingBalance.toLocaleString("en-IN")}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    max={remainingBalance || undefined}
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reference / Transaction No</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref / Cheque No"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Installment 1 of 2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2>Official Payment Receipt</h2>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="receipt-card">
              <div className="receipt-header">
                <h3>AMS ACADEMY</h3>
                <p>Payment Acknowledgement Receipt</p>
                <p style={{ fontWeight: "600", color: "#4f46e5", marginTop: "4px" }}>
                  Receipt No: {selectedReceipt.receiptNumber}
                </p>
              </div>

              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Date:</span>
                <span style={{ fontWeight: "500" }}>{new Date(selectedReceipt.paymentDate).toLocaleDateString()}</span>
              </div>
              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Student Name:</span>
                <span style={{ fontWeight: "600" }}>{selectedReceipt.student?.name}</span>
              </div>
              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Student ID:</span>
                <span>{selectedReceipt.student?.studentId}</span>
              </div>
              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Course:</span>
                <span>{selectedReceipt.enrollment?.course?.name || "Course"}</span>
              </div>
              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Payment Method:</span>
                <span>{selectedReceipt.paymentMethod}</span>
              </div>
              {selectedReceipt.referenceNumber && (
                <div className="receipt-row">
                  <span style={{ color: "#64748b" }}>Ref No:</span>
                  <span>{selectedReceipt.referenceNumber}</span>
                </div>
              )}

              <div className="receipt-row total">
                <span>Amount Paid:</span>
                <span>₹{selectedReceipt.amount?.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: "16px" }}>
              <button
                className="btn-primary"
                onClick={() => window.print()}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button className="btn-secondary" onClick={() => setSelectedReceipt(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
