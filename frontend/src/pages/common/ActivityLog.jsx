import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiInbox, FiClock, FiCheckCircle,
    FiXCircle, FiFilter, FiSearch, FiRefreshCw,
    FiUser, FiTag, FiActivity, FiSend, FiAward,
    FiCalendar, FiChevronDown
} from 'react-icons/fi';
import { campaignAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './ActivityLog.css';

const STATUS_CONFIG = {
    approved: { label: 'Approved', color: '#10b981', bg: '#dcfce7', icon: FiCheckCircle },
    accepted: { label: 'Accepted', color: '#10b981', bg: '#dcfce7', icon: FiCheckCircle },
    hired: { label: 'Hired', color: '#10b981', bg: '#dcfce7', icon: FiCheckCircle },
    contracted: { label: 'Contracted', color: '#8b5cf6', bg: '#f3e8ff', icon: FiAward },
    rejected: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: FiXCircle },
    declined: { label: 'Declined', color: '#ef4444', bg: '#fee2e2', icon: FiXCircle },
    pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7', icon: FiClock },
    paid: { label: 'Paid', color: '#3b82f6', bg: '#dbeafe', icon: FiSend },
};

const getStatusConfig = (status) =>
    STATUS_CONFIG[status?.toLowerCase()] || { label: status || 'Unknown', color: '#94a3b8', bg: '#f1f5f9', icon: FiInbox };

