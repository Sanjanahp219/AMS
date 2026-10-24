import React, { useState, useEffect } from "react";
import { Users, BookOpen, Calendar, ClipboardList, IndianRupee, AlertCircle, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import API from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalBatches: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    totalCollected: 0,
    outstandingBalance: 0,
    courseDistribution: [],
    trendData: [],
    recentStudents: [],
    recentEnrollments: [],
    recentPayments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Unable to connect to the backend server. Please verify the server is running on http://localhost:5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="dashboard-header">
        <div>
          <h1>AMS Management Dashboard</h1>
          <p>Real-time Academy Overview & Performance Metrics</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            color: "#334155",
          }}
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "8px", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Top Statistic Cards */}
      <div className="dashboard-stats-grid">
        {/* Total Students */}
        <div className="stat-card-item">
          <div className="stat-icon-wrapper blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Students</h3>
            <h2>{stats.totalStudents}</h2>
            <div className="stat-subtext">{stats.activeStudents} active students</div>
          </div>
        </div>

        {/* Courses */}
        <div className="stat-card-item">
          <div className="stat-icon-wrapper emerald">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>Courses</h3>
            <h2>{stats.totalCourses}</h2>
            <div className="stat-subtext">{stats.activeCourses} active courses</div>
          </div>
        </div>

        {/* Batches */}
        <div className="stat-card-item">
          <div className="stat-icon-wrapper purple">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>Batches</h3>
            <h2>{stats.totalBatches}</h2>
            <div className="stat-subtext">Active academy batches</div>
          </div>
        </div>

        {/* Enrollments */}
        <div className="stat-card-item">
          <div className="stat-icon-wrapper amber">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <h3>Enrollments</h3>
            <h2>{stats.totalEnrollments}</h2>
            <div className="stat-subtext">{stats.activeEnrollments} active enrollments</div>
          </div>
        </div>

        {/* Payments Collected */}
        <div className="stat-card-item">
          <div className="stat-icon-wrapper teal">
            <IndianRupee size={24} />
          </div>
          <div className="stat-info">
            <h3>Fee Collected</h3>
            <h2>₹{stats.totalCollected.toLocaleString("en-IN")}</h2>
            <div className="stat-subtext">Total received</div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="stat-card-item">
          <div className="stat-icon-wrapper rose">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Pending Fees</h3>
            <h2>₹{stats.outstandingBalance.toLocaleString("en-IN")}</h2>
            <div className="stat-subtext">Outstanding balance</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Course Enrollment Distribution */}
        <div className="chart-card-box">
          <h3>Course Enrollment Distribution</h3>
          <div style={{ width: "100%", height: "260px" }}>
            {stats.courseDistribution.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "90px", color: "#94a3b8" }}>
                No course enrollment data to display yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.courseDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="courseName" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="enrollments" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} name="Students Enrolled" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Collection Trends */}
        <div className="chart-card-box">
          <h3>Monthly Fee Collection (₹)</h3>
          <div style={{ width: "100%", height: "260px" }}>
            {stats.trendData.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "90px", color: "#94a3b8" }}>
                No payment history available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, "Collected"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="collected" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={32} name="Amount Collected" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Rows */}
      <div className="activity-grid">
        {/* Recent Registrations */}
        <div className="activity-card">
          <h3>Recent Registrations</h3>
          <ul className="activity-list">
            {stats.recentStudents.length === 0 ? (
              <li style={{ color: "#94a3b8", fontSize: "14px" }}>No recent student registrations.</li>
            ) : (
              stats.recentStudents.map((s) => (
                <li key={s._id} className="activity-item">
                  <div className="activity-item-left">
                    <div className="item-avatar">{s.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="item-info-name">{s.name}</div>
                      <div className="item-info-meta">{s.studentId} • {s.phone}</div>
                    </div>
                  </div>
                  <span className={`badge-tag ${s.status?.toLowerCase()}`}>{s.status}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Enrollments */}
        <div className="activity-card">
          <h3>Recent Enrollments</h3>
          <ul className="activity-list">
            {stats.recentEnrollments.length === 0 ? (
              <li style={{ color: "#94a3b8", fontSize: "14px" }}>No recent course enrollments.</li>
            ) : (
              stats.recentEnrollments.map((e) => (
                <li key={e._id} className="activity-item">
                  <div>
                    <div className="item-info-name">{e.student?.name}</div>
                    <div className="item-info-meta">{e.course?.name || "Course"} • {e.enrollmentId}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>
                      ₹{e.finalPayable?.toLocaleString("en-IN")}
                    </div>
                    <span className={`badge-tag ${e.status?.toLowerCase()}`}>{e.status}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Payments */}
        <div className="activity-card">
          <h3>Recent Payments</h3>
          <ul className="activity-list">
            {stats.recentPayments.length === 0 ? (
              <li style={{ color: "#94a3b8", fontSize: "14px" }}>No recent payment records.</li>
            ) : (
              stats.recentPayments.map((p) => (
                <li key={p._id} className="activity-item">
                  <div>
                    <div className="item-info-name">{p.student?.name}</div>
                    <div className="item-info-meta">{p.receiptNumber} • {p.paymentMethod}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700", color: "#15803d", fontSize: "14px" }}>
                      +₹{p.amount?.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}