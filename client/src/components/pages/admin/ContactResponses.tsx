import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import {
  Mail,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Trash2,
  Loader2,
  Inbox,
  Eye,
} from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface ContactResponse {
  success: boolean;
  data: ContactSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ContactResponses() {
  useInitNavStackOnce([{ title: "Contact Responses", path: "/admin/contacts" }]);
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const res = await api.get<ContactResponse>(API_ROUTES.CONTACT.GET_ALL);
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(API_ROUTES.CONTACT.MARK_READ(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.CONTACT.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      setSelectedContact(null);
    },
  });

  const handleSelectContact = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      markReadMutation.mutate(contact.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const contacts = data?.data || [];
  const unreadCount = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Contact Responses
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              View and manage contact form submissions
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-xs font-medium">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-[var(--destructive)]">Failed to load contacts</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20">
              <Inbox className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                No contact submissions yet
              </h3>
              <p className="text-[var(--muted-foreground)]">
                When visitors submit the contact form, their messages will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact List */}
              <div className="lg:col-span-1 space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedContact?.id === contact.id
                        ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                        : contact.isRead
                        ? "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/50"
                        : "bg-[var(--primary)]/5 border-[var(--primary)]/30 hover:border-[var(--primary)]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          contact.isRead 
                            ? "bg-[var(--muted)]" 
                            : "bg-[var(--primary)]"
                        }`}>
                          <User className={`w-4 h-4 ${
                            contact.isRead 
                              ? "text-[var(--muted-foreground)]" 
                              : "text-[var(--primary-foreground)]"
                          }`} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${
                            contact.isRead 
                              ? "text-[var(--foreground)]" 
                              : "text-[var(--primary)]"
                          }`}>
                            {contact.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                      {!contact.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {contact.subject}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {formatDate(contact.createdAt)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact Detail */}
              <div className="lg:col-span-2">
                {selectedContact ? (
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 pb-6 border-b border-[var(--border)]">
                      <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                          {selectedContact.subject}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(selectedContact.createdAt)}
                          </span>
                          {selectedContact.isRead && (
                            <span className="flex items-center gap-1 text-green-500">
                              <Eye className="w-4 h-4" />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this message?")) {
                            deleteMutation.mutate(selectedContact.id);
                          }
                        }}
                        className="p-2 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Sender Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/50 rounded-lg">
                        <User className="w-5 h-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)]">Name</p>
                          <p className="font-medium text-[var(--foreground)]">{selectedContact.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/50 rounded-lg">
                        <Mail className="w-5 h-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)]">Email</p>
                          <a 
                            href={`mailto:${selectedContact.email}`}
                            className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                          >
                            {selectedContact.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/50 rounded-lg">
                        <Phone className="w-5 h-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)]">Phone</p>
                          <p className="font-medium text-[var(--foreground)]">
                            {selectedContact.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-[var(--muted)]/30 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                        <span className="font-semibold text-[var(--foreground)]">Message</span>
                      </div>
                      <p className="text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                        {selectedContact.message}
                      </p>
                    </div>

                    {/* Actions */}
                    {/* <div className="flex gap-3 mt-6">
                      <a
                        href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                        className="btn flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Reply via Email
                      </a>
                    </div> */}
                  </div>
                ) : (
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                      Select a message
                    </h3>
                    <p className="text-[var(--muted-foreground)]">
                      Click on a contact submission to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
