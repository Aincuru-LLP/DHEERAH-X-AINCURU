import React, { useEffect, useMemo, useState } from 'react';
import { Edit, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { ShippingAddress } from '../types';

const blankAddress = (seed: Partial<ShippingAddress> = {}): ShippingAddress => ({
  fullName: seed.fullName ?? '',
  email: seed.email ?? '',
  phone: seed.phone ?? '',
  line1: seed.line1 ?? '',
  line2: seed.line2 ?? '',
  city: seed.city ?? '',
  state: seed.state ?? '',
  postalCode: seed.postalCode ?? '',
  country: seed.country ?? 'India'
});

type Errors = Partial<Record<keyof ShippingAddress, string>>;

const validate = (a: ShippingAddress): Errors => {
  const e: Errors = {};
  if (!a.fullName.trim()) e.fullName = 'Required';
  if (!a.phone.trim()) e.phone = 'Required';
  else if (!/^[0-9+\-\s()]{7,}$/.test(a.phone)) e.phone = 'Invalid phone number';
  if (!a.line1.trim()) e.line1 = 'Required';
  if (!a.city.trim()) e.city = 'Required';
  if (!a.state.trim()) e.state = 'Required';
  if (!a.postalCode.trim()) e.postalCode = 'Required';
  else if (!/^[0-9A-Za-z\- ]{4,}$/.test(a.postalCode)) e.postalCode = 'Invalid postal code';
  if (!a.country.trim()) e.country = 'Required';
  return e;
};

/**
 * Address book combo. Today the backend only persists a single
 * `defaultAddress` on the user doc, so we render a 1-item list. The list-vs-form
 * pattern is intentional so the future array-of-addresses refactor is local.
 */
const AddressBookEditor: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const stored = useMemo<ShippingAddress[]>(
    () => (user?.defaultAddress ? [user.defaultAddress] : []),
    [user?.defaultAddress]
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ShippingAddress>(() =>
    blankAddress({ fullName: user?.fullName, email: user?.email, phone: user?.phone })
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // When not actively editing, mirror the stored value so external profile
  // updates (e.g. checkout saving an address) propagate into the form.
  useEffect(() => {
    if (!editing) {
      setDraft(
        stored[0] ?? blankAddress({ fullName: user?.fullName, email: user?.email, phone: user?.phone })
      );
      setErrors({});
      setSubmitError(null);
    }
  }, [editing, stored, user?.fullName, user?.email, user?.phone]);

  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(id);
  }, [success]);

  if (!user) return null;

  const setField = <K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) => {
    setDraft(d => ({ ...d, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleStartEdit = () => {
    setDraft(stored[0] ?? blankAddress({ fullName: user.fullName, email: user.email, phone: user.phone }));
    setErrors({});
    setSubmitError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    setSubmitError(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const v = validate(draft);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSaving(true);
    try {
      await updateProfile({
        defaultAddress: {
          ...draft,
          email: draft.email || user.email,
          line2: draft.line2?.trim() ? draft.line2.trim() : undefined
        }
      });
      setEditing(false);
      setSuccess('Address saved.');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to save your address.');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-[#FDFBF7] border border-[#E8D7BD] p-5 md:p-7 rounded shadow-sm">
        <h2 className="text-[13px] font-bold uppercase tracking-widest mb-4 text-[#CC9E00]">
          {stored[0] ? 'Edit Atelier Address' : 'Add Delivery Address'}
        </h2>
        <form onSubmit={handleSave} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.fullName} cols={2}>
            <input
              className="input-box bg-white"
              value={draft.fullName}
              onChange={e => setField('fullName', e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Phone Number" error={errors.phone} cols={2}>
            <input
              className="input-box bg-white"
              type="tel"
              value={draft.phone}
              onChange={e => setField('phone', e.target.value)}
              autoComplete="tel"
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Address Line 1" error={errors.line1} cols={2}>
            <input
              className="input-box bg-white"
              value={draft.line1}
              onChange={e => setField('line1', e.target.value)}
              autoComplete="address-line1"
            />
          </Field>
          <Field label="Address Line 2 (optional)" cols={2}>
            <input
              className="input-box bg-white"
              value={draft.line2 ?? ''}
              onChange={e => setField('line2', e.target.value)}
              autoComplete="address-line2"
            />
          </Field>
          <Field label="City" error={errors.city}>
            <input
              className="input-box bg-white"
              value={draft.city}
              onChange={e => setField('city', e.target.value)}
              autoComplete="address-level2"
            />
          </Field>
          <Field label="State" error={errors.state}>
            <input
              className="input-box bg-white"
              value={draft.state}
              onChange={e => setField('state', e.target.value)}
              autoComplete="address-level1"
            />
          </Field>
          <Field label="PIN Code" error={errors.postalCode}>
            <input
              className="input-box bg-white"
              value={draft.postalCode}
              onChange={e => setField('postalCode', e.target.value)}
              autoComplete="postal-code"
            />
          </Field>
          <Field label="Country" error={errors.country}>
            <input
              className="input-box bg-white"
              value={draft.country}
              onChange={e => setField('country', e.target.value)}
              autoComplete="country-name"
            />
          </Field>

          {submitError && (
            <p
              role="alert"
              className="sm:col-span-2 text-[13px] font-medium text-[#C7042B] bg-[#FAF7F0] border border-[#C7042B]/30 px-3.5 py-2 rounded"
            >
              {submitError}
            </p>
          )}

          <div className="sm:col-span-2 flex flex-wrap gap-3 mt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Address'}
            </button>
            <button type="button" onClick={handleCancel} disabled={saving} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] border border-[#E8D7BD] p-5 md:p-7 rounded shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#CC9E00]">
          Saved Atelier Addresses
          <span className="text-[12px] font-medium text-[#78716A] ml-2">
            {stored.length}
          </span>
        </h2>
        {stored.length === 0 && (
          <button
            onClick={handleStartEdit}
            className="text-[12px] font-bold uppercase tracking-wider text-[#C7042B] inline-flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Address
          </button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mb-3 text-[12px] font-medium text-[#1C1A18] bg-[#FAF7F0] border border-[#CC9E00]/40 px-3 py-1.5 rounded inline-block"
        >
          {success}
        </p>
      )}

      {stored.length === 0 ? (
        <div className="border border-dashed border-[#E8D7BD] px-5 py-8 text-center max-w-md bg-[#FAF7F0] rounded">
          <MapPin className="w-10 h-10 mx-auto text-[#CC9E00]/60 mb-3" />
          <p className="font-serif text-[16px] text-[#1C1A18] mb-1">
            No Saved Address Yet
          </p>
          <p className="text-[12px] text-[#5A554E] mb-4">
            Add a shipping destination to enjoy express bespoke checkout.
          </p>
          <button onClick={handleStartEdit} className="btn-primary">
            Add Address
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {stored.map((addr, idx) => (
            <li
              key={`${addr.postalCode}-${idx}`}
              className="border border-[#E8D7BD] p-4 max-w-md bg-white rounded shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#1C1A18] truncate">
                    {addr.fullName}
                  </p>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FAF7F0] text-[#CC9E00] border border-[#CC9E00]/40 rounded mt-1">
                    Primary Destination
                  </span>
                </div>
                <button
                  onClick={handleStartEdit}
                  className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#C7042B] inline-flex items-center gap-1 hover:underline"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </div>
              <p className="text-[13px] text-[#1C1A18] whitespace-pre-line leading-relaxed">
                {addr.line1}
                {addr.line2 ? `\n${addr.line2}` : ''}
                {`\n${addr.city}, ${addr.state} ${addr.postalCode}`}
                {`\n${addr.country}`}
              </p>
              <p className="text-[12px] text-[#5A554E] mt-2">
                {addr.phone}
                {addr.email ? ` · ${addr.email}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}

      {submitError && (
        <p
          role="alert"
          className="mt-3 text-[13px] font-medium text-[#C7042B] bg-[#FAF7F0] border border-[#C7042B]/30 px-3 py-2 rounded"
        >
          {submitError}
        </p>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; error?: string; cols?: 1 | 2; children: React.ReactNode }> = ({
  label,
  error,
  cols = 1,
  children
}) => (
  <div className={cols === 2 ? 'sm:col-span-2' : ''}>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A554E] mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="text-[11px] text-[#C7042B] mt-1 font-medium">{error}</p>}
  </div>
);

export default AddressBookEditor;
