'use client';
import { useState } from 'react';
import { Button, FormField, Input, Select } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { ReportCards } from '@/components/organisms/ReportCards';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD6 · Promo codes. */
export default function PromoCodes() {
  const toast = useToast(); const [k, setK] = useState(0);
  const [f, setF] = useState({ code: '', discountType: 'PERCENT', value: '10', maxUses: '', validTo: '' });
  return (
    <>
      <PageTitle title="Promo codes & offers" description="Codes are validated server-side at checkout." />
      <ReportCards path={'admin/promo-codes'} reloadKey={k} cards={[
          { label: 'Promo codes', icon: 'gift', tone: 'indigo', query: '' },
          { label: 'Active', icon: 'check', tone: 'emerald', compute: (i) => i.filter((x) => x.active && (!x.validTo || new Date(x.validTo) >= new Date())).length },
          { label: 'Times used', icon: 'ticket', tone: 'teal', compute: (i) => i.reduce((s, x) => s + Number(x.usedCount ?? 0), 0) },
          { label: 'Expired', icon: 'close', tone: 'rose', compute: (i) => i.filter((x) => x.validTo && new Date(x.validTo) < new Date()).length },
        ]} />
      <Card>
        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}
          onSubmit={async (e) => { e.preventDefault(); try { await apiFetch('admin/promo-codes', { body: { code: f.code, discountType: f.discountType, value: Number(f.value), maxUses: f.maxUses ? Number(f.maxUses) : undefined, validTo: f.validTo ? new Date(f.validTo).toISOString() : undefined } }); toast('Promo code saved'); setF({ ...f, code: '' }); setK((x) => x + 1); } catch (err: any) { toast(err.message, 'error'); } }}>
          <FormField label="Code">{(id) => <Input id={id} required pattern="[A-Za-z0-9_-]{3,32}" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} />}</FormField>
          <FormField label="Type">{(id) => <Select id={id} value={f.discountType} onChange={(e) => setF({ ...f, discountType: e.target.value })}><option value="PERCENT">Percent</option><option value="FIXED">Fixed amount ($)</option></Select>}</FormField>
          <FormField label="Value">{(id) => <Input id={id} type="number" min={0} required value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />}</FormField>
          <FormField label="Max uses">{(id) => <Input id={id} type="number" min={1} value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} />}</FormField>
          <FormField label="Valid to">{(id) => <Input id={id} type="date" value={f.validTo} onChange={(e) => setF({ ...f, validTo: e.target.value })} />}</FormField>
          <Button type="submit" iconLeft="plus">Add code</Button>
        </form>
      </Card>
      <DataTable path="admin/promo-codes" reloadKey={k} columns={[{ key: 'code', label: 'Code' }, { key: 'discountType', label: 'Type' }, { key: 'value', label: 'Value' }, { key: 'usedCount', label: 'Used' }, { key: 'maxUses', label: 'Max' }, { key: 'validTo', label: 'Valid to', render: 'date' }, { key: 'active', label: 'Active', render: 'bool' }]} />
    </>
  );
}
