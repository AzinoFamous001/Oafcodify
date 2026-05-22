import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaClock } from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaCheckCircle size={120} className="text-green-400/60" />
    </div>
  </div>
);

const StatusPage = () => {
  const navigate = useNavigate();

  const services = [
    { name: "Website", status: "operational", uptime: "99.9%" },
    { name: "API", status: "operational", uptime: "99.8%" },
    { name: "Database", status: "operational", uptime: "99.9%" },
    { name: "CDN", status: "operational", uptime: "99.7%" },
    { name: "Authentication", status: "operational", uptime: "99.9%" },
    { name: "Email Service", status: "degraded", uptime: "98.5%" },
  ];

  const incidents = [
    {
      date: "May 15, 2026",
      title: "Email Service Degradation",
      status: "investigating",
      description: "We're currently investigating delays in email delivery for password reset and notification emails.",
    },
    {
      date: "May 10, 2026",
      title: "Scheduled Maintenance",
      status: "resolved",
      description: "Completed scheduled maintenance for database optimization. All services are operational.",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <FaCheckCircle className="text-green-400" size={20} />;
      case "degraded":
        return <FaExclamationCircle className="text-yellow-400" size={20} />;
      case "outage":
        return <FaExclamationCircle className="text-red-400" size={20} />;
      default:
        return <FaClock className="text-blue-400" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "text-green-400";
      case "degraded":
        return "text-yellow-400";
      case "outage":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white hover:bg-white/20 rounded-2xl transition-all"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl text-white font-bold tracking-tight">System Status</h1>
            <p className="text-blue-200 text-sm mt-1">Real-time service availability and incidents</p>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-green-500/20 backdrop-blur-md rounded-3xl p-8 border border-green-500/30 mb-8">
          <div className="flex items-center gap-4">
            <FaCheckCircle className="text-green-400" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-white">All Systems Operational</h2>
              <p className="text-green-200">Last checked: Just now</p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Services</h3>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <span className="text-white font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-sm ${getStatusColor(service.status)}`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                  <span className="text-blue-200 text-sm">{service.uptime} uptime</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Recent Incidents</h3>
          <div className="space-y-6">
            {incidents.map((incident, index) => (
              <div
                key={index}
                className="border-l-4 border-yellow-400 pl-4 py-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-200 text-sm">{incident.date}</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      incident.status === "investigating"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{incident.title}</h4>
                <p className="text-blue-200 text-sm">{incident.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default StatusPage;
