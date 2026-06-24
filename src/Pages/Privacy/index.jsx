import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaShieldAlt size={120} className="text-white/60" />
    </div>
  </div>
);

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-x-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white hover:bg-white/20 rounded-2xl transition-all"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl text-white font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-blue-200 text-sm mt-1">Last updated: May 15, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-blue-200 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, 
              participate in courses, or communicate with us. This includes your name, email address, 
              and learning progress data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-blue-200 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, 
              to process transactions and send you related information, to send technical notices 
              and support messages, and to respond to your comments and questions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Information Sharing</h2>
            <p className="text-blue-200 leading-relaxed">
              We do not sell, trade, or rent your personal information to others. We may share 
              your information with third parties only in the following circumstances: with your 
              consent, to comply with legal obligations, or to protect our rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="text-blue-200 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Your Rights</h2>
            <p className="text-blue-200 leading-relaxed">
              You have the right to access, correct, or delete your personal information. You may 
              also opt out of certain communications from us. To exercise these rights, please 
              contact us at privacy@oafcodify.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Cookies</h2>
            <p className="text-blue-200 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our website 
              and hold certain information. Cookies are files with small amount of data which may 
              include an anonymous unique identifier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Changes to This Policy</h2>
            <p className="text-blue-200 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any 
              changes by posting the new privacy policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Contact Us</h2>
            <p className="text-blue-200 leading-relaxed">
              If you have any questions about this privacy policy, please contact us at 
              privacy@oafcodify.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPage;
