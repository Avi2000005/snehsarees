import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, FileText, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { ActivePage, Policy } from '../../types';
import { API_URL, BUSINESS_WHATSAPP } from '../../config';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

interface PolicyPageViewProps {
  slug?: string;
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
}

export const PolicyPageView: React.FC<PolicyPageViewProps> = ({
  slug,
  onNavigate,
  onBack,
}) => {
  const currentSlug = (slug || 'shipping-policy').toLowerCase();

  const [publishedPolicies, setPublishedPolicies] = useState<{ id: number; slug: string; title: string }[]>([]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch all published policies to render the top pill switcher
  useEffect(() => {
    fetch(`${API_URL}/api/policies`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setPublishedPolicies(data);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch the specific policy by slug
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/policies/${currentSlug}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('This policy is not available yet.');
          }
          throw new Error('Failed to load policy. Please try again.');
        }
        return res.json();
      })
      .then((data: Policy) => {
        if (isMounted) {
          setPolicy(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'This policy is not available yet.');
          setPolicy(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  const formattedDate = policy?.updated_at
    ? new Date(policy.updated_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-16 font-sans">
      {/* Top Bar Navigation */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E8E0D5] h-[56px] md:h-[64px] flex items-center justify-between px-4 md:px-8 z-30 shadow-xs max-w-full mx-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer text-[#1A1A1A]"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer text-[#1A1A1A]"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        <h1 className="font-serif text-base md:text-lg font-bold text-[#1A1A1A] truncate max-w-[240px] sm:max-w-md text-center">
          {policy?.title || 'Store Policy'}
        </h1>

        <div className="w-9" />
      </div>

      <div className="max-w-[840px] mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* Dynamic Toggle Pills between Published Policies */}
        {publishedPolicies.length > 1 && (
          <div className="flex bg-white p-1.5 rounded-2xl border border-[#E8E0D5] shadow-xs overflow-x-auto no-scroll gap-1 max-w-full mx-auto">
            {publishedPolicies.map((p) => {
              const isActive = p.slug.toLowerCase() === currentSlug;
              return (
                <button
                  key={p.id}
                  onClick={() => onNavigate('policies', p.slug)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#C4601A] text-white shadow-xs'
                      : 'text-[#666666] hover:text-[#1A1A1A] hover:bg-[#FAF6F0]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-[#E8E0D5] p-10 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#C4601A] animate-spin" />
            <p className="text-xs text-[#777777] font-medium">Loading store policy...</p>
          </div>
        )}

        {/* Error / Not Found / Unavailable State */}
        {!loading && (error || !policy) && (
          <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 md:p-12 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
                This policy is not available yet
              </h2>
              <p className="text-xs text-[#777777] mt-1 max-w-md mx-auto">
                {error || 'This policy content has not been published yet. Please check back later.'}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="bg-[#C4601A] hover:bg-[#A0450F] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        )}

        {/* Policy Content Card */}
        {!loading && policy && (
          <article className="bg-white rounded-3xl border border-[#E8E0D5] p-6 md:p-10 shadow-sm space-y-6 text-[#3A3A3A] leading-relaxed">
            {/* Header banner */}
            <div className="bg-[#FFF8F3] border border-[#F0C8A0] rounded-2xl p-5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C4601A] block mb-1">
                Official Store Policy
              </span>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1A1A] mb-1">
                {policy.title}
              </h2>
              {formattedDate && (
                <p className="text-[11px] text-[#7A3A12]">
                  Last Updated: <strong>{formattedDate}</strong> · Sneh Sarees, Kota
                </p>
              )}
            </div>

            {/* Sanitized Policy HTML Content */}
            <div
              className="policy-content space-y-4 text-xs md:text-sm text-[#3A3A3A] leading-relaxed
                [&_h2]:font-serif [&_h2]:text-lg md:[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#1A1A1A] [&_h2]:pt-3 [&_h2]:pb-1
                [&_h3]:font-serif [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#1A1A1A] [&_h3]:pt-2 [&_h3]:pb-0.5
                [&_h4]:font-sans [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-[#1A1A1A]
                [&_p]:leading-relaxed [&_p]:text-[#3A3A3A]
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-[#444444]
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-[#444444]
                [&_li]:leading-relaxed
                [&_strong]:font-bold [&_strong]:text-[#1A1A1A]
                [&_a]:text-[#C4601A] [&_a]:underline [&_a]:font-medium hover:[&_a]:opacity-80
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-xs
                [&_th]:bg-[#FAF6F0] [&_th]:border [&_th]:border-[#E8E0D5] [&_th]:p-2.5 [&_th]:text-left [&_th]:font-bold [&_th]:text-[#1A1A1A]
                [&_td]:border [&_td]:border-[#E8E0D5] [&_td]:p-2.5 [&_td]:text-[#3A3A3A]
                [&_blockquote]:border-l-4 [&_blockquote]:border-[#C4601A] [&_blockquote]:bg-[#FFF8F3] [&_blockquote]:p-3 [&_blockquote]:rounded-r-xl [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(policy.content) }}
            />
          </article>
        )}

        {/* Support Helpdesk Box */}
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1A1A1A]">Need assistance with our policies?</h4>
            <p className="text-xs text-[#777777] mt-0.5">Our dedicated support team is here to help Mon–Sat (9 AM to 7 PM IST).</p>
          </div>
          <a
            href={`https://wa.me/${BUSINESS_WHATSAPP || '919461037123'}?text=${encodeURIComponent(
              `Namaste Sneh Sarees! I need assistance with store policies (${policy?.title || currentSlug}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Phone className="w-4 h-4" /> WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
};
