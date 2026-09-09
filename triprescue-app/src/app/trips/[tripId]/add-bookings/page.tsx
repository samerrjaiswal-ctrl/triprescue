'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud, Plane, Train, Car, Building2, Mountain,
  Plus, ArrowRight, Sparkles, CheckCircle2, Trash2,
  Clock, DollarSign, FileText, AlertCircle, Loader2,
  ChevronDown, ChevronUp, Bus, Zap,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingFormData {
  type: string;
  title: string;
  origin: string;
  destination: string;
  start_time: string;
  end_time: string;
  day_offset: number;
  provider: string;
  confirmation_number: string;
  cost: string;
  is_important: boolean;
  is_refundable: boolean;
  notes: string;
}

interface SavedBooking extends BookingFormData {
  id: string;
  status: string;
}

// ─── Booking Types Config ─────────────────────────────────────────────────────
const BOOKING_TYPES = [
  {
    type: 'FLIGHT', icon: Plane, label: 'Flight', color: 'blue',
    fields: ['origin', 'destination', 'start_time', 'end_time', 'provider', 'confirmation_number', 'cost'],
    placeholders: { title: 'e.g. Pune → Delhi Flight', origin: 'Pune', destination: 'Delhi', provider: 'IndiGo', confirmation_number: '6E-1234' }
  },
  {
    type: 'TRAIN', icon: Train, label: 'Train', color: 'orange',
    fields: ['origin', 'destination', 'start_time', 'end_time', 'provider', 'confirmation_number', 'cost'],
    placeholders: { title: 'e.g. Delhi → Chandigarh Shatabdi', origin: 'Delhi', destination: 'Chandigarh', provider: 'Indian Railways', confirmation_number: 'IRCTC-12005' }
  },
  {
    type: 'BUS', icon: Bus, label: 'Bus / Volvo', color: 'green',
    fields: ['origin', 'destination', 'start_time', 'end_time', 'provider', 'cost'],
    placeholders: { title: 'e.g. Chandigarh → Manali Volvo', origin: 'Chandigarh', destination: 'Manali', provider: 'HRTC / RedBus' }
  },
  {
    type: 'HOTEL', icon: Building2, label: 'Hotel / Stay', color: 'purple',
    fields: ['start_time', 'end_time', 'provider', 'confirmation_number', 'cost'],
    placeholders: { title: 'e.g. The Imperial, New Delhi', provider: 'Booking.com', confirmation_number: 'HTL-9012' }
  },
  {
    type: 'TRANSFER', icon: Car, label: 'Cab / Transfer', color: 'yellow',
    fields: ['origin', 'destination', 'start_time', 'end_time', 'provider', 'cost'],
    placeholders: { title: 'e.g. Airport → Hotel Cab', origin: 'IGI Airport T2', destination: 'Hotel', provider: 'Uber / OLA' }
  },
  {
    type: 'ACTIVITY', icon: Mountain, label: 'Activity / Tour', color: 'teal',
    fields: ['start_time', 'end_time', 'provider', 'cost'],
    placeholders: { title: 'e.g. Solang Valley Paragliding', provider: 'Himalayan Adventures' }
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/15 border-blue-500/40 text-blue-400',
  orange: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
  green: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
  purple: 'bg-purple-500/15 border-purple-500/40 text-purple-400',
  yellow: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400',
  teal: 'bg-teal-500/15 border-teal-500/40 text-teal-400',
};

const emptyForm = (): BookingFormData => ({
  type: '', title: '', origin: '', destination: '',
  start_time: '', end_time: '', day_offset: 0,
  provider: '', confirmation_number: '', cost: '',
  is_important: false, is_refundable: true, notes: '',
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddBookingsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = (params?.tripId as string) || '';

  // Tabs
  const [activeTab, setActiveTab] = useState<'manual' | 'pdf'>('manual');

  // Manual form state
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form, setForm] = useState<BookingFormData>(emptyForm());
  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [graphResult, setGraphResult] = useState<any>(null);

  // PDF upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedBooking, setExtractedBooking] = useState<any>(null);
  const [extractError, setExtractError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeConfig = BOOKING_TYPES.find(t => t.type === selectedType);

  // ── Manual Form Handlers ──────────────────────────────────────────────────
  const handleSelectType = (type: string) => {
    setSelectedType(type);
    const cfg = BOOKING_TYPES.find(t => t.type === type);
    setForm({ ...emptyForm(), type, title: '' });
    setSubmitError('');
  };

  const handleFormChange = (field: keyof BookingFormData, value: string | boolean | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddBooking = () => {
    if (!form.type || !form.title.trim() || !form.start_time) {
      setSubmitError('Please fill in: Booking title and Start time.');
      return;
    }
    const newBk: SavedBooking = {
      ...form,
      id: `bk_local_${Date.now()}`,
      status: 'CONFIRMED',
    };
    setSavedBookings(prev => [...prev, newBk]);
    setSelectedType(null);
    setForm(emptyForm());
    setSubmitError('');
  };

  const handleRemoveBooking = (id: string) => {
    setSavedBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleBuildItinerary = async () => {
    if (savedBookings.length === 0) {
      setSubmitError('Add at least one booking before building the itinerary.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        bookings: savedBookings.map(b => ({
          type: b.type,
          title: b.title,
          origin: b.origin || undefined,
          destination: b.destination || undefined,
          start_time: b.start_time,
          end_time: b.end_time || undefined,
          day_offset: Number(b.day_offset) || 0,
          provider: b.provider || undefined,
          confirmation_number: b.confirmation_number || undefined,
          cost: parseFloat(b.cost) || 0,
          is_important: b.is_important,
          is_refundable: b.is_refundable,
          notes: b.notes || '',
        })),
      };
      const res = await fetch(`${API_BASE}/trips/${tripId}/bookings/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to build itinerary');
      setGraphResult(data);
      // Navigate to dashboard after short delay
      setTimeout(() => router.push(`/trips/${tripId}/dashboard`), 1800);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── PDF Upload Handlers ───────────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setExtractError('Unsupported file type. Please upload PDF, JPG, or PNG.');
      return;
    }
    setUploadedFile(file);
    setIsExtracting(true);
    setExtractError('');
    setExtractedBooking(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/trips/${tripId}/bookings/extract`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Extraction failed');
      if (!data.extracted) throw new Error(data.error || 'Could not extract booking details.');
      setExtractedBooking(data);
    } catch (err: any) {
      setExtractError(err.message || 'AI extraction failed. Try manual entry instead.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmExtracted = () => {
    if (!extractedBooking?.booking) return;
    const bk = extractedBooking.booking;
    const newBk: SavedBooking = {
      type: bk.type || 'FLIGHT',
      title: bk.title || `${bk.type} booking`,
      origin: bk.origin || '',
      destination: bk.destination || '',
      start_time: bk.start_time || '',
      end_time: bk.end_time || '',
      day_offset: bk.day_offset || 0,
      provider: bk.provider || '',
      confirmation_number: bk.confirmation_number || '',
      cost: String(bk.cost || 0),
      is_important: false,
      is_refundable: bk.is_refundable ?? true,
      notes: bk.notes || '',
      id: `bk_ai_${Date.now()}`,
      status: 'AI_EXTRACTED',
    };
    setSavedBookings(prev => [...prev, newBk]);
    setExtractedBooking(null);
    setUploadedFile(null);
    setActiveTab('manual');
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [tripId]);

  // ── Type icon helper ──────────────────────────────────────────────────────
  const getTypeIcon = (type: string) => {
    const cfg = BOOKING_TYPES.find(t => t.type === type);
    if (!cfg) return <Plane size={15} />;
    const Icon = cfg.icon;
    return <Icon size={15} />;
  };

  const getTypeBadge = (type: string) => {
    const cfg = BOOKING_TYPES.find(t => t.type === type);
    return cfg ? COLOR_MAP[cfg.color] : 'bg-gray-500/15 border-gray-500/40 text-gray-400';
  };

  return (
    <AppShell activeTripId={tripId} activeTripName="My Trip">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
              <Sparkles size={13} />
              Step 2 of 3: Add Bookings
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Build your connected itinerary</h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Add your bookings manually or let AI extract from confirmation PDFs.
            </p>
          </div>
          {savedBookings.length > 0 && (
            <button
              onClick={handleBuildItinerary}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all hover:scale-105 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              <span>Build Itinerary ({savedBookings.length} bookings)</span>
            </button>
          )}
        </div>

        {/* ── Graph Build Success Banner ── */}
        {graphResult && (
          <div className="glass-card rounded-2xl p-5 border border-emerald-500/40 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white text-sm">{graphResult.message}</div>
                <div className="text-xs text-emerald-400 mt-0.5">
                  DAG: {graphResult.graph?.node_count || 0} nodes • {graphResult.graph?.edge_count || 0} dependency edges • Trip Health: {graphResult.trip_health}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Switcher ── */}
        <div className="flex items-center gap-2 bg-[#080d1a] p-1 rounded-2xl border border-[#1c2942] w-fit">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'text-[#94a3b8] hover:text-white'}`}
          >
            ✍️ Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'pdf' ? 'bg-blue-600 text-white shadow-lg' : 'text-[#94a3b8] hover:text-white'}`}
          >
            🤖 AI PDF Upload
          </button>
        </div>

        {/* ══ MANUAL ENTRY TAB ══════════════════════════════════════════════ */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            {/* Booking Type Selector */}
            {!selectedType && (
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Select booking type to add</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BOOKING_TYPES.map((item) => {
                    const Icon = item.icon;
                    const colorCls = COLOR_MAP[item.color];
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleSelectType(item.type)}
                        className={`p-4 rounded-2xl border bg-[#080d1a] hover:scale-[1.02] transition-all text-left group flex items-center gap-3 ${colorCls}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorCls}`}>
                          <Icon size={17} />
                        </div>
                        <span className="text-sm font-bold text-white">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking Form */}
            {selectedType && typeConfig && (
              <div className="glass-card rounded-3xl p-6 lg:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${COLOR_MAP[typeConfig.color]}`}>
                      <typeConfig.icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Add {typeConfig.label}</h3>
                      <p className="text-xs text-[#64748b]">Fill in the booking details</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedType(null); setForm(emptyForm()); }} className="text-xs text-[#64748b] hover:text-white transition-colors">← Back</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title — always shown */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Booking Title *</label>
                    <input
                      value={form.title}
                      onChange={e => handleFormChange('title', e.target.value)}
                      placeholder={typeConfig.placeholders.title || 'Describe this booking'}
                      className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm placeholder-[#475569] focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Origin */}
                  {typeConfig.fields.includes('origin') && (
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">From / Origin</label>
                      <input
                        value={form.origin}
                        onChange={e => handleFormChange('origin', e.target.value)}
                        placeholder={typeConfig.placeholders.origin || 'City / Station'}
                        className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm placeholder-[#475569] focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Destination */}
                  {typeConfig.fields.includes('destination') && (
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">To / Destination</label>
                      <input
                        value={form.destination}
                        onChange={e => handleFormChange('destination', e.target.value)}
                        placeholder={typeConfig.placeholders.destination || 'City / Station'}
                        className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm placeholder-[#475569] focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Day Offset */}
                  <div>
                    <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Day of Trip *</label>
                    <select
                      value={form.day_offset}
                      onChange={e => handleFormChange('day_offset', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      {[0,1,2,3,4,5,6,7].map(d => (
                        <option key={d} value={d}>Day {d + 1}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">
                      {selectedType === 'HOTEL' ? 'Check-in Time *' : 'Departure / Start Time *'}
                    </label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={e => handleFormChange('start_time', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* End Time */}
                  {typeConfig.fields.includes('end_time') && (
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">
                        {selectedType === 'HOTEL' ? 'Check-out Time' : 'Arrival / End Time'}
                      </label>
                      <input
                        type="time"
                        value={form.end_time}
                        onChange={e => handleFormChange('end_time', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Provider */}
                  {typeConfig.fields.includes('provider') && (
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Operator / Provider</label>
                      <input
                        value={form.provider}
                        onChange={e => handleFormChange('provider', e.target.value)}
                        placeholder={typeConfig.placeholders.provider || 'Provider name'}
                        className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm placeholder-[#475569] focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Confirmation Number */}
                  {typeConfig.fields.includes('confirmation_number') && (
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Confirmation No. / PNR</label>
                      <input
                        value={form.confirmation_number}
                        onChange={e => handleFormChange('confirmation_number', e.target.value)}
                        placeholder={typeConfig.placeholders.confirmation_number || 'CONF-1234'}
                        className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm placeholder-[#475569] focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Cost */}
                  {typeConfig.fields.includes('cost') && (
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">Cost (₹)</label>
                      <input
                        type="number"
                        value={form.cost}
                        onChange={e => handleFormChange('cost', e.target.value)}
                        placeholder="e.g. 4500"
                        className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm placeholder-[#475569] focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_important}
                      onChange={e => handleFormChange('is_important', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-xs font-bold text-[#94a3b8]">⭐ Important booking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_refundable}
                      onChange={e => handleFormChange('is_refundable', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-xs font-bold text-[#94a3b8]">Refundable</span>
                  </label>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <AlertCircle size={14} /> {submitError}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleAddBooking}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.01]"
                  >
                    <Plus size={16} /> Add to Itinerary
                  </button>
                  <button
                    onClick={() => { setSelectedType(null); setForm(emptyForm()); }}
                    className="px-5 py-3.5 rounded-xl text-sm font-bold text-[#94a3b8] border border-[#1c2942] hover:border-[#2d4070] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* + Add Another Booking Button */}
            {!selectedType && savedBookings.length > 0 && (
              <button
                onClick={() => setSelectedType('FLIGHT')}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#1c2942] hover:border-blue-500/50 text-sm font-bold text-[#64748b] hover:text-blue-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Another Booking
              </button>
            )}
          </div>
        )}

        {/* ══ PDF UPLOAD TAB ════════════════════════════════════════════════ */}
        {activeTab === 'pdf' && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-7 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-blue-400 tracking-wider mb-2">
                  <Sparkles size={15} />
                  AI Extraction — Gemini 1.5 Flash + Groq Llama 3.1
                </div>
                <h3 className="text-lg font-bold text-white">Upload Booking Confirmation</h3>
                <p className="text-xs text-[#94a3b8] mt-1">
                  Drop a flight ticket, IRCTC printout, hotel booking, or any travel confirmation PDF/image.
                  AI will extract all details — you confirm before saving.
                </p>
              </div>

              {/* Drag-drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`py-14 px-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-[#1c2942] bg-[#080d1a] hover:border-blue-500/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                {isExtracting ? (
                  <>
                    <Loader2 size={36} className="text-blue-400 animate-spin mb-3" />
                    <div className="text-sm font-bold text-white">AI is reading your document...</div>
                    <div className="text-xs text-[#64748b] mt-1">Gemini 1.5 Flash extracting booking details</div>
                  </>
                ) : uploadedFile ? (
                  <>
                    <FileText size={36} className="text-emerald-400 mb-3" />
                    <div className="text-sm font-bold text-white">{uploadedFile.name}</div>
                    <div className="text-xs text-[#64748b] mt-1">Click to upload a different file</div>
                  </>
                ) : (
                  <>
                    <UploadCloud size={36} className="text-blue-400 mb-3" />
                    <div className="text-sm font-bold text-white">Drop booking confirmation here</div>
                    <div className="text-xs text-[#64748b] mt-1">Supports PDF, JPG, PNG (max 10MB)</div>
                  </>
                )}
              </div>

              {extractError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle size={14} /> {extractError}
                  <button className="ml-auto underline" onClick={() => setActiveTab('manual')}>Try manually</button>
                </div>
              )}

              {/* Extracted Booking Review */}
              {extractedBooking?.booking && (
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/30 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">AI Extracted — Review & Confirm</span>
                    <span className="ml-auto text-xs text-[#94a3b8]">Confidence: {Math.round((extractedBooking.confidence || 0) * 100)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {Object.entries(extractedBooking.booking).map(([k, v]) => v !== null && v !== undefined && v !== '' ? (
                      <div key={k} className="bg-[#080d1a] rounded-xl px-3 py-2.5">
                        <div className="text-[#64748b] font-bold uppercase text-[10px] mb-0.5">{k.replace(/_/g, ' ')}</div>
                        <div className="text-white font-mono text-xs">{String(v)}</div>
                      </div>
                    ) : null)}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmExtracted}
                      className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all"
                    >
                      ✅ Confirm & Add to Itinerary
                    </button>
                    <button
                      onClick={() => { setExtractedBooking(null); setUploadedFile(null); }}
                      className="px-4 py-3 rounded-xl text-sm font-bold text-[#94a3b8] border border-[#1c2942] hover:border-red-500/50 hover:text-red-400 transition-all"
                    >
                      ✗ Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ SAVED BOOKINGS LIST ════════════════════════════════════════════ */}
        {savedBookings.length > 0 && (
          <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1c2942]">
              <div>
                <h3 className="text-lg font-bold text-white">Itinerary Nodes</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  {savedBookings.length} booking{savedBookings.length > 1 ? 's' : ''} — dependency edges will be auto-computed
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Ready to Build
              </span>
            </div>

            <div className="space-y-3">
              {savedBookings.map((b, idx) => {
                const badgeCls = getTypeBadge(b.type);
                return (
                  <div key={b.id} className="p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#141e33] flex items-center justify-center text-xs font-mono font-bold text-blue-400 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeCls}`}>
                            {getTypeIcon(b.type)} {b.type}
                          </span>
                          {b.status === 'AI_EXTRACTED' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-purple-500/15 border-purple-500/40 text-purple-400">
                              🤖 AI
                            </span>
                          )}
                          {b.is_important && <span className="text-[10px] text-yellow-400">⭐</span>}
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5 truncate">{b.title}</div>
                        <div className="text-xs text-[#64748b]">
                          Day {Number(b.day_offset) + 1} • {b.start_time}{b.end_time ? ` → ${b.end_time}` : ''}
                          {b.provider ? ` • ${b.provider}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {b.cost && parseFloat(b.cost) > 0 && (
                        <span className="text-xs font-mono text-[#cbd5e1]">₹{parseFloat(b.cost).toLocaleString()}</span>
                      )}
                      <button
                        onClick={() => handleRemoveBooking(b.id)}
                        className="w-8 h-8 rounded-lg border border-[#1c2942] flex items-center justify-center text-[#475569] hover:text-red-400 hover:border-red-500/40 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertCircle size={14} /> {submitError}
              </div>
            )}

            <div className="pt-2 border-t border-[#1c2942]">
              <button
                onClick={handleBuildItinerary}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/50 transition-all hover:scale-[1.01] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Building dependency graph...</>
                ) : (
                  <><Zap size={16} /> Build My Connected Itinerary ({savedBookings.length} nodes)<ArrowRight size={14} /></>
                )}
              </button>
              <p className="text-center text-xs text-[#475569] mt-2">
                AI will auto-infer dependency edges between your bookings
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
