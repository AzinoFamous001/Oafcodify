import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileContract } from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaFileContract size={120} className="text-white/60" />
    </div>
  </div>
);

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-hidden">
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
            <h1 className="text-3xl text-white font-bold tracking-tight">Terms of Service</h1>
            <p className="text-blue-200 text-sm mt-1">Last updated: May 15, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-blue-200 leading-relaxed">
              By accessing and using Oafcodify, you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to abide by these terms, 
              please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. User Accounts</h2>
            <p className="text-blue-200 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities that occur under your account. 
              Oafcodify cannot and will not be liable for any loss or damage arising from your 
              failure to comply with this obligation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Intellectual Property</h2>
            <p className="text-blue-200 leading-relaxed">
              All content included on the Service, such as text, graphics, logos, images, and 
              software, is the property of Oafcodify or its content suppliers and is protected by 
              international copyright laws. You may not modify, reproduce, or distribute any 
              content without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. User Conduct</h2>
            <p className="text-blue-200 leading-relaxed">
              You agree not to use the Service for any unlawful purpose, to solicit others to 
              perform or participate in any unlawful acts, to violate any international, federal, 
              provincial, or state regulations, rules, laws, or local ordinances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Payment and Subscription</h2>
            <p className="text-blue-200 leading-relaxed">
              For paid services, you agree to provide current, complete, and accurate purchase 
              and account information for all purchases made at our store. You agree to promptly 
              update your account and other information, including your email address and credit 
              card numbers, so that we can complete your transactions and contact you as needed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Cancellation and Refund Policy</h2>
            <p className="text-blue-200 leading-relaxed">
              All fees are charged in USD. You may cancel your subscription at any time through 
              your account settings. Refunds will be processed within 30 days of purchase 
              according to our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-blue-200 leading-relaxed">
              The Service is provided "as is" without warranty of any kind, express or implied, 
              including but not limited to the implied warranties of merchantability, fitness 
              for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-blue-200 leading-relaxed">
              In no event shall Oafcodify be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation, loss of profits, 
              data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. Governing Law</h2>
            <p className="text-blue-200 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of 
              the jurisdiction in which Oafcodify is headquartered, without regard to its conflict 
              of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">10. Changes to Terms</h2>
            <p className="text-blue-200 leading-relaxed">
              Oafcodify reserves the right to modify these terms at any time. We will notify users 
              of any material changes by posting the new terms on this website. Your continued 
              use of the Service after such modifications constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">11. Contact Information</h2>
            <p className="text-blue-200 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at 
              legal@codebay.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
