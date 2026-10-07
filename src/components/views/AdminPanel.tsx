import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Database,
  Users,
  AlertTriangle,
  Download,
  Terminal,
  CheckCircle,
  FileCode2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { AnalyticsData } from '../../types';

interface AdminPanelProps {
  analytics: AnalyticsData;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ analytics }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mysql' | 'users' | 'audit'>('overview');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sqlDump, setSqlDump] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const u = await api.getAdminUsers();
        setUsersList(u);
      } else if (activeTab === 'audit') {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      } else if (activeTab === 'mysql') {
        const res = await fetch('/api/admin/sql-export');
        const data = await res.json();
        setSqlDump(data.sql || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([sqlDump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice2growth_mysql_dump_${new Date().toISOString().slice(0, 10)}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
            System & Governance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Platform Administration & MySQL Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor verified identity records, community audit trails, and inspect the relational MySQL database schema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAdminData()}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            MySQL Relational Store: ONLINE
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('mysql')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'mysql' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>MySQL Schema & SQL Dump</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'users' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Salted User Accounts</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'audit' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Total Users</div>
              <div className="text-2xl font-black text-slate-900">{analytics.totalUsers}</div>
              <span className="text-[11px] text-emerald-600">Mobile + OTP Verified</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Total Opinions</div>
              <div className="text-2xl font-black text-slate-900">{analytics.totalOpinions}</div>
              <span className="text-[11px] text-teal-600">Stored in MySQL table</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Total Ideas</div>
              <div className="text-2xl font-black text-slate-900">{analytics.totalIdeas}</div>
              <span className="text-[11px] text-amber-600">Pipeline active</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">Feedback Submissions</div>
              <div className="text-2xl font-black text-slate-900">{analytics.totalFeedback}</div>
              <span className="text-[11px] text-purple-600">Routed to Outlets</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2">Automated Moderation & Safety Rules</h3>
            <p className="text-xs text-slate-500 mb-4">
              Voice2Growth enforces community safety by strictly disallowing hate speech, harassment, profanity, and personal attacks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Mobile Salt & Hash</span>
                <p className="text-slate-600 text-[11px]">
                  Phone numbers are salted with unique seeds and hashed before storage to prevent identity leaks.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Profanity Auto-Filter</span>
                <p className="text-slate-600 text-[11px]">
                  Content submissions are sanitized before inserting into MySQL database tables.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Privacy Consent Architecture</span>
                <p className="text-slate-600 text-[11px]">
                  Users can toggle "Anonymous Voice" at any point, masking author handles completely.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MYSQL SCHEMA & DUMP */}
      {activeTab === 'mysql' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span>MySQL Relational DDL & Export Dump</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full normalized relational schema: users, user_profiles, opinions, change_suggestions, ideas, business_feedback, audit_logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySQL}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {copySuccess ? 'Copied ✓' : 'Copy SQL'}
              </button>
              <button
                onClick={handleDownloadSQL}
                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql File</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed scrollbar-thin">
              {sqlDump || 'Loading SQL schema...'}
            </pre>
          </div>
        </div>
      )}

      {/* TAB: SALT USERS */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2">Registered Mobile Identities</h3>
          <p className="text-xs text-slate-500 mb-4">
            Raw mobile numbers are cryptographically salted. Profiles carry display pseudonyms.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">User ID</th>
                  <th className="p-3">Mobile (Salted & Masked)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 rounded-r-lg">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{u.id}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {u.mobile_number ? `${u.mobile_number.slice(0, 6)}••••••` : 'Protected'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{u.role}</td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2">Security & Operational Audit Logs</h3>
          <p className="text-xs text-slate-500 mb-4">
            Immutable log of all user logins, OTP verifications, profile creations, and idea promotions.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3 rounded-r-lg">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-purple-700">{log.action}</td>
                    <td className="p-3 text-slate-500">{log.user_id}</td>
                    <td className="p-3 text-slate-600 max-w-md truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
