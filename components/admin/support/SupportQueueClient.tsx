'use client';

import React, { useState } from 'react';
import {
  Headphones,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  X,
  ExternalLink,
  MessageSquare,
  Package,
} from 'lucide-react';
import { SupportQueueData, SupportTicketItem, SupportMessageItem } from '@/lib/db/support';
import { brandConfig } from '@/config/brand.config';
import { toast } from '@/lib/store/useToast';

interface SupportQueueClientProps {
  initialData: SupportQueueData;
}

export function SupportQueueClient({ initialData }: SupportQueueClientProps) {
  const [data, setData] = useState<SupportQueueData>(initialData);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);

  // Reply Composer State
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Status Filter
  const filteredTickets = data.tickets.filter((t) => {
    if (activeFilter === 'ALL') return true;
    return t.status === activeFilter;
  });

  // Refresh Queue from server
  const handleRefresh = async () => {
    try {
      const res = await fetch('/api/admin/support/tickets');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (selectedTicket) {
          const updatedSelected = json.tickets.find((t: SupportTicketItem) => t.id === selectedTicket.id);
          if (updatedSelected) setSelectedTicket(updatedSelected);
        }
      }
    } catch (e) {
      console.warn('Could not refresh tickets:', e);
    }
  };

  // Submit Operator Reply
  const handleSendReply = async (newStatus?: string) => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsReplying(true);
    setReplyError(null);

    try {
      const res = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          content: replyText,
          newStatus: newStatus || selectedTicket.status,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to send reply');
      }

      const newMsg: SupportMessageItem = json.message;
      const updatedStatus = (newStatus || selectedTicket.status) as any;

      const updatedTicket: SupportTicketItem = {
        ...selectedTicket,
        status: updatedStatus,
        messageCount: selectedTicket.messageCount + 1,
        lastMessage: newMsg.content,
        lastMessageRole: 'agent',
        updatedAt: new Date().toISOString(),
        resolvedAt: updatedStatus === 'RESOLVED' || updatedStatus === 'CLOSED' ? new Date().toISOString() : selectedTicket.resolvedAt,
        messages: [...selectedTicket.messages, newMsg],
      };

      setSelectedTicket(updatedTicket);
      setData((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
      }));
      setReplyText('');
      toast.success(
        updatedStatus === 'RESOLVED'
          ? 'Reply sent & ticket marked as Resolved.'
          : 'Concierge reply transmitted to client.',
        'Support Ticket'
      );
    } catch (err: any) {
      const msg = err.message || 'Error replying to ticket';
      setReplyError(msg);
      toast.error(msg, 'Reply Error');
    } finally {
      setIsReplying(false);
    }
  };

  // Change Ticket Status
  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updatedTicket: SupportTicketItem = {
          ...selectedTicket,
          status: status as any,
          resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date().toISOString() : selectedTicket.resolvedAt,
        };
        setSelectedTicket(updatedTicket);
        setData((prev) => ({
          ...prev,
          tickets: prev.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
        }));
        toast.success(`Ticket status updated to ${status}.`, 'Ticket Updated');
      } else {
        toast.error('Failed to update ticket status.', 'Error');
      }
    } catch (e: any) {
      console.warn('Error updating ticket status:', e);
      toast.error(e?.message || 'Error updating ticket status.', 'Status Error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5">
            <AlertTriangle size={11} className="text-rose-400 animate-pulse" /> Escalated (Urgent)
          </span>
        );
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5">
            <Clock size={11} /> Open
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
            <CheckCircle2 size={11} /> Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-ondark/50 bg-bg-primary border border-hairline px-2 py-0.5">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* 1. Header Section */}
      <div className="border-b border-hairline pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Client Concierge & Support
          </span>
          <h1 className="font-serif text-3xl font-light text-text-ondark tracking-tight mt-1">
            Support Queue & Inquiries
          </h1>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 border border-hairline bg-bg-deep text-text-ondark/70 hover:text-text-ondark text-xs uppercase tracking-wider transition-colors"
        >
          <RefreshCw size={13} /> Refresh Queue
        </button>
      </div>

      {/* 2. Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
          <span className="text-[10px] uppercase tracking-widest text-text-ondark/50 block">
            Total Tickets
          </span>
          <span className="font-serif text-2xl font-light text-text-ondark">
            {data.metrics.totalTickets}
          </span>
        </div>

        <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
          <span className="text-[10px] uppercase tracking-widest text-amber-400/80 block">
            Open Inquiries
          </span>
          <span className="font-serif text-2xl font-light text-amber-400">
            {data.metrics.openTickets}
          </span>
        </div>

        <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
          <span className="text-[10px] uppercase tracking-widest text-rose-400/80 block">
            Escalated to Human
          </span>
          <span className="font-serif text-2xl font-light text-rose-400">
            {data.metrics.escalatedTickets}
          </span>
        </div>

        <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
          <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 block">
            Avg Resolution Time
          </span>
          <span className="font-serif text-2xl font-light text-emerald-400">
            {data.metrics.avgResolutionTimeMinutes}m
          </span>
        </div>
      </div>

      {/* 3. Filter Tabs & Tickets Table */}
      <div className="border border-hairline bg-bg-deep rounded-md shadow-sm overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="p-4 sm:p-6 border-b border-hairline flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="text-text-ondark/40" />
            <span className="text-xs text-text-ondark font-medium">Filter Queue:</span>
            {['ALL', 'ESCALATED', 'OPEN', 'RESOLVED', 'CLOSED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 text-xs border transition-all ${
                  activeFilter === tab
                    ? 'border-accent-brass bg-accent-brass/15 text-accent-brass font-medium'
                    : 'border-hairline text-text-ondark/60 hover:text-text-ondark'
                }`}
              >
                {tab === 'ALL' ? 'All Tickets' : tab}
              </button>
            ))}
          </div>

          <span className="text-xs text-text-ondark/40 font-light">
            Showing {filteredTickets.length} tickets
          </span>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-ondark/50 space-y-2">
            <Headphones size={24} className="mx-auto text-accent-brass/40" />
            <p>No support tickets match the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-hairline bg-bg-primary/50 text-[10px] uppercase tracking-[0.2em] text-text-ondark/60 font-medium">
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Messages</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  const dateStr = new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={ticket.id}
                      className={`hover:bg-bg-primary/40 transition-colors ${
                        isSelected ? 'bg-bg-primary/60' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-medium text-text-ondark whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p>{ticket.customerName}</p>
                          <p className="text-[11px] text-text-ondark/50 font-light">
                            {ticket.customerEmail}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-text-ondark/90 font-light truncate">
                          {ticket.subject}
                        </p>
                        {ticket.lastMessage && (
                          <p className="text-[11px] text-text-ondark/40 truncate font-light mt-0.5">
                            {ticket.lastMessageRole === 'customer'
                              ? 'Client: '
                              : ticket.lastMessageRole === 'assistant'
                              ? 'AI: '
                              : 'Agent: '}
                            {ticket.lastMessage}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-text-ondark/70">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={12} className="text-text-ondark/40" />
                          {ticket.messageCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-[11px] text-text-ondark/50 font-light">
                        {dateStr}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-3 py-1.5 bg-bg-primary border border-hairline text-text-ondark hover:border-accent-brass hover:text-accent-brass text-[11px] tracking-wider uppercase transition-colors"
                        >
                          View Thread →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Slide-over / Modal Interactive Conversation Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-bg-deep/80 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-bg-deep border-l border-hairline w-full max-w-2xl h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-hairline flex items-center justify-between">
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-accent-brass">
                    Ticket #{selectedTicket.id.slice(-6).toUpperCase()}
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <h3 className="font-serif text-lg text-text-ondark font-light truncate">
                  {selectedTicket.subject}
                </h3>
                <p className="text-xs text-text-ondark/60 font-light">
                  {selectedTicket.customerName} ({selectedTicket.customerEmail})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-text-ondark/60 hover:text-text-ondark border border-hairline shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Selector Bar */}
            <div className="px-6 py-3 border-b border-hairline bg-bg-primary/40 flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase tracking-wider text-text-ondark/60">
                Update Status:
              </span>
              <div className="flex gap-1.5">
                {(['OPEN', 'ESCALATED', 'RESOLVED', 'CLOSED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border transition-colors ${
                      selectedTicket.status === st
                        ? 'border-accent-brass bg-accent-brass/20 text-accent-brass font-medium'
                        : 'border-hairline text-text-ondark/50 hover:text-text-ondark'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedTicket.messages.map((msg) => {
                const isCustomer = msg.role === 'customer';
                const isAssistant = msg.role === 'assistant';
                const isAgent = msg.role === 'agent';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isAgent ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Role Header */}
                    <div className="flex items-center gap-1.5 text-[10px] text-text-ondark/40 mb-1 px-1">
                      {isCustomer ? (
                        <>
                          <User size={11} /> <span>{selectedTicket.customerName}</span>
                        </>
                      ) : isAssistant ? (
                        <>
                          <Sparkles size={11} className="text-accent-brass" />{' '}
                          <span className="text-accent-brass">AI Concierge</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={11} className="text-emerald-400" />{' '}
                          <span className="text-emerald-400">Concierge Officer</span>
                        </>
                      )}
                      <span>·</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message Body */}
                    <div
                      className={`max-w-lg p-4 text-xs font-light leading-relaxed whitespace-pre-line border ${
                        isAgent
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                          : isAssistant
                          ? 'bg-accent-brass/5 border-accent-brass/30 text-text-ondark/90'
                          : 'bg-bg-primary border-hairline text-text-ondark/80'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer */}
            <div className="p-6 border-t border-hairline bg-bg-deep space-y-3">
              {replyError && (
                <p className="text-xs text-red-400">{replyError}</p>
              )}

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the client as Concierge Officer..."
                rows={3}
                className="w-full bg-bg-primary border border-hairline p-3 text-xs text-text-ondark focus:border-accent-brass focus:outline-none resize-none font-light"
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSendReply('RESOLVED')}
                  disabled={isReplying || !replyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs uppercase tracking-wider font-medium disabled:opacity-40"
                >
                  <CheckCircle2 size={13} /> Reply & Mark Resolved
                </button>

                <button
                  type="button"
                  onClick={() => handleSendReply()}
                  disabled={isReplying || !replyText.trim()}
                  className="flex items-center gap-1.5 px-6 py-2 bg-accent-brass text-bg-primary hover:bg-accent-brass-hover text-xs uppercase tracking-wider font-medium disabled:opacity-40"
                >
                  {isReplying ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