const ActivityLog = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchActivities = async () => {
        try {
            setLoading(true);
            let res;
            if (user?.role === 'brand') {
                res = await campaignAPI.getBrandApplications();
            } else {
                res = await campaignAPI.getInfluencerApplications();
            }
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setActivities(data);
        } catch (err) {
            console.error('Failed to fetch activity log:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchActivities();
    }, [user]);

    const filteredActivities = activities.filter(activity => {
        const matchesSearch =
            (activity.campaign_title || activity.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (activity.influencer_profile_name || activity.influencer_name ||
                activity.brand_profile_name || activity.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || activity.status?.toLowerCase() === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleBack = () => {
        navigate(user?.role === 'brand' ? '/brand/dashboard' : '/influencer/dashboard');
    };

    // Summary counts
    const counts = {
        total: activities.length,
        pending: activities.filter(a => a.status?.toLowerCase() === 'pending').length,
        approved: activities.filter(a => ['approved', 'accepted', 'hired', 'contracted'].includes(a.status?.toLowerCase())).length,
        rejected: activities.filter(a => ['rejected', 'declined'].includes(a.status?.toLowerCase())).length,
    };

    return (
        <div className="alog-page">

            {/* ── Sticky Top Bar ── */}
            <header className="alog-topbar">
                <div className="alog-topbar-inner">
                    <button className="alog-back-btn" onClick={handleBack}>
                        <FiArrowLeft size={16} />
                        {/* Back to Dashboard */}
                    </button>

                    <div className="alog-topbar-title">
                        <div className="alog-topbar-icon">
                            <FiActivity size={20} />
                        </div>
                        <div>
                            <h1>Activity History</h1>
                            <span>Track all your collaboration updates</span>
                        </div>
                    </div>

                    <button
                        className="alog-refresh-btn"
                        onClick={fetchActivities}
                        disabled={loading}
                        title="Refresh"
                    >
                        <FiRefreshCw size={16} className={loading ? 'alog-spinning' : ''} />
                        Refresh
                    </button>
                </div>
            </header>

            {/* ── Page Body ── */}
            <div className="alog-body">

                {/* Summary Stats */}
                <div className="alog-stats-row">
                    <div className="alog-stat-card">
                        <div className="alog-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                            <FiActivity size={18} />
                        </div>
                        <div>
                            <p className="alog-stat-value">{counts.total}</p>
                            <p className="alog-stat-label">Total Activities</p>
                        </div>
                    </div>
                    <div className="alog-stat-card">
                        <div className="alog-stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                            <FiClock size={18} />
                        </div>
                        <div>
                            <p className="alog-stat-value">{counts.pending}</p>
                            <p className="alog-stat-label">Pending</p>
                        </div>
                    </div>
                    <div className="alog-stat-card">
                        <div className="alog-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                            <FiCheckCircle size={18} />
                        </div>
                        <div>
                            <p className="alog-stat-value">{counts.approved}</p>
                            <p className="alog-stat-label">Approved</p>
                        </div>
                    </div>
                    <div className="alog-stat-card">
                        <div className="alog-stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            <FiXCircle size={18} />
                        </div>
                        <div>
                            <p className="alog-stat-value">{counts.rejected}</p>
                            <p className="alog-stat-label">Rejected</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="alog-controls-bar">
                    <div className="alog-search-wrap">
                        <FiSearch className="alog-search-icon" size={15} />
                        <input
                            className="alog-search-input"
                            type="text"
                            placeholder="Search by campaign or user…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="alog-filter-wrap">
                        <FiFilter className="alog-filter-icon" size={14} />
                        <select
                            className="alog-filter-select"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="contracted">Contracted</option>
                            <option value="paid">Paid</option>
                        </select>
                        <FiChevronDown className="alog-filter-caret" size={13} />
                    </div>

                    <div className="alog-results-count">
                        {filteredActivities.length} result{filteredActivities.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Table Card */}
                <div className="alog-table-card">
                    {loading ? (
                        <div className="alog-loading-state">
                            <div className="alog-loader-ring" />
                            <p>Loading activity log…</p>
                        </div>
                    ) : filteredActivities.length > 0 ? (
                        <div className="alog-table-wrap">
                            <table className="alog-table">
                                <thead>
                                    <tr>
                                        <th className="alog-th">#</th>
                                        <th className="alog-th">Activity</th>
                                        <th className="alog-th">Campaign</th>
                                        <th className="alog-th">{user?.role === 'brand' ? 'Influencer' : 'Brand'}</th>
                                        <th className="alog-th">Status</th>
                                        <th className="alog-th">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredActivities.map((activity, index) => {
                                        const cfg = getStatusConfig(activity.status);
                                        const StatusIcon = cfg.icon;
                                        const personName = user?.role === 'brand'
                                            ? (activity.influencer_profile_name || activity.influencer_name || '—')
                                            : (activity.brand_profile_name || activity.brand_name || '—');

                                        return (
                                            <tr key={index} className="alog-tr">
                                                <td className="alog-td alog-td-index">{index + 1}</td>

                                                {/* Activity type */}
                                                <td className="alog-td">
                                                    <div className="alog-cell-activity">
                                                        <div
                                                            className="alog-activity-icon-box"
                                                            style={{ background: cfg.bg, color: cfg.color }}
                                                        >
                                                            <StatusIcon size={15} />
                                                        </div>
                                                        <span className="alog-activity-label">Application Update</span>
                                                    </div>
                                                </td>

                                                {/* Campaign */}
                                                <td className="alog-td">
                                                    <div className="alog-cell-campaign">
                                                        <FiTag size={13} className="alog-cell-icon" />
                                                        <span className="alog-campaign-name">
                                                            {activity.campaign_title || activity.title || '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Person */}
                                                <td className="alog-td">
                                                    <div className="alog-cell-person">
                                                        <div className="alog-avatar">
                                                            {personName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span>{personName}</span>
                                                    </div>
                                                </td>

                                                {/* Status badge */}
                                                <td className="alog-td">
                                                    <span
                                                        className="alog-status-badge"
                                                        style={{ background: cfg.bg, color: cfg.color }}
                                                    >
                                                        <StatusIcon size={11} />
                                                        {cfg.label}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="alog-td">
                                                    <div className="alog-cell-date">
                                                        <FiCalendar size={13} className="alog-cell-icon" />
                                                        {new Date(activity.applied_at).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alog-empty-state">
                            <div className="alog-empty-icon">
                                <FiInbox size={36} />
                            </div>
                            <h3>No activities found</h3>
                            <p>Try adjusting your search or filter to find what you're looking for.</p>
                            {(searchTerm || filterStatus !== 'all') && (
                                <button
                                    className="alog-clear-btn"
                                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ActivityLog;
