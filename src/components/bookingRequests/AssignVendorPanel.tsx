import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Paper,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { UserPlus, Send, Ban, Store, Search, Check, ChevronDown, X, Sparkles } from "lucide-react";
import { bookingRequestService } from "@/services/bookingRequestService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { SuggestedVendorsResponse, SuggestedVendor } from "@/types/bookingRequest";
import { toast } from "sonner";

interface VendorSearchSelectProps {
  vendors: SuggestedVendor[];
  selectedVendorId: string;
  onSelectVendor: (id: string) => void;
  onRequestCreateNew: (suggestedName?: string) => void;
  disabled?: boolean;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;
  const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#EDE9FE] text-[#6D28D9] font-bold rounded-[2px] px-0.5">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

function VendorSearchSelect({
  vendors,
  selectedVendorId,
  onSelectVendor,
  onRequestCreateNew,
  disabled = false,
}: VendorSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "suggested">("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedVendor = useMemo(
    () => vendors.find((v) => String(v.id) === selectedVendorId),
    [vendors, selectedVendorId],
  );

  const hasSuggestedVendors = useMemo(() => vendors.some((v) => v.is_suggested), [vendors]);

  const normalize = (str?: string | null) => (str || "").toLowerCase().replace(/[-_]/g, " ").trim();

  // Filter while preserving original ordering (best category matches are listed first)
  const filteredVendors = useMemo(() => {
    const q = normalize(searchQuery);
    const tokens = q.split(/\s+/).filter(Boolean);

    return vendors.filter((v) => {
      if (filterTab === "suggested" && !v.is_suggested) {
        return false;
      }
      if (tokens.length === 0) return true;

      const bName = normalize(v.business_name);
      const subCat = normalize(v.service_sub_category);
      const cat = normalize(v.service_category);
      const city = normalize(v.city);

      return tokens.every(
        (tok) =>
          bName.includes(tok) || subCat.includes(tok) || cat.includes(tok) || city.includes(tok),
      );
    });
  }, [vendors, searchQuery, filterTab]);

  // Focus search input on open and reset query/tab on close
  useEffect(() => {
    if (isOpen) {
      const currentIdx = vendors.findIndex((v) => String(v.id) === selectedVendorId);
      setActiveIndex(currentIdx >= 0 ? currentIdx : 0);
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    } else {
      setSearchQuery("");
      setFilterTab("all");
    }
  }, [isOpen, selectedVendorId, vendors]);

  // Auto-scroll active keyboard item into view
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
      if (activeEl && typeof activeEl.scrollIntoView === "function") {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (filteredVendors.length ? (prev + 1) % filteredVendors.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        filteredVendors.length ? (prev - 1 + filteredVendors.length) % filteredVendors.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (filteredVendors[activeIndex]) {
        onSelectVendor(String(filteredVendors[activeIndex].id));
        setIsOpen(false);
        triggerRef.current?.focus();
      } else if (filteredVendors.length === 0) {
        onRequestCreateNew(searchQuery.trim());
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full" ref={containerRef}>
      <div className="relative w-full">
        {/* Floating Outline Label */}
        <label
          className={`absolute -top-2 left-2.5 px-1 bg-white text-[11px] font-semibold transition-colors pointer-events-none z-10 leading-none ${
            isOpen ? "text-[#7C3AED]" : selectedVendor ? "text-[#4B5563]" : "text-[#6B7280]"
          }`}
        >
          Assign to an existing vendor
        </label>

        {/* Dropdown Trigger */}
        <div
          ref={triggerRef}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          className={`relative w-full min-h-[40px] px-3 py-2 bg-white border rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none transition-all outline-none ${
            isOpen
              ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs"
              : "border-[#D1D5DB] hover:border-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
          } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}`}
        >
          {selectedVendor ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Store size={15} className="text-[#7C3AED] shrink-0" />
              <span className="font-semibold text-[13px] text-[#111827] truncate">
                {selectedVendor.business_name}
              </span>
              <span className="text-[12px] text-[#6B7280] capitalize truncate">
                {(
                  selectedVendor.service_sub_category ||
                  selectedVendor.service_category ||
                  "No category"
                ).replace(/-/g, " ")}
              </span>
              {selectedVendor.is_suggested ? (
                <span className="text-[10px] font-bold text-[#137333] bg-[#E6F4EA] rounded px-1.5 py-0.5 shrink-0">
                  MATCH
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-[13px] text-[#9CA3AF]">Select a vendor to assign...</span>
          )}

          <div className="flex items-center gap-1 shrink-0">
            {selectedVendor && !disabled && (
              <button
                type="button"
                title="Clear selection"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVendor("");
                }}
                className="p-1 hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#4B5563] rounded transition-colors"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={`text-[#6B7280] transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#7C3AED]" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl shadow-purple-950/10 overflow-hidden flex flex-col"
            style={{ maxHeight: "380px" }}
          >
            {/* Search Header */}
            <div className="p-2.5 border-b border-[#F3F4F6] bg-white sticky top-0 z-10 flex flex-col gap-2">
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3 text-[#9CA3AF] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search by vendor name or category..."
                  className="w-full pl-9 pr-8 py-2 text-[13px] bg-[#F9FAFB] hover:bg-[#F3F4F6] focus:bg-white border border-[#E5E7EB] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 rounded-lg outline-none transition-all placeholder:text-[#9CA3AF]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveIndex(0);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1 text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#E5E7EB]/50 rounded transition-colors"
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Quick Filter Tabs & Count */}
              <div className="flex items-center justify-between px-0.5 text-[11px]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTab("all");
                      setActiveIndex(0);
                    }}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                      filterTab === "all"
                        ? "bg-[#EDE9FE] text-[#7C3AED]"
                        : "text-[#6B7280] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    All ({vendors.length})
                  </button>
                  {hasSuggestedVendors && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTab("suggested");
                        setActiveIndex(0);
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        filterTab === "suggested"
                          ? "bg-[#E6F4EA] text-[#137333]"
                          : "text-[#6B7280] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      <Sparkles size={11} className="text-[#137333]" />
                      Matched Categories ({vendors.filter((v) => v.is_suggested).length})
                    </button>
                  )}
                </div>
                <span className="text-[#9CA3AF] font-medium">
                  {filteredVendors.length} {filteredVendors.length === 1 ? "result" : "results"}
                </span>
              </div>
            </div>

            {/* Vendor List */}
            <div
              ref={listRef}
              role="listbox"
              className="overflow-y-auto flex-1 divide-y divide-[#F9FAFB] p-1 focus:outline-none"
              style={{ maxHeight: "250px" }}
            >
              {filteredVendors.length > 0 ? (
                filteredVendors.map((v, index) => {
                  const isSelected = String(v.id) === selectedVendorId;
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={v.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelectVendor(String(v.id));
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 text-left ${
                        isActive
                          ? "bg-[#F5F3FF] text-[#111827]"
                          : isSelected
                            ? "bg-[#F9FAFB] text-[#111827]"
                            : "hover:bg-[#F9FAFB] text-[#374151]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            v.is_suggested
                              ? "bg-[#E6F4EA] text-[#137333]"
                              : "bg-[#F5F3FF] text-[#7C3AED]"
                          }`}
                        >
                          <Store size={14} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[13px] text-[#111827] truncate">
                              <HighlightMatch text={v.business_name} query={searchQuery} />
                            </span>
                            {v.is_suggested ? (
                              <span className="text-[10px] font-bold text-[#137333] bg-[#E6F4EA] rounded px-1.5 py-0.5 shrink-0 inline-flex items-center gap-0.5">
                                MATCH
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#6B7280] truncate mt-0.5">
                            <span className="capitalize truncate">
                              <HighlightMatch
                                text={(
                                  v.service_sub_category ||
                                  v.service_category ||
                                  "No category"
                                ).replace(/-/g, " ")}
                                query={searchQuery}
                              />
                            </span>
                            {v.city ? (
                              <span className="text-[#9CA3AF] shrink-0">• {v.city}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty State */
                <div className="py-7 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED] mb-2.5">
                    <Search size={18} />
                  </div>
                  <p className="text-[13px] font-bold text-[#111827]">
                    No vendors matching &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5 max-w-[260px]">
                    No active vendors match this business name or service category.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onRequestCreateNew(searchQuery.trim());
                    }}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#7C3AED] bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-lg border border-[#DDD6FE] transition-colors cursor-pointer"
                  >
                    <UserPlus size={13} />
                    Create new vendor &amp; assign
                  </button>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Footer */}
            <div className="px-3 py-2 bg-[#F9FAFB] border-t border-[#F3F4F6] text-[11px] text-[#9CA3AF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded text-[10px] font-mono text-[#6B7280]">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded text-[10px] font-mono text-[#6B7280] ml-0.5">
                    ↓
                  </kbd>{" "}
                  navigate
                </span>
                <span>•</span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded text-[10px] font-mono text-[#6B7280]">
                    ↵
                  </kbd>{" "}
                  select
                </span>
              </div>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded text-[10px] font-mono text-[#6B7280]">
                  esc
                </kbd>{" "}
                close
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between text-[12px] text-[#6B7280] px-1">
        <span>Best category matches are listed first.</span>
        {vendors.length > 0 ? (
          <span className="text-[11px] text-[#9CA3AF]">
            {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} available
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface AssignVendorPanelProps {
  leadId: number;
  onAssigned: () => void;
}

const emptyNewVendor = {
  business_name: "",
  full_name: "",
  email: "",
  mobile_number: "",
  business_type: "residential" as "residential" | "commercial",
};

function apiMessage(err: unknown, fallback: string): string {
  const apiErr = err as { response?: { data?: { message?: string } } };
  return apiErr?.response?.data?.message || fallback;
}

export function AssignVendorPanel({ leadId, onAssigned }: AssignVendorPanelProps) {
  const [suggestions, setSuggestions] = useState<SuggestedVendorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [note, setNote] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVendor, setNewVendor] = useState(emptyNewVendor);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingRequestService.getSuggestedVendors(leadId);
      setSuggestions(data);
      // With no vendors to pick from, the create-vendor path is the only way forward.
      if (data.total_active_vendors === 0) {
        setShowCreateForm(true);
      }
    } catch (err) {
      toast.error(apiMessage(err, "Failed to load suggested vendors"));
      setSuggestions({
        vendors: [],
        total_active_vendors: 0,
        derived_service: { service_category: null, service_sub_category: null },
      });
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      toast.error("Select a vendor to assign this request to");
      return;
    }

    setSubmitting(true);
    try {
      await bookingRequestService.assign(leadId, Number(selectedVendorId), note);
      toast.success("Booking request assigned successfully");
      onAssigned();
    } catch (err) {
      toast.error(apiMessage(err, "Failed to assign booking request"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await bookingRequestService.createVendorAndAssign(leadId, {
        ...newVendor,
        service_category: suggestions?.derived_service.service_category || undefined,
        service_sub_category: suggestions?.derived_service.service_sub_category || undefined,
        note: note || undefined,
      });
      toast.success(`${result.vendor.business_name} created and request assigned`);
      onAssigned();
    } catch (err) {
      toast.error(apiMessage(err, "Failed to create vendor and assign request"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setRejectOpen(false);
    setSubmitting(true);
    try {
      await bookingRequestService.reject(leadId, rejectReason);
      toast.success("Booking request rejected");
      onAssigned();
    } catch (err) {
      toast.error(apiMessage(err, "Failed to reject booking request"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          border: "1px solid #E5E7EB",
          borderRadius: 4,
          boxShadow: "none",
          bgcolor: "#fff",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} sx={{ color: "#7C3AED" }} />
      </Paper>
    );
  }

  const hasVendors = (suggestions?.total_active_vendors ?? 0) > 0;
  const derived = suggestions?.derived_service;

  return (
    <>
      <Paper
        sx={{
          p: 3,
          border: "1px solid #E5E7EB",
          borderRadius: 4,
          boxShadow: "none",
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <div>
          <h2 className="text-lg font-extrabold text-[#111827]">Assign this request</h2>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Once assigned the request becomes a pending quote in the vendor's own dashboard.
          </p>
        </div>

        {derived?.service_sub_category ? (
          <div className="text-[12px] text-[#6B7280]">
            Detected service:{" "}
            <span className="font-bold text-[#7C3AED] capitalize">
              {derived.service_sub_category.replace(/-/g, " ")}
            </span>
            {derived.service_category ? (
              <span className="capitalize"> ({derived.service_category.replace(/-/g, " ")})</span>
            ) : null}
          </div>
        ) : null}

        {!hasVendors ? (
          <Alert severity="warning" sx={{ borderRadius: 2, fontSize: 13 }}>
            There are no active vendors on the platform yet, so there is nothing to assign this
            request to. Create a new vendor below to take it on.
          </Alert>
        ) : (
          <form onSubmit={handleAssign} className="flex flex-col gap-3">
            <VendorSearchSelect
              vendors={suggestions?.vendors || []}
              selectedVendorId={selectedVendorId}
              onSelectVendor={(id) => setSelectedVendorId(id)}
              onRequestCreateNew={(name) => {
                setShowCreateForm(true);
                if (name) {
                  setNewVendor((prev) => ({ ...prev, business_name: name }));
                }
              }}
              disabled={submitting}
            />

            <TextField
              label="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={2}
              placeholder="Why this vendor, anything the record should remember..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !selectedVendorId}
              startIcon={<Send size={16} />}
              sx={{
                bgcolor: "#7C3AED",
                "&:hover": { bgcolor: "#6D28D9" },
                textTransform: "none",
                fontWeight: 700,
                alignSelf: "flex-start",
              }}
            >
              {submitting ? "Assigning..." : "Assign to vendor"}
            </Button>
          </form>
        )}

        <Divider />

        {!showCreateForm ? (
          <Button
            variant="outlined"
            onClick={() => setShowCreateForm(true)}
            startIcon={<UserPlus size={16} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#EDE9FE",
              color: "#7C3AED",
              alignSelf: "flex-start",
              "&:hover": { borderColor: "#DDD6FE", bgcolor: "#F5F3FF" },
            }}
          >
            Create new vendor &amp; assign
          </Button>
        ) : (
          <form onSubmit={handleCreateAndAssign} className="flex flex-col gap-3">
            <h3 className="text-[15px] font-extrabold text-[#111827]">
              Create new vendor &amp; assign
            </h3>
            <p className="text-[12px] text-[#6B7280] -mt-2">
              The vendor is onboarded with the service detected from this request and emailed a link
              to set their own password.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Business name"
                value={newVendor.business_name}
                onChange={(e) => setNewVendor({ ...newVendor, business_name: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Owner full name"
                value={newVendor.full_name}
                onChange={(e) => setNewVendor({ ...newVendor, full_name: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Email"
                type="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Mobile number"
                value={newVendor.mobile_number}
                onChange={(e) => setNewVendor({ ...newVendor, mobile_number: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                select
                label="Business type"
                value={newVendor.business_type}
                onChange={(e) =>
                  setNewVendor({
                    ...newVendor,
                    business_type: e.target.value as "residential" | "commercial",
                  })
                }
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
              </TextField>
            </div>

            {!derived?.service_sub_category ? (
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}>
                No service category could be detected from this request. Creating a vendor here will
                fail until the request names a known service &mdash; assign it to an existing vendor
                instead.
              </Alert>
            ) : null}

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={<UserPlus size={16} />}
                sx={{
                  bgcolor: "#7C3AED",
                  "&:hover": { bgcolor: "#6D28D9" },
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {submitting ? "Creating..." : "Create vendor & assign"}
              </Button>
              {hasVendors ? (
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewVendor(emptyNewVendor);
                  }}
                  disabled={submitting}
                  sx={{ textTransform: "none", color: "#4B5563" }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        )}

        <Divider />

        <div className="flex flex-col gap-2">
          <TextField
            label="Rejection reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            size="small"
            fullWidth
            placeholder="No coverage in this area and none can be arranged..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="outlined"
            color="error"
            disabled={submitting}
            onClick={() => setRejectOpen(true)}
            startIcon={<Ban size={16} />}
            sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
          >
            Reject request
          </Button>
        </div>
      </Paper>

      <ConfirmDialog
        open={rejectOpen}
        title="Reject booking request"
        message="The customer will not be matched with a provider for this request. Use this only when there is no coverage and none can be arranged."
        confirmText="Reject request"
        isDanger
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </>
  );
}
export default AssignVendorPanel;
