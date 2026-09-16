'use client';

import React from 'react';
import {
  X,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Send,
} from 'lucide-react';
import { SupportTicketItem } from '@/lib/db/support';

interface SupportTicketDrawerProps {
  ticket: SupportTicketItem | null;
  replyText: string;
  isReplying: boolean;
  replyError: string | null;
  getStatusBadge: (status: string) => React.ReactNode;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
  onReplyTextChange: (text: string) => void;
  onSendReply: (status?: string) => void;
}

export function SupportTicketDrawer({
  ticket,
  replyText,
  isReplying,
  replyError,
  getStatusBadge,
  onClose,
  onUpdateStatus,
  onReplyTextChange,
  onSendReply,
}: SupportTicketDrawerProps) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg-deep/80 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-bg-deep border-l border-hairline w-full max-w-2xl h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-6 border-b border-hairline flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass">
                Ticket #{ticket.id.slice(-6).toUpperCase()}
              </span>
              {getStatusBadge(ticket.status)}
            </div>
            <h3 className="font-serif text-lg text-text-ondark font-light truncate">
              {ticket.subject}
            </h3>
            <p className="text-xs text-text-ondark/60 font-light">
              {ticket.customerName} ({ticket.customerEmail})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-ondark/60 hover:text-text-ondark border border-hairline shrink-0 cursor-pointer"
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
                type="button"
                onClick={() => onUpdateStatus(st)}
                className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${
                  ticket.status === st
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
          {ticket.messages.map((msg) => {
            const isCustomer = msg.role === 'customer';
            const isAssistant = msg.role === 'assistant';
            const isAgent = msg.role === 'agent';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
              >
                {/* Role Header */}
                <div className="flex items-center gap-1.5 text-[10px] text-text-ondark/40 mb-1 px-1">
                  {isCustomer ? (
                    <>
                      <User size={11} /> <span>{ticket.customerName}</span>
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
          {replyError && <p className="text-xs text-red-400">{replyError}</p>}

          <textarea
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Type your response to the client as Concierge Officer..."
            rows={3}
            className="w-full bg-bg-primary border border-hairline p-3 text-xs text-text-ondark focus:border-accent-brass focus:outline-none resize-none font-light"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSendReply('RESOLVED')}
              disabled={isReplying || !replyText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs uppercase tracking-wider font-medium disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 size={13} /> Reply & Mark Resolved
            </button>

            <button
              type="button"
              onClick={() => onSendReply()}
              disabled={isReplying || !replyText.trim()}
              className="flex items-center gap-1.5 px-6 py-2 bg-accent-brass text-bg-primary hover:bg-accent-brass-hover text-xs uppercase tracking-wider font-medium disabled:opacity-40 cursor-pointer"
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
  );
}
