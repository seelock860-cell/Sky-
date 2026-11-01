import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { getWhatsAppUrl, submitCustomerEnquiry } from '../lib/api';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';

interface ContactPageProps {
  settings?: SiteSettings | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const companyName = settings?.company_name || 'SkyHome';
  const whatsappNum = settings?.whatsapp_number || '09024971419';
  const contactEmail = settings?.contact_email || 'contact@skyhome.ng';
  const officeAddress = settings?.office_address || '14B Admiralty Way, Lekki Phase 1, Lagos, Nigeria';

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !message) {
      setSubmitError('Please complete your name, phone number, and message.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const res = await submitCustomerEnquiry({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        message,
      });

      setSubmitSuccess(res.message);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setMessage('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061413] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E8AA35]">
            Contact SkyHome
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mt-3">
            Get In Touch
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-4 font-light">
            Whether you are acquiring a luxury home, seeking an off-market plot, or booking a private inspection, our team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information & Channels (1 Col) */}
          <div className="space-y-6">
            {/* WhatsApp Card */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-[#25D366]/10 text-[#25D366]">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instant WhatsApp</h3>
                  <p className="text-xs text-slate-400">Fastest response for inquiries</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Chat directly with our luxury acquisition director for immediate pricing, site video tours, and inspection appointments.
              </p>

              <a
                href={getWhatsAppUrl(whatsappNum, 'Hello SkyHome, I would like to make an inquiry regarding your luxury properties.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#22c35e] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Email Contact Card */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-[#0A2220] text-[#E8AA35] border border-[#E8AA35]/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Email Advisory</h3>
                  <p className="text-xs text-slate-400">Formal proposals and briefs</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4">{contactEmail}</p>

              <a
                href={`mailto:${contactEmail}?subject=SkyHome Property Inquiry`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#0A2220] hover:bg-[#0E2C2A] text-slate-200 border border-[#143330] text-xs font-semibold transition-colors"
              >
                <Mail className="w-4 h-4 text-[#E8AA35]" />
                <span>Send Direct Email</span>
              </a>
            </div>

            {/* Business Address & Hours */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E8AA35] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs uppercase font-semibold text-slate-400 mb-1">Office Location</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">{officeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[#143330]">
                <Clock className="w-5 h-5 text-[#E8AA35] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs uppercase font-semibold text-slate-400 mb-1">Advisory Hours</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Monday – Saturday: 8:00 AM – 7:00 PM WAT<br />
                    Sunday: By appointment only
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Enquiry Form (2 Cols) */}
          <div className="lg:col-span-2 bg-[#071C1A] border border-[#143330] rounded-2xl p-8 sm:p-10 shadow-xl">
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Send Us an Enquiry</h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8 font-light">
              Submit your property requirements or questions below. A SkyHome real estate specialist will reach out promptly.
            </p>

            {submitSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 space-y-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Thank You for Contacting {companyName}</h3>
                <p className="text-sm max-w-md mx-auto">{submitSuccess}</p>
                <button
                  onClick={() => setSubmitSuccess(null)}
                  className="px-6 py-2.5 rounded-lg bg-[#E8AA35] text-black font-bold text-xs uppercase tracking-wider"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitError && (
                  <div className="p-3 bg-rose-950/50 border border-rose-900 rounded-lg text-rose-300 text-xs">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Femi Coker"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg px-4 py-3 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg px-4 py-3 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg px-4 py-3 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Your Message or Property Requirements *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tell us what type of property you are looking for (e.g. 5-bedroom detached duplex in Ikoyi with swimming pool, budget ₦1.5B)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg p-4 border border-[#143330] focus:border-[#E8AA35] focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:shadow-[#E8AA35]/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Enquiry...' : 'Submit Property Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
