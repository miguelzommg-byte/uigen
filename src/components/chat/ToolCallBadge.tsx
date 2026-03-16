"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolInvocation: {
    toolName: string;
    args: unknown;
    state: string;
    result?: unknown;
  };
}

export function getToolCallLabel(
  toolName: string,
  args: unknown,
  isDone: boolean
): string {
  const a = args as Record<string, string> | null | undefined;
  const command = a?.command;
  const path = a?.path ?? "";
  const newPath = a?.new_path ?? "";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return isDone ? `Created ${path}` : `Creating ${path}`;
      case "str_replace":
      case "insert":
        return isDone ? `Modified ${path}` : `Modifying ${path}`;
      case "view":
        return `Reading ${path}`;
      case "undo_edit":
        return isDone ? `Undid edit on ${path}` : `Undoing edit on ${path}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return isDone
          ? `Renamed ${path} to ${newPath}`
          : `Renaming ${path} to ${newPath}`;
      case "delete":
        return isDone ? `Deleted ${path}` : `Deleting ${path}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone =
    toolInvocation.state === "result" && toolInvocation.result != null;
  const label = getToolCallLabel(
    toolInvocation.toolName,
    toolInvocation.args,
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
