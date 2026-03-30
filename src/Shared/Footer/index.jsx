import React from "react";
import { NavLink } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Code2, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <img src="/Logo_4.png" alt="C" className="h-6" />
              </div>
              <span className="text-xl font-bold text-gray-800">CodeBay</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering the next generation of developers with world-class
              interactive coding education and community-driven projects.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<FaGithub />} href="#" />
              <SocialIcon icon={<FaTwitter />} href="#" />
              <SocialIcon icon={<FaLinkedin />} href="#" />
              <SocialIcon icon={<FaYoutube />} href="#" />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
            <ul className="space-y-4">
              <FooterLink to="/courses" label="Browse Courses" />
              <FooterLink to="/projects" label="Pro Projects" />
              <FooterLink to="/pricing" label="Pricing Plans" />
              <FooterLink to="/roadmap" label="Learning Roadmaps" />
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Support</h4>
            <ul className="space-y-4">
              <FooterLink to="/help" label="Help Center" />
              <FooterLink to="/community" label="Community Forum" />
              <FooterLink to="/contact" label="Contact Us" />
              <FooterLink to="/status" label="System Status" />
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 className="font-bold text-gray-900 mb-6">Stay Updated</h4>
            <p className="text-sm text-gray-500">
              Get the latest coding tips and course updates.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} CodeBay Education Inc. All rights reserved.
          </p>
          <div className="flex gap-8">
            <NavLink
              to="/privacy"
              className="text-sm text-gray-400 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </NavLink>
            <NavLink
              to="/terms"
              className="text-sm text-gray-400 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Components
const FooterLink = ({ to, label }) => (
  <li>
    <NavLink
      to={to}
      className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-200"
    >
      {label}
    </NavLink>
  </li>
);

const SocialIcon = ({ icon, href }) => (
  <a
    href={href}
    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
  >
    {icon}
  </a>
);

export default Footer;
